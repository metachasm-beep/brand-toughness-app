// src/utils/googleSheet.ts
// Full workflow:
//   1. Normalise the raw URL (handle bare domains, www., http://)
//   2. POST to Apps Script → adds row with URL in col D → returns { row, uid }
//   3. Poll the CSV every 3s until Status Code column is populated
//   4. Build named map from Row 2 headers
//   5. Compute 6 branded pillar scores
//   6. Return { scores, aggregate, rawData, uid }

const SHEET_CSV_URL =
    'https://docs.google.com/spreadsheets/d/1Po-oXNThH03DkCoXo77IHd5ocokrTudaP1sBqDJd8Nc/gviz/tq?tqx=out:csv&sheet=Website%20%26%20SEO%20Data';

const APP_SCRIPT_ENDPOINT =
    'https://script.google.com/macros/s/AKfycbyHi5VX-xavsqZhS4JFc6UCi5rEGpM6XVBHFBz2KcAhajf6NhUgAkhjLhBMMujk5ObL/exec';

function sleep(ms: number) {
    return new Promise((r) => setTimeout(r, ms));
}

// ─── URL normalisation ────────────────────────────────────────────────────────
// Accepts: "turtlelabs.co.in" | "www.turtlelabs.co.in" | "https://turtlelabs.co.in"
export function normaliseUrl(raw: string): string {
    let url = String(raw || '').trim().toLowerCase();
    if (!url) throw new Error('URL cannot be empty');
    
    // Remove trailing slashes for consistency
    url = url.replace(/\/+$/, '');

    // Handle bare domains
    if (!/^https?:\/\//i.test(url)) {
        url = 'https://' + url;
    }

    try { 
        const parsed = new URL(url);
        // Ensure there's a dot in the hostname to qualify as a domain (e.g. "nike.com")
        if (!parsed.hostname.includes('.')) {
            throw new Error('Please enter a valid domain (e.g. site.com)');
        }
        return parsed.toString();
    } catch (e: any) { 
        throw new Error(e.message || 'Invalid URL: ' + raw); 
    }
}

// ─── CSV helpers ──────────────────────────────────────────────────────────────
function parseCsv(csvText: string) {
    const result: string[][] = [];
    let row: string[] = [];
    let cur = '';
    let inQuote = false;

    // A robust CSV parser that correctly handles quoted strings containing commas and newlines.
    for (let i = 0; i < csvText.length; i++) {
        const c = csvText[i];
        const next = csvText[i + 1];

        if (c === '"') {
            if (inQuote && next === '"') {
                cur += '"';
                i++; // skip escaped quote
            } else {
                inQuote = !inQuote;
            }
        } else if (c === ',' && !inQuote) {
            row.push(cur.trim());
            cur = '';
        } else if ((c === '\n' || (c === '\r' && next === '\n')) && !inQuote) {
            if (c === '\r') i++;
            row.push(cur.trim());
            result.push([...row]);
            row.length = 0;
            cur = '';
        } else {
            cur += c;
        }
    }
    if (cur || row.length > 0) {
        row.push(cur.trim());
        result.push([...row]);
    }

    if (result.length < 1) return { headers: [], dataRows: [] };
    // Google Visualization joined headers are in result[0]
    return { headers: result[0], dataRows: result.slice(1) };
}

// ─── Step 1: Add URL to Sheet via Apps Script ─────────────────────────────────
export async function addUrlToSheet(url: string, email: string = 'guest@turtlelabs.co'): Promise<{ row: number; uid: string }> {
    const normalised = normaliseUrl(url);
    const resp = await fetch(APP_SCRIPT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: normalised, email }),
    });
    if (!resp.ok) {
        throw new Error(`Apps Script error ${resp.status}: ${await resp.text()}`);
    }
    const data = await resp.json();
    if (!data.row) throw new Error('Apps Script did not return a row number. Got: ' + JSON.stringify(data));
    return { row: Number(data.row), uid: data.uid ?? '' };
}

// ─── Step 2: Poll until the row is populated ─────────────────────────────────
export async function pollForRow(
    uid: string,
    timeoutMs = 90_000,
    intervalMs = 3_000,
): Promise<Record<string, string>> {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
        const csvResp = await fetch(SHEET_CSV_URL + '&_cb=' + Date.now());
        if (!csvResp.ok) throw new Error('Failed to fetch Google Sheet while polling');

        const { headers, dataRows } = parseCsv(await csvResp.text());

        // Find row by uid (it should be in column 0, "UID" or joined "UID UID")
        const uidIdx = headers.findIndex(h => h.toUpperCase().includes('UID'));
        const row = dataRows.find(r => r[uidIdx >= 0 ? uidIdx : 0] === uid);

        if (row) {
            const statusIdx = headers.findIndex(h => h.toLowerCase().includes('status code'));
            const statusVal = statusIdx >= 0 ? row[statusIdx] : '';
            // Wait for App script to populate it completely
            if (statusVal && statusVal.trim().toLowerCase() !== 'pending' && statusVal.trim() !== '') {
                // Row is complete — build named map
                const named: Record<string, string> = {};
                headers.forEach((h, i) => {
                    // Clean up joined header names like "BASIC INFO Email" -> "Email"
                    const cleanH = h.split(' ').pop() || h;
                    named[cleanH] = row[i] ?? '';
                });
                return named;
            }
        }
        await sleep(intervalMs);
    }
    throw new Error('Timed out waiting for Google Sheet processing (> 90 s).');
}

