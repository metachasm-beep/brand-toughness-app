// src/app/api/audit/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AuditEngine } from '@/lib/audit/engine';
import { getAiInsights } from '@/lib/audit/ai';
import { getPrisma } from '@/lib/db';
import { normaliseUrl } from '@/utils/googleSheet';

export const runtime = 'nodejs';
export const maxDuration = 120;

export async function POST(request: Request) {
    let body: any = null;
    let inputUrl = '';
    let normalisedUrl = '';
    let userEmail: string | null = null;

    try {
        body = await request.json().catch(() => ({}));
        inputUrl = String(body?.url || '').trim();

        if (!inputUrl) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        normalisedUrl = normaliseUrl(inputUrl);
    } catch (err: any) {
        console.error('[/api/audit] REQUEST_PARSE_FAILED:', err);
        return NextResponse.json(
            {
                error: 'Invalid request payload',
                stage: 'request-parse',
                details: err?.message || 'Unknown parse error'
            },
            { status: 400 }
        );
    }

    try {
        try {
            const session = await getServerSession(authOptions);
            userEmail = session?.user?.email || null;
        } catch (authErr: any) {
            console.error('[/api/audit] AUTH_FAILED (continuing as guest):', authErr?.message);
            userEmail = null;
        }

        let auditData: any;
        try {
            const engine = new AuditEngine(normalisedUrl);
            auditData = await engine.run();
        } catch (auditErr: any) {
            console.error('[/api/audit] ENGINE_FAILED:', auditErr);
            return NextResponse.json(
                {
                    error: auditErr?.message || 'Audit engine failed',
                    stage: 'audit-engine',
                    url: normalisedUrl
                },
                { status: 502 }
            );
        }

        let aiSummary: any = null;
        try {
            aiSummary = await getAiInsights(normalisedUrl, auditData.findings || []);
            if (auditData?.meta) {
                auditData.meta.aiSummary = aiSummary;
            }
        } catch (aiErr: any) {
            console.error('[/api/audit] AI_FAILED (continuing without AI):', aiErr);
            aiSummary = null;
        }

        let findings = auditData.findings || [];

        try {
            const prisma = await getPrisma();

            const savedAudit = await prisma.audit.create({
                data: {
                    url: normalisedUrl,
                    uid: auditData.uid,
                    status: 'COMPLETED',
                    userEmail,
                    overallScore: Number(auditData.overallScore || 0),
                    categories: (auditData.categories || {}) as any,
                    meta: (auditData.meta || {}) as any,
                    findings: {
                        create: findings.map((f: any) => ({
                            code: String(f.code || ''),
                            title: String(f.title || ''),
                            category: String(f.category || 'General'),
                            severity: String(f.severity || 'LOW'),
                            confidence: Number(f.confidence || 0),
                            recommendation: String(f.recommendation || ''),
                            effort: String(f.effort || 'MEDIUM'),
                            impact: String(f.impact || ''),
                            evidence: f.evidence || null
                        }))
                    }
                },
                include: { findings: true }
            });

            findings = savedAudit?.findings || findings;
        } catch (dbErr: any) {
            console.error('[/api/audit] DB_FAILED (continuing without persistence):', dbErr);
        }

        const scores = {
            marketPresence: Number(auditData?.categories?.SEO?.score || 0),
            technicalHealth: Number(auditData?.categories?.Performance?.score || 0),
            security: Number(auditData?.categories?.Security?.score || 0),
            innovation: Number(auditData?.categories?.UX?.score || 0),
            customerExperience: Number(auditData?.categories?.Accessibility?.score || 0),
            contentQuality: 8.5
        };

        const aggregate = Number((Number(auditData?.overallScore || 0) / 10).toFixed(1));

        return NextResponse.json({
            url: normalisedUrl,
            scores,
            aggregate,
            rawData: auditData?.meta || {},
            findings,
            uid: auditData?.uid || null,
            aiSummary,
            debug: {
                aiIncluded: !!aiSummary,
                persistedToDb: false
            }
        });
    } catch (err: any) {
        console.error('[/api/audit] UNHANDLED_FATAL:', err);
        return NextResponse.json(
            {
                error: err?.message || 'Unhandled audit failure',
                stage: 'unhandled'
            },
            { status: 500 }
        );
    }
}

export async function GET() {
    return NextResponse.json({
        ok: true,
        route: '/api/audit',
        runtime: 'nodejs'
    });
}
