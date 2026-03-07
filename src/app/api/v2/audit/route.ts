// f:\ANTIGRAVITY\WebsiteAudit\brand-toughness-app\src\app\api\v2\audit\route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getPrisma } from '@/lib/db';
import { AuditEngine } from '@/lib/audit/engine';
import { getAiInsights } from '@/lib/audit/ai';

export const maxDuration = 120; // Increase timeout for deep analysis

export async function POST(request: Request) {
    const prisma = await getPrisma();
    try {
        const session = await getServerSession(authOptions);
        const userEmail = session?.user?.email || null;

        const { url } = await request.json();
        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        // 1. Initialize Audit Engine
        const engine = new AuditEngine(url);
        const result = await engine.run();

        // 2. Optional AI analysis (Pro feature?)
        const aiInsights = await getAiInsights(url, result.findings);
        result.meta.aiInsights = aiInsights;

        // 3. Save to Database
        const audit = await prisma.audit.create({
            data: {
                url: result.url,
                uid: result.uid,
                status: 'COMPLETED',
                overallScore: result.overallScore,
                categories: result.categories as any,
                userEmail: userEmail || null,
                meta: result.meta,
                findings: {
                    create: result.findings.map(f => ({
                        code: f.code,
                        title: f.title,
                        category: f.category,
                        severity: f.severity,
                        confidence: f.confidence,
                        recommendation: f.recommendation,
                        effort: f.effort,
                        impact: f.impact,
                        evidence: f.evidence || null,
                    }))
                }
            },
            include: {
                findings: true
            }
        });

        return NextResponse.json(audit);
    } catch (error: any) {
        console.error('Audit v2 error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET() {
    const prisma = await getPrisma();
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const audits = await prisma.audit.findMany({
        where: { userEmail: session.user.email },
        orderBy: { createdAt: 'desc' },
        include: { findings: true }
    });

    return NextResponse.json(audits);
}