// ─── Step 3: Compute 6-pillar scores from raw data ───────────────────────────
function num(v?: string): number {
    const n = parseFloat(v ?? '');
    return isNaN(n) ? 0 : n;
}
function bool(v?: string): 0 | 1 {
    return ['yes', 'true', '1'].includes((v ?? '').toLowerCase()) ? 1 : 0;
}

export function computeScores(r: Record<string, string>) {
    // 1. Market Presence (SEO + Social)
    const seo =
        (r['Page Title'] ? 15 : 0) +
        (r['Meta Description'] && num(r['Description Length']) > 80 ? 20 : 0) +
        (r['H1 Tag'] ? 15 : 0) +
        (num(r['Word Count']) > 300 ? 15 : 0) +
        (num(r['Internal Links']) > 5 ? 10 : 0) +
        bool(r['Sitemap Detected']) * 15 +
        bool(r['Favicon Present']) * 10;
    const social =
        (bool(r['Facebook']) + bool(r['Twitter/X']) + bool(r['LinkedIn']) + bool(r['Instagram']) + bool(r['YouTube'])) * 12;
    const marketPresence = Math.min(10, (seo / 100) * 6 + (social / 60) * 4);

    // 2. Technical Health
    const statusOk = num(r['Status Code']) === 200 ? 1 : 0;
    const ssl = bool(r['Has SSL']);
    const loadTime = num(r['Load Time (ms)']);
    const loadScore = loadTime < 1000 ? 1 : loadTime < 3000 ? 0.7 : 0.3;
    const pageSize = num(r['Page Size (KB)']);
    const sizeScore = pageSize < 200 ? 1 : pageSize < 500 ? 0.7 : 0.3;
    const technicalHealth = Math.min(10, (statusOk * 2 + ssl * 2 + loadScore * 3 + sizeScore * 2 + bool(r['Mobile Friendly'])));

    // 3. Security
    const security = Math.min(10,
        ssl * 3 +
        (r['Security Headers'] ? 3 : 0) +
        (bool(r['Malware Detected']) === 0 ? 2 : 0) +
        (bool(r['Mixed Content']) === 0 ? 2 : 0),
    );

    // 4. Innovation / Technology
    const innovation = Math.min(10,
        (r['React/Angular/Vue'] ? 2 : 0) +
        (r['Analytics Tools'] ? 2 : 0) +
        bool(r['Lazy Loading']) +
        bool(r['Open Graph Tags']) * 1.5 +
        bool(r['Twitter Cards']) * 1.5 +
        bool(r['Schema Markup']) * 2,
    );

    // 5. Customer Experience
    const customerExperience = Math.min(10,
        bool(r['Mobile Friendly']) * 3 +
        bool(r['Responsive Design']) * 2 +
        (num(r['Redirect Count']) === 0 ? 2 : 1) +
        bool(r['Contact Page']) * 1.5 +
        (bool(r['Address Present']) + bool(r['Phone Number'])) * 0.75,
    );

    // 6. Content Quality
    const wc = num(r['Word Count']);
    const imgAlt = (() => {
        const parts = (r['Image Alt Tags'] ?? '').split('/');
        if (parts.length === 2 && num(parts[1]) > 0) return num(parts[0]) / num(parts[1]);
        return 0.5;
    })();
    const contentQuality = Math.min(10,
        Math.min(wc / 100, 4) + imgAlt * 3 + (num(r['Broken Links']) === 0 ? 2 : 1) + (r['Meta Keywords'] ? 1 : 0),
    );

    const round2 = (n: number) => parseFloat(n.toFixed(2));
    return {
        marketPresence: round2(marketPresence),
        technicalHealth: round2(technicalHealth),
        security: round2(security),
        innovation: round2(innovation),
        customerExperience: round2(customerExperience),
        contentQuality: round2(contentQuality),
    };
}

// ─── Top-level orchestration ──────────────────────────────────────────────────
export async function ProcessWebsites(url: string, email: string = 'guest@turtlelabs.co') {
    const { row, uid } = await addUrlToSheet(url, email);
    const rawData = await pollForRow(uid);
    const scores = computeScores(rawData);
    const values = Object.values(scores);
    const aggregate = parseFloat((values.reduce((a, b) => a + b, 0) / values.length).toFixed(1));
    return { scores, aggregate, rawData, uid };
}
