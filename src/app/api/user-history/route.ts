// src/app/api/user-history/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getPrisma } from '@/lib/db';

export async function GET() {
    const prisma = await getPrisma();
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    try {
        const email = session.user.email.toLowerCase();

        const audits = await prisma.audit.findMany({
            where: { userEmail: email },
            orderBy: { createdAt: 'desc' },
            include: { findings: true },
        });

        // categories and meta are JSON columns on the Audit model — auto-returned with the row
        const historyData = audits.map((a: any) => ({
            id: a.id,
            url: a.url,
            uid: a.uid,
            score: a.overallScore || 0,
            date: a.createdAt.toISOString(),
            status: a.status,
            findingCount: a.findings.length,
            categories: a.categories || {},
            meta: a.meta || {},
            findings: a.findings || [],
        }));

        return NextResponse.json({ audits: historyData });
    } catch (err: any) {
        console.error('[History API Error]:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
