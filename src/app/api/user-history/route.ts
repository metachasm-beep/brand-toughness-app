// src/app/api/user-history/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    try {
        const email = session.user.email.toLowerCase();

        // Fetch from Prisma DB
        const audits = await prisma.audit.findMany({
            where: {
                userEmail: email
            },
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                findings: true
            }
        });

        // Structure data for the history table if needed, or return raw
        // The current History page might expect specific headers/rows format used by Sheets
        // Let's map it to something the UI can use, or update the UI later.

        const historyData = audits.map(a => ({
            id: a.id,
            url: a.url,
            score: (a.overallScore || 0) / 10,
            date: a.createdAt.toISOString(),
            status: a.status,
            findingCount: a.findings.length
        }));

        return NextResponse.json({ audits: historyData });
    } catch (err: any) {
        console.error('[History API Error]:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
