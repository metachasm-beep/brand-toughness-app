// src/app/api/audit/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AuditEngine } from '@/lib/audit/engine';
import { getAiInsights } from '@/lib/audit/ai';
import { getPrisma } from '@/lib/db';
import { normaliseUrl } from '@/utils/googleSheet';

export const maxDuration = 120; // 2-minute timeout
export const runtime = 'nodejs';

export async function POST(request: Request) {
    const prisma = await getPrisma();
    let url = '';
    try {
        const session = await getServerSession(authOptions);
        const userEmail = session?.user?.email || 'guest@turtlelabs.co';

        const body = await request.json();
        url = body.url ?? '';
        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        const normalisedUrl = normaliseUrl(url);

        // 1. Core Audit - Ported from Python health checks + PageSpeed API
        const engine = new AuditEngine(normalisedUrl);
        const auditData = await engine.run();

        // 2. Generate AI Overview using Cohere
        const aiSummary = await getAiInsights(normalisedUrl, auditData.findings);
        auditData.meta.aiSummary = aiSummary;

        // 3. Persist to DB for SaaS History
        const savedAudit = await prisma.audit.create({
            data: {
                url: normalisedUrl,
                uid: auditData.uid,
                status: 'COMPLETED',
                userEmail: userEmail,
                overallScore: auditData.overallScore,
                categories: auditData.categories as any,
                meta: auditData.meta as any,
                findings: {
                    create: auditData.findings.map(f => ({
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

        // Map back to UI format
        const scores = {
            marketPresence: auditData.categories['SEO']?.score || 0,
            technicalHealth: auditData.categories['Performance']?.score || 0,
            security: auditData.categories['Security']?.score || 0,
            innovation: auditData.categories['UX']?.score || 0,
            customerExperience: auditData.categories['Accessibility']?.score || 0,
            contentQuality: 8.5 // Placeholder or aggregate content metric
        };

        return NextResponse.json({
            scores,
            aggregate: (auditData.overallScore / 10).toFixed(1), // UI expects 0-10 scale
            rawData: auditData.meta,
            findings: savedAudit.findings,
            uid: auditData.uid,
            aiSummary
        });

    } catch (err: any) {
        console.error('[/api/audit] Error:', err);
        return NextResponse.json({ error: err.message ?? 'Unknown error' }, { status: 500 });
    }
}

// Quick connectivity test – GET /api/audit returns endpoint details
export async function GET() {
    const endpoint = 'https://script.google.com/macros/s/AKfycbyHi5VX-xavsqZhS4JFc6UCi5rEGpM6XVBHFBz2KcAhajf6NhUgAkhjLhBMMujk5ObL/exec';
    const sheetUrl = 'https://docs.google.com/spreadsheets/d/1Po-oXNThH03DkCoXo77IHd5ocokrTudaP1sBqDJd8Nc/export?format=csv';

    let sheetOk = false;
    let scriptOk = false;
    let sheetError = '';
    let scriptError = '';

    try {
        const r = await fetch(sheetUrl);
        sheetOk = r.ok;
        if (!r.ok) sheetError = `HTTP ${r.status}`;
    } catch (e: any) { sheetError = e.message; }

    try {
        // Simple HEAD-like GET to verify the script endpoint is reachable
        const r = await fetch(endpoint, { method: 'GET' });
        scriptOk = r.status < 500;
        if (!scriptOk) scriptError = `HTTP ${r.status}`;
    } catch (e: any) { scriptError = e.message; }

    return NextResponse.json({
        status: 'ok',
        checks: {
            googleSheet: { ok: sheetOk, error: sheetError || null },
            appsScript: { ok: scriptOk, error: scriptError || null },
        },
    });
}
