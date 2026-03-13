// src/app/api/audit/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AuditEngine } from '@/lib/audit/engine';
import { getAiInsights } from '@/lib/audit/ai';
import { getPrisma } from '@/lib/db';
import { normaliseUrl } from '@/utils/googleSheet';

export const maxDuration = 120;
export const runtime = 'nodejs';

export async function POST(request: Request) {
    const prisma = await getPrisma();

    try {
        const session = await getServerSession(authOptions);
        const userEmail = session?.user?.email || null;

        const body = await request.json();
        const inputUrl = String(body?.url || '').trim();

        if (!inputUrl) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        const normalisedUrl = normaliseUrl(inputUrl);

        const engine = new AuditEngine(normalisedUrl);
        const auditData = await engine.run();

        let aiSummary: any = null;
        try {
            aiSummary = await getAiInsights(normalisedUrl, auditData.findings);
            auditData.meta.aiSummary = aiSummary;
        } catch (aiErr: any) {
            console.error('[/api/audit] AI SUMMARY FAILED (Continuing...):', aiErr?.message);
            aiSummary = null;
        }

        let savedAudit: any = null;
        try {
            savedAudit = await prisma.audit.create({
                data: {
                    url: normalisedUrl,
                    uid: auditData.uid,
                    status: 'COMPLETED',
                    userEmail,
                    overallScore: auditData.overallScore,
                    categories: auditData.categories as any,
                    meta: auditData.meta as any,
                    findings: {
                        create: auditData.findings.map((f) => ({
                            code: f.code,
                            title: f.title,
                            category: f.category,
                            severity: f.severity,
                            confidence: f.confidence,
                            recommendation: f.recommendation,
                            effort: f.effort,
                            impact: f.impact,
                            evidence: f.evidence || null
                        }))
                    }
                },
                include: { findings: true }
            });
        } catch (dbErr: any) {
            console.error('[/api/audit] DB PERSISTENCE FAILED (Continuing...):', dbErr?.message);
        }

        const scores = {
            marketPresence: Number(auditData.categories?.SEO?.score || 0),
            technicalHealth: Number(auditData.categories?.Performance?.score || 0),
            security: Number(auditData.categories?.Security?.score || 0),
            innovation: Number(auditData.categories?.UX?.score || 0),
            customerExperience: Number(auditData.categories?.Accessibility?.score || 0),
            contentQuality: 8.5
        };

        const aggregate = Number((auditData.overallScore / 10).toFixed(1));

        return NextResponse.json({
            url: normalisedUrl,
            scores,
            aggregate,
            rawData: auditData.meta || {},
            findings: savedAudit?.findings || auditData.findings || [],
            uid: auditData.uid,
            aiSummary
        });
    } catch (err: any) {
        console.error('[/api/audit] FULL ERROR TRACE:', err);
        console.error('[/api/audit] Error Name:', err?.name);
        console.error('[/api/audit] Error Message:', err?.message);
        if (err?.code) console.error('[/api/audit] Error Code:', err.code);

        return NextResponse.json(
            {
                error: err?.message || 'Unknown diagnostic error',
                details: err?.code || null
            },
            { status: 500 }
        );
    }
}

export async function GET() {
    const endpoint =
        'https://script.google.com/macros/s/AKfycbyHi5VX-xavsqZhS4JFc6UCi5rEGpM6XVBHFBz2KcAhajf6NhUgAkhjLhBMMujk5ObL/exec';
    const sheetUrl =
        'https://docs.google.com/spreadsheets/d/1Po-oXNThH03DkCoXo77IHd5ocokrTudaP1sBqDJd8Nc/export?format=csv';

    let sheetOk = false;
    let scriptOk = false;
    let sheetError = '';
    let scriptError = '';

    try {
        const r = await fetch(sheetUrl);
        sheetOk = r.ok;
        if (!r.ok) sheetError = `HTTP ${r.status}`;
    } catch (e: any) {
        sheetError = e?.message || 'Unknown error';
    }

    try {
        const r = await fetch(endpoint, { method: 'GET' });
        scriptOk = r.status < 500;
        if (!scriptOk) scriptError = `HTTP ${r.status}`;
    } catch (e: any) {
        scriptError = e?.message || 'Unknown error';
    }

    return NextResponse.json({
        status: 'ok',
        checks: {
            googleSheet: { ok: sheetOk, error: sheetError || null },
            appsScript: { ok: scriptOk, error: scriptError || null }
        }
    });
}
