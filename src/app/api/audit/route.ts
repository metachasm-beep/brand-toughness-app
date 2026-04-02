// src/app/api/audit/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';
import { BrandEngine } from '@/lib/audit/brandEngine';
import { getBrandIntelligence } from '@/lib/audit/ai';
import { prisma } from '@/lib/db';
import { normaliseUrl } from '@/utils/googleSheet';

export const maxDuration = 120; // 2-minute timeout
export const runtime = 'nodejs';

export async function POST(request: Request) {
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

        // 1. Core Brand Scan - Extracts H1s, CTAs, Hero, and about text
        const engine = new BrandEngine(normalisedUrl);
        const brandData = await engine.scan();

        // 2. Multi-step AI Intelligence (Extract -> Evaluate -> Score -> Generate)
        const brandIntel = await getBrandIntelligence(brandData);
        if (brandIntel.error) throw new Error(brandIntel.error);

        // 3. Persist to DB for SaaS History
        const savedAudit = await prisma.audit.create({
            data: {
                url: normalisedUrl,
                uid: uuidv4(),
                status: 'COMPLETED',
                userEmail: userEmail,
                // Scale 0-25 scores to 0-100 for DB metrics
                overallScore: brandIntel.scores.total,
                clarityScore: brandIntel.scores.clarity * 4,
                consistencyScore: brandIntel.scores.consistency * 4,
                differentiationScore: brandIntel.scores.differentiation * 4,
                emotionalImpactScore: brandIntel.scores.conversion * 4, // Mapping Conversion to 4th pillar
                meta: { ...brandData, brandIntel } as any,
                brandIdentity: {
                    create: {
                        businessDesc: brandIntel.summary,
                        positioning: brandIntel.positioning,
                        targetAudience: brandIntel.audience,
                        toneOfVoice: brandIntel.toneOfVoice,
                        playbook: brandIntel.playbook as any
                    }
                }
            }
        });

        // Map back to UI format (0-10 scale)
        const scores = {
            clarity: brandIntel.scores.clarity / 2.5,
            consistency: brandIntel.scores.consistency / 2.5,
            differentiation: brandIntel.scores.differentiation / 2.5,
            emotionalImpact: brandIntel.scores.conversion / 2.5, // UI still uses this prop name but receives Conversion data
            marketResonance: 8.5, // Placeholder metric
            ctaStrength: 7.8, // Placeholder metric
        };

        return NextResponse.json({
            scores,
            aggregate: (brandIntel.scores.total / 10).toFixed(1),
            rawData: brandData,
            findings: [], // Legacy compat
            uid: savedAudit.uid,
            brandIntelligence: brandIntel
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
