// src/app/api/audit/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';
import { BrandEngine } from '@/lib/audit/brandEngine';
import { orchestrateBrandAudit } from '@/lib/agents/orchestrator';
import { prisma } from '@/lib/db';
import { normaliseUrl } from '@/utils/googleSheet';

import { z } from 'zod';

const AuditRequestSchema = z.object({
    url: z.string().url().max(2000),
});

export const maxDuration = 120; // 2-minute timeout
export const runtime = 'nodejs';

export async function POST(request: Request) {
    let url = '';
    try {
        const session = await getServerSession(authOptions);
        const userEmail = session?.user?.email || 'guest@turtlelabs.co';

        const json = await request.json();
        const body = AuditRequestSchema.parse(json);
        url = body.url;

        const normalisedUrl = normaliseUrl(url);

        // 1. Core Brand Scan - Extracts H1s, CTAs, Hero, and about text
        const engine = new BrandEngine(normalisedUrl);
        const brandData = await engine.scan();

        // 2. v2.0 Agentic Orchestration with Continuous Intelligence
        const auditResult = await orchestrateBrandAudit(brandData, userEmail);

        // 3. Persist to DB for SaaS History
        const savedAudit = await prisma.audit.create({
            data: {
                url: normalisedUrl,
                uid: uuidv4(),
                status: 'COMPLETED',
                userEmail: userEmail,
                // Scale scores as needed (Orchestrator already provides aggregate)
                overallScore: auditResult.aggregate,
                clarityScore: auditResult.scores.clarity * 4,
                consistencyScore: auditResult.scores.consistency * 4,
                differentiationScore: auditResult.scores.differentiation * 4,
                emotionalImpactScore: auditResult.scores.emotionalImpact * 4,
                meta: { ...brandData, ...auditResult } as any,
                brandIdentity: {
                    create: {
                        businessDesc: auditResult.brandIntelligence.positioning,
                        positioning: auditResult.brandIntelligence.positioning,
                        targetAudience: auditResult.brandIntelligence.audience,
                        toneOfVoice: auditResult.brandIntelligence.toneOfVoice,
                        playbook: {
                            priorityFixes: auditResult.brandIntelligence.priorityFixes,
                            quickWins: auditResult.brandIntelligence.quickWins,
                            trustGaps: auditResult.brandIntelligence.trustGaps
                        } as any
                    }
                }
            }
        });

        // Map back to UI format (0-10 scale)
        const scores = {
            clarity: auditResult.scores.clarity / 2.5,
            consistency: auditResult.scores.consistency / 2.5,
            differentiation: auditResult.scores.differentiation / 2.5,
            emotionalImpact: auditResult.scores.emotionalImpact / 2.5,
            marketResonance: auditResult.scores.marketResonance / 2.5,
            ctaStrength: auditResult.scores.ctaStrength / 2.5,
        };

        return NextResponse.json({
            scores,
            aggregate: (auditResult.aggregate / 10).toFixed(1),
            rawData: brandData,
            findings: [], // Legacy compat
            uid: savedAudit.uid,
            brandIntelligence: auditResult.brandIntelligence
        });

    } catch (err: any) {
        console.error('[/api/audit] Critical Error:', err);
        
        if (err instanceof z.ZodError) {
            return NextResponse.json({ error: 'Invalid Input: Please provide a valid URL.' }, { status: 400 });
        }

        return NextResponse.json({ 
            error: process.env.NODE_ENV === 'production' 
                ? 'Internal Intelligence Failure. Please try again later.' 
                : (err.message ?? 'Unknown error') 
        }, { status: 500 });
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
