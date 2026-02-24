// src/utils/googleSheet.ts

/**
 * Helper utilities to interact with the public Google Sheet via a Google Apps Script web‑app.
 *
 * The workflow is:
 *   1. POST the URL to a Apps Script endpoint that appends a new row (URL in column B).
 *   2. The Apps Script runs the `Process Websites` function which populates the rest of the row.
 *   3. The API polls the sheet until the row contains data (or a timeout occurs).
 *   4. Returns the populated scores and details.
 *
 * This implementation assumes the Apps Script web‑app is publicly reachable and does not require OAuth.
 * Replace `APP_SCRIPT_ENDPOINT` with the actual URL of your deployed script.
 */

const SHEET_CSV_URL =
    'https://docs.google.com/spreadsheets/d/1Po-oXNThH03DkCoXo77IHd5ocokrTudaP1sBqDJd8Nc/export?format=csv';

// Replace this with the actual Apps Script web‑app URL that adds a row and triggers processing.
const APP_SCRIPT_ENDPOINT = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';

/** Simple sleep helper */
function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Append a new row containing the supplied URL (column B) via the Apps Script endpoint.
 * The endpoint should return the row index (1‑based) where the URL was inserted.
 */
export async function addUrlRow(url: string): Promise<number> {
    const resp = await fetch(APP_SCRIPT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
    });
    if (!resp.ok) {
        throw new Error('Failed to add URL row via Apps Script');
    }
    const data = await resp.json();
    // Expect { row: number }
    if (typeof data.row !== 'number') {
        throw new Error('Invalid response from Apps Script when adding URL');
    }
    return data.row;
}

/**
 * Retrieve the CSV data and parse it into rows.
 * Per user: Row 2 in the google sheet has all the headers.
 */
function parseCsv(csvText: string) {
    const rawRows = csvText.split(/\r?\n/);
    if (rawRows.length < 2) return { header: [], dataRows: [] };
    const header = rawRows[1].split(','); // Sheet Row 2 (Index 1) is headers
    const dataRows = rawRows.slice(2).map((r) => r.split(',')); // Data starts from Sheet Row 3
    return { header, dataRows };
}

/**
 * Poll the sheet until the row at `rowIndex` contains non‑empty metric columns.
 * Returns the scores (first six numeric columns) and any additional details.
 */
export async function pollRowForData(rowIndex: number, timeoutMs = 70000) {
    const start = Date.now();
    const interval = 2000; // 2 seconds
    while (Date.now() - start < timeoutMs) {
        const csvResp = await fetch(SHEET_CSV_URL);
        if (!csvResp.ok) {
            throw new Error('Failed to fetch Google Sheet CSV while polling');
        }
        const csvText = await csvResp.text();
        const { header, dataRows } = parseCsv(csvText);
        // User's rowIndex is 1-based sheet row. 
        // Sheet Row 1: Spacer/Empty (Index 0 in rawRows)
        // Sheet Row 2: Headers (Index 1 in rawRows)
        // Sheet Row 3: First Data (Index 0 in dataRows)
        // So, dataRows index = rowIndex - 3
        const row = dataRows[rowIndex - 3];
        if (row) {
            // Assume metric columns are the first six after the URL column (index 1).
            const scores = [];
            for (let i = 1; i <= 6; i++) {
                const val = parseFloat(row[i]);
                scores.push(isNaN(val) ? 0 : val);
            }
            // If at least one score is non‑zero, we consider the processing complete.
            if (scores.some((s) => s !== 0)) {
                const details: Record<string, any> = {};
                for (let i = 7; i < header.length; i++) {
                    details[header[i]] = row[i];
                }
                return { scores, details };
            }
        }
        await sleep(interval);
    }
    throw new Error('Timed out waiting for sheet processing to finish');
}

/**
 * High‑level function used by the API route:
 *   1. Add the URL row.
 *   2. Wait for the Apps Script to fill the row.
 *   3. Return the populated data.
 */
export async function ProcessWebsites(url: string) {
    // 1️⃣ Append the URL to the sheet (column B) via Apps Script.
    const rowIndex = await addUrlRow(url);

    // 2️⃣ Poll until the row has data (≈ up to 1 minute).
    const result = await pollRowForData(rowIndex);
    return result;
}
