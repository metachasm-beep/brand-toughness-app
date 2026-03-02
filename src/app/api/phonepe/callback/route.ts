import { NextResponse } from 'next/server';
import { verifyPhonePeCallback } from '@/lib/payment/phonepe';
import { getPrisma } from '@/lib/db';

export async function POST(request: Request) {
    const prisma = await getPrisma();
    try {
        const formData = await request.formData();
        const response = formData.get('response') as string;
        const checksum = request.headers.get('x-verify') as string;

        if (!response || !checksum) {
            return NextResponse.json({ error: 'Missing response or checksum' }, { status: 400 });
        }

        const isValid = verifyPhonePeCallback(response, checksum);
        if (!isValid) {
            return NextResponse.json({ error: 'Invalid checksum' }, { status: 401 });
        }

        const decodedResponse = JSON.parse(Buffer.from(response, 'base64').toString('utf-8'));
        console.log('PhonePe Callback Decoded:', decodedResponse);

        if (decodedResponse.success && decodedResponse.code === 'PAYMENT_SUCCESS') {
            const transactionId = decodedResponse.data.merchantTransactionId;
            // In a real app, you'd match this transactionId in your DB.
            // For now, let's look for a user by email (passed in userId earlier)
            const userEmail = decodedResponse.data.merchantUserId;

            if (userEmail && userEmail.includes('@')) {
                await prisma.user.update({
                    where: { email: userEmail },
                    data: { tier: 'PRO' }
                });
                console.log(`User ${userEmail} upgraded to PRO`);
            }

            return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/?payment=success`, 303);
        } else {
            return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/?payment=failed`, 303);
        }
    } catch (error: any) {
        console.error('PhonePe Callback Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
