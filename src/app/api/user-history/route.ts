// src/app/api/user-history/route.ts
// Returns all rows from the Google Sheet that match the user's email
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

const SHEET_CSV_URL =
    'https://docs.google.com/spreadsheets/d/1Po-oXNThH03DkCoXo77IHd5ocokrTudaP1sBqDJd8Nc/export?format=csv';

function parseCsvRow(row: string): string[] {
    const result: string[] = [];
    let inQuote = false;
    let cur = '';
    for (const ch of row) {
        if (ch === '"') { inQuote = !inQuote; continue; }
        if (ch === ',' && !inQuote) { result.push(cur.trim()); cur = ''; continue; }
        cur += ch;
    }
    result.push(cur.trim());
    return result;
}

export async function GET() {
    const session = await getServerSession();
    if (!session?.user?.email) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const email = session.user.email.toLowerCase();
    const resp = await fetch(SHEET_CSV_URL + '&cb=' + Date.now());
    if (!resp.ok) return NextResponse.json({ error: 'Sheet fetch failed' }, { status: 502 });

    const lines = (await resp.text()).split(/\r?\n/);
    const headers = parseCsvRow(lines[1]); // Row 2 is headers
    const emailIdx = headers.findIndex(h => h.toLowerCase() === 'email');
    const uidIdx = headers.findIndex(h => h.toLowerCase() === 'uid');

    const rows = lines.slice(2)
        .map(parseCsvRow)
        .filter(row => row[emailIdx]?.toLowerCase() === email);

    return NextResponse.json({ headers, rows });
}
