// src/app/api/audit/route.ts
import { NextResponse } from 'next/server';
import { ProcessWebsites, normaliseUrl } from '@/utils/googleSheet';

export const maxDuration = 120; // 2-minute timeout
export const runtime = 'nodejs';

export async function POST(request: Request) {
    let url = '';
    try {
        const body = await request.json();
        url = body.url ?? '';
        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        // Normalise first so we surface bad-URL errors immediately
        const normalisedUrl = normaliseUrl(url);

        const result = await ProcessWebsites(normalisedUrl);
        return NextResponse.json(result);

    } catch (err: any) {
        console.error('[/api/audit] Error:', err);

        // Surface a readable error to the UI
        const msg: string = err.message ?? 'Unknown error';
        const friendlyMsg =
            msg.includes('Apps Script') ? 'Could not reach the Google Apps Script endpoint. Make sure the doPost function is deployed and the Web App URL is correct.' :
                msg.includes('Timed out') ? 'The Google Sheet took too long to process the website. Please try again.' :
                    msg.includes('Invalid URL') ? 'The URL you entered is invalid. Try adding https:// or check for typos.' :
                        msg.includes('fetch') ? 'Network error reaching Google Sheets. Check your internet connection.' :
                            msg;

        return NextResponse.json({ error: friendlyMsg, raw: msg }, { status: 500 });
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
