// src/utils/googleSheet.ts
// Full workflow:
//   1. POST the URL to the Apps Script endpoint which appends a new row (URL in col D) and triggers the 'Process Websites' function.
//   2. Poll the CSV export every 3s until the row the script inserted is populated with data.
//   3. Parse the row by column header name (headers are on Sheet Row 2 = CSV index 1).
//   4. Compute six branded strategic scores from the raw data columns.
//   5. Return { scores, rawData, details }.

const SHEET_CSV_URL =
    'https://docs.google.com/spreadsheets/d/1Po-oXNThH03DkCoXo77IHd5ocokrTudaP1sBqDJd8Nc/export?format=csv';

const APP_SCRIPT_ENDPOINT =
    'https://script.google.com/macros/s/AKfycbyHi5VX-xavsqZhS4JFc6UCi5rEGpM6XVBHFBz2KcAhajf6NhUgAkhjLhBMMujk5ObL/exec';

function sleep(ms: number) {
    return new Promise((r) => setTimeout(r, ms));
}

// ─── CSV helpers ────────────────────────────────────────────────────────────

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

function parseCsv(csvText: string) {
    const rawLines = csvText.split(/\r?\n/);
    // Row 1 (index 0): category groups (BASIC INFO, PERFORMANCE, etc.)
    // Row 2 (index 1): actual column headers → our field names
    // Row 3+ data
    if (rawLines.length < 2) return { headers: [] as string[], dataRows: [] as string[][] };
    const headers = parseCsvRow(rawLines[1]);           // Sheet row 2
    const dataRows = rawLines.slice(2).map(parseCsvRow); // Sheet row 3+
    return { headers, dataRows };
}

// ─── Step 1: POST URL to Apps Script ────────────────────────────────────────

export async function addUrlToSheet(url: string): Promise<{ row: number; uid: string }> {
    const resp = await fetch(APP_SCRIPT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'addUrl', url }),
    });

    if (!resp.ok) {
        throw new Error(`Apps Script responded ${resp.status}: ${await resp.text()}`);
    }

    const data = await resp.json();
    // Expected: { row: <1-based sheet row number>, uid: "<UID>" }
    if (typeof data.row !== 'number') {
        throw new Error('Apps Script did not return a row number. Response: ' + JSON.stringify(data));
    }
    return { row: data.row, uid: data.uid ?? '' };
}

// ─── Step 2: Poll until data arrives ────────────────────────────────────────

export async function pollForRow(
    rowIndex: number,         // 1-based sheet row (including header rows)
    timeoutMs = 90_000,
    intervalMs = 3_000,
): Promise<Record<string, string>> {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
        const csvResp = await fetch(SHEET_CSV_URL + '&cachebust=' + Date.now());
        if (!csvResp.ok) throw new Error('Failed to fetch sheet CSV');

        const { headers, dataRows } = parseCsv(await csvResp.text());
        // dataRows[0] = Sheet row 3, so dataRows index = rowIndex - 3
        const dataIdx = rowIndex - 3;
        const row = dataRows[dataIdx];

        if (row) {
            // Col D (index 3) is the URL / "Website URL" column.
            // Consider the row "done" when the Status Code (col E, index 4) is non-empty.
            const statusCodeIdx = headers.findIndex((h) => h.toLowerCase().includes('status code'));
            if (statusCodeIdx >= 0 && row[statusCodeIdx] && row[statusCodeIdx].trim() !== '') {
                // Build a named map
                const namedRow: Record<string, string> = {};
                headers.forEach((h, i) => { namedRow[h] = row[i] ?? ''; });
                return namedRow;
            }
        }

        await sleep(intervalMs);
    }
    throw new Error('Timed out waiting for Google Sheet row processing (>90 s).');
}

// ─── Step 3: Compute six strategic "Brand Toughness" pillar scores ───────────

function num(v: string | undefined): number {
    const n = parseFloat(v ?? '');
    return isNaN(n) ? 0 : n;
}

function bool(v: string | undefined): 0 | 1 {
    const s = (v ?? '').toLowerCase();
    return s === 'yes' || s === 'true' || s === '1' ? 1 : 0;
}

