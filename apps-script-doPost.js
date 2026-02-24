// ============================================================
// PASTE THIS AT THE BOTTOM OF YOUR EXISTING APPS SCRIPT FILE
// doPost – Web App entry point called by the Next.js API route
// ============================================================

/**
 * Receives a POST from the Next.js `/api/audit` route.
 * Expected body: { "url": "<raw url>" }
 * Returns:       { "row": <1-based sheet row>, "uid": "<generated UID>" }
 *
 * The function:
 *   1. Normalises the URL (adds https:// if missing, handles www.)
 *   2. Generates a UID (format: TL-XXXXXXXXXXXXXXXX)
 *   3. Appends a row to "Website & SEO Data" with UID in col A, URL in col D
 *   4. Analyses the site inline with analyzeWebsiteComprehensive()
 *   5. Writes all analysis columns into the same row
 *   6. Returns the row number so the caller can poll for data
 */
function doPost(e) {
    try {
        const payload = JSON.parse(e.postData.contents || '{}');
        let rawUrl = (payload.url || '').toString().trim();

        if (!rawUrl) {
            return jsonResponse({ error: 'No URL supplied' }, 400);
        }

        // ── Normalise URL ─────────────────────────────────────────────
        // Accept: "turtlelabs.co.in", "www.turtlelabs.co.in", "https://..."
        if (!/^https?:\/\//i.test(rawUrl)) {
            rawUrl = 'https://' + rawUrl;
        }

        // ── Generate UID ──────────────────────────────────────────────
        const uid = 'TL-' + Utilities.getUuid().replace(/-/g, '').substring(0, 16).toUpperCase();

        // ── Get (or create) local data sheet ─────────────────────────
        const ss = SpreadsheetApp.openById(CONFIG.masterSpreadsheetId);
        const dataSheet = ss.getSheetByName(CONFIG.localDataSheetName)
            || setupLocalSheet(ss);

        // Append a placeholder row first so we have a row number to return
        const placeholderRow = [uid, '', '', rawUrl];
        dataSheet.appendRow(placeholderRow);
        const newRowIndex = dataSheet.getLastRow(); // 1-based

        // ── Run full analysis ─────────────────────────────────────────
        const analysis = analyzeWebsiteComprehensive(rawUrl);

        // ── Build the full data row (mirrors saveToLocalSheet logic) ──
        const headers = getSheetHeaders(dataSheet);
        const fullRow = new Array(headers.length).fill('');

        fullRow[0] = uid;
        fullRow[1] = '';          // Email – not available from web app
        fullRow[2] = '';          // Company
        fullRow[3] = rawUrl;

        if (analysis) {
            fullRow[4] = analysis.statusCode || '';
            fullRow[5] = analysis.isActive || 'No';
            fullRow[6] = analysis.responseTime || '';
            fullRow[7] = analysis.serverType || '';
            fullRow[8] = analysis.contentType || '';
            fullRow[9] = analysis.contentLength || '';
            fullRow[10] = analysis.compression || 'No';
            fullRow[11] = analysis.cachingHeaders || 'No';

            fullRow[12] = analysis.title || '';
            fullRow[13] = analysis.titleLength || 0;
            fullRow[14] = analysis.metaDescription || '';
            fullRow[15] = analysis.descriptionLength || 0;
            fullRow[16] = analysis.metaKeywords || '';
            fullRow[17] = analysis.canonical || '';
            fullRow[18] = analysis.robotsMeta || '';
            fullRow[19] = analysis.h1Tag || '';
            fullRow[20] = analysis.h1Count || 0;
            fullRow[21] = analysis.wordCount || 0;
            fullRow[22] = analysis.keywordDensity || 0;
            fullRow[23] = analysis.imageAltText || '';
            fullRow[24] = analysis.internalLinks || 0;
            fullRow[25] = analysis.externalLinks || 0;
            fullRow[26] = 0;                         // Broken Links (not checked inline)
            fullRow[27] = analysis.favicon || 'No';
            fullRow[28] = '';                        // Sitemap
            fullRow[29] = '';                        // Robots.txt

            fullRow[30] = analysis.pageSizeKB || 0;
            fullRow[31] = analysis.loadTimeMs || 0;
            fullRow[32] = analysis.domSize || 0;
            fullRow[33] = analysis.renderBlocking || 'No';
            fullRow[34] = analysis.jsFiles || 0;
            fullRow[35] = analysis.cssFiles || 0;
            fullRow[36] = analysis.imageCount || 0;
            fullRow[37] = analysis.lazyLoading || 'No';

            fullRow[38] = analysis.hasSSL || 'No';
            fullRow[39] = analysis.sslIssuer || '';
            fullRow[40] = analysis.sslExpiry || '';
            fullRow[41] = analysis.mixedContent || 'No';
            fullRow[42] = analysis.securityHeaders || '';
            fullRow[43] = analysis.malwareDetected || 'No';

            fullRow[44] = analysis.cmsDetected || '';
            fullRow[45] = analysis.wordpressDetected || 'No';
            fullRow[46] = analysis.wordpressVersion || '';
            fullRow[47] = analysis.pluginsDetected || '';
            fullRow[48] = analysis.jqueryDetected || 'No';
            fullRow[49] = analysis.bootstrapDetected || 'No';
            fullRow[50] = analysis.modernFramework || '';
            fullRow[51] = analysis.analyticsTools || '';
            fullRow[52] = analysis.adNetworks || '';

            fullRow[53] = analysis.socialLinks || '';
            fullRow[54] = analysis.facebookLink || 'No';
            fullRow[55] = analysis.twitterLink || 'No';
            fullRow[56] = analysis.linkedinLink || 'No';
            fullRow[57] = analysis.instagramLink || 'No';
            fullRow[58] = analysis.youtubeLink || 'No';
            fullRow[59] = analysis.openGraphTags || 'No';
            fullRow[60] = analysis.twitterCards || 'No';

            fullRow[61] = analysis.mobileFriendly || 'No';
            fullRow[62] = analysis.responsiveDesign || 'No';

            fullRow[63] = analysis.schemaMarkup || 'No';
            fullRow[64] = analysis.localBusinessSchema || 'No';
            fullRow[65] = analysis.contactPage || 'No';
            fullRow[66] = analysis.addressPresent || 'No';
            fullRow[67] = analysis.phonePresent || 'No';

            fullRow[68] = analysis.redirectCount || 0;
            fullRow[69] = analysis.finalUrl || '';
            fullRow[70] = analysis.urlStructure || '';
            fullRow[71] = analysis.urlLength || 0;
            fullRow[72] = analysis.wwwVsNonWww || '';
            fullRow[73] = analysis.trailingSlash || '';

            fullRow[74] = analysis.errorMessage || '';
            fullRow[75] = analysis.warnings || '';
            fullRow[76] = analysis.criticalIssues || '';

            fullRow[77] = analysis.lastChecked || new Date();
            fullRow[78] = analysis.nextReview || new Date();
        }

        // Overwrite the placeholder row with the full data
        dataSheet.getRange(newRowIndex, 1, 1, fullRow.length).setValues([fullRow]);

        return jsonResponse({ row: newRowIndex, uid: uid });

    } catch (err) {
        console.error('doPost error:', err);
        return jsonResponse({ error: err.message }, 500);
    }
}

function jsonResponse(data, statusCode) {
    const output = ContentService
        .createTextOutput(JSON.stringify(data))
        .setMimeType(ContentService.MimeType.JSON);
    return output;
}
