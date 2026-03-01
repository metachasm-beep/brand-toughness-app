import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { initiatePhonePePayment } from '@/lib/payment/phonepe';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { amount, redirectUrl } = await request.json();
        if (!amount || !redirectUrl) {
            return NextResponse.json({ error: 'Amount and redirectUrl are required' }, { status: 400 });
        }

        const transactionId = `T${Date.now()}${uuidv4().substring(0, 8)} `;
        const userId = session.user.email || 'guest';

        const paymentResponse: any = await initiatePhonePePayment(amount, transactionId, userId, redirectUrl);

        if (paymentResponse.success && paymentResponse.data.instrumentResponse.redirectInfo.url) {
            return NextResponse.json({
                url: paymentResponse.data.instrumentResponse.redirectInfo.url,
                transactionId
            });
        } else {
            return NextResponse.json({ error: 'Failed to initiate payment', details: paymentResponse }, { status: 500 });
        }
    } catch (error: any) {
        console.error('PhonePe Checkout Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