export function computeScores(r: Record<string, string>): Record<string, number> {
    // 1. Market Presence (SEO + Social)
    const seo = (
        (r['Page Title'] ? 15 : 0) +
        (r['Meta Description'] && r['Description Length'] && num(r['Description Length']) > 80 ? 20 : 0) +
        (r['H1 Tag'] ? 15 : 0) +
        (num(r['Word Count']) > 300 ? 15 : 0) +
        (num(r['Internal Links']) > 5 ? 10 : 0) +
        (bool(r['Sitemap Detected']) * 15) +
        (bool(r['Favicon Present']) * 10)
    );
    const social = (
        (bool(r['Facebook']) + bool(r['Twitter/X']) + bool(r['LinkedIn']) + bool(r['Instagram']) + bool(r['YouTube'])) * 12
    );
    const marketPresence = Math.min(10, ((seo / 100) * 6 + (social / 60) * 4));

    // 2. Technical Health
    const statusOk = num(r['Status Code']) === 200 || num(r['Status Code']) === 301 ? 1 : 0;
    const ssl = bool(r['Has SSL']);
    const loadTime = num(r['Load Time (ms)']);
    const loadScore = loadTime < 1000 ? 1 : loadTime < 3000 ? 0.7 : 0.3;
    const pageSize = num(r['Page Size (KB)']);
    const sizeScore = pageSize < 200 ? 1 : pageSize < 500 ? 0.7 : 0.3;
    const techHealth = Math.min(10,
        (statusOk * 2 + ssl * 2 + loadScore * 3 + sizeScore * 2 + bool(r['Mobile Friendly'])) * 10 / 10
    );

    // 3. Security Score
    const securityHeaders = bool(r['Security Headers']);
    const noMalware = bool(r['Malware Detected']) === 0 ? 1 : 0;
    const noMixed = bool(r['Mixed Content']) === 0 ? 1 : 0;
    const security = Math.min(10, (ssl * 3 + securityHeaders * 3 + noMalware * 2 + noMixed * 2));

    // 4. Innovation / Technology
    const hasReact = bool(r['React/Angular/Vue']);
    const hasAnalytics = bool(r['Analytics Tools']);
    const hasLazy = bool(r['Lazy Loading']);
    const hasOG = bool(r['Open Graph Tags']);
    const hasTwCard = bool(r['Twitter Cards']);
    const hasSchema = bool(r['Schema Markup']);
    const innovation = Math.min(10,
        (hasReact * 2 + hasAnalytics * 2 + hasLazy * 1 + hasOG * 1.5 + hasTwCard * 1.5 + hasSchema * 2)
    );

    // 5. Customer Experience (UX / Mobile)
    const uxScore = (
        bool(r['Mobile Friendly']) * 3 +
        bool(r['Responsive Design']) * 2 +
        (num(r['Redirect Count']) === 0 ? 2 : 1) +
        bool(r['Contact Page']) * 1.5 +
        (bool(r['Address Present']) + bool(r['Phone Number'])) * 0.75
    );
    const customerExp = Math.min(10, uxScore);

    // 6. Content Quality
    const wordCount = num(r['Word Count']);
    const imgAltRatio = (() => {
        const parts = (r['Image Alt Tags'] ?? '').split('/');
        if (parts.length === 2) {
            const total = num(parts[1]);
            return total > 0 ? num(parts[0]) / total : 1;
        }
        return 0.5;
    })();
    const brokenLinks = num(r['Broken Links']);
    const contentQuality = Math.min(10,
        (Math.min(wordCount / 100, 4) + imgAltRatio * 3 + (brokenLinks === 0 ? 2 : 1) + (r['Meta Keywords'] ? 1 : 0))
    );

    return {
        marketPresence: parseFloat(marketPresence.toFixed(2)),
        technicalHealth: parseFloat(techHealth.toFixed(2)),
        security: parseFloat(security.toFixed(2)),
        innovation: parseFloat(innovation.toFixed(2)),
        customerExperience: parseFloat(customerExp.toFixed(2)),
        contentQuality: parseFloat(contentQuality.toFixed(2)),
    };
}

// ─── Top-level orchestration ─────────────────────────────────────────────────

export async function ProcessWebsites(url: string) {
    const { row, uid } = await addUrlToSheet(url);
    const rawData = await pollForRow(row);
    const scores = computeScores(rawData);

    // Aggregate score (out of 10)
    const values = Object.values(scores);
    const aggregate = parseFloat((values.reduce((a, b) => a + b, 0) / values.length).toFixed(2));

    return { scores, aggregate, rawData, uid };
}
