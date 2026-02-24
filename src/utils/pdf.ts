import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

type Scores = {
    marketPresence: number;
    technicalHealth: number;
    security: number;
    innovation: number;
    customerExperience: number;
    contentQuality: number;
};

function grade(avg: number): string {
    if (avg >= 9) return 'S+';
    if (avg >= 8) return 'A';
    if (avg >= 6.5) return 'B';
    if (avg >= 5) return 'C';
    return 'D';
}

export async function generatePDF(scores: Scores, url: string, rawData: Record<string, string>, aggregate: number) {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const W = 210, H = 297;
    const gr = grade(aggregate);

    // ── Background ────────────────────────────────────────────────────
    doc.setFillColor(5, 7, 10);
    doc.rect(0, 0, W, H, 'F');

    // ── Header strip ─────────────────────────────────────────────────
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, W, 3, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('Brand Intelligence Report', W / 2, 20, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(120, 120, 130);
    doc.text('Powered by Turtle Labs Resilience Platform', W / 2, 28, { align: 'center' });

    // ── URL & Date ────────────────────────────────────────────────────
    doc.setFontSize(11);
    doc.setTextColor(200, 200, 210);
    doc.text(`Target: ${url}`, 20, 40);
    doc.text(`Generated: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST`, 20, 47);

    // ── Aggregate Score circle ─────────────────────────────────────────
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.5);
    doc.circle(175, 42, 15, 'S');
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(aggregate.toFixed(1), 175, 42, { align: 'center', baseline: 'middle' } as any);
    doc.setFontSize(8);
    doc.text('/ 10', 175, 50, { align: 'center' });
    doc.setFontSize(11);
    doc.text(`Grade: ${gr}`, 175, 56, { align: 'center' });

    // ── Pillar Scores Table ───────────────────────────────────────────
    const pillarRows = [
        ['Market Presence', scores.marketPresence.toFixed(2), score2label(scores.marketPresence)],
        ['Technical Health', scores.technicalHealth.toFixed(2), score2label(scores.technicalHealth)],
        ['Security', scores.security.toFixed(2), score2label(scores.security)],
        ['Innovation & Technology', scores.innovation.toFixed(2), score2label(scores.innovation)],
        ['Customer Experience', scores.customerExperience.toFixed(2), score2label(scores.customerExperience)],
        ['Content Quality', scores.contentQuality.toFixed(2), score2label(scores.contentQuality)],
    ];

    // @ts-ignore
    doc.autoTable({
        startY: 65,
        head: [['Pillar', 'Score /10', 'Rating']],
        body: pillarRows,
        theme: 'grid',
        headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontSize: 11, fontStyle: 'bold' },
        bodyStyles: { fillColor: [15, 17, 22], textColor: [220, 220, 230], fontSize: 10 },
        columnStyles: { 1: { halign: 'center' }, 2: { halign: 'center' } },
        styles: { cellPadding: 4, lineColor: [40, 40, 50], lineWidth: 0.3 },
    });

    // @ts-ignore
    const afterTable: number = doc.lastAutoTable?.finalY ?? 145;

    // ── Key Insights ──────────────────────────────────────────────────
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('Key Technical Findings', 20, afterTable + 15);

    const insights: string[] = buildInsights(rawData);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(190, 190, 200);
    insights.forEach((line, i) => {
        doc.text(line, 22, afterTable + 24 + i * 7);
    });

    const insY = afterTable + 24 + insights.length * 7 + 10;

    // ── Strategic Actions ─────────────────────────────────────────────
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('Strategic Action Plan', 20, insY);

    const actions = buildActions(scores, rawData);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(190, 190, 200);
    actions.forEach((line, i) => {
        doc.text(line, 22, insY + 9 + i * 7);
    });

    // ── Footer ────────────────────────────────────────────────────────
    doc.setFillColor(255, 255, 255);
    doc.rect(0, H - 3, W, 3, 'F');
    doc.setFontSize(8);
    doc.setTextColor(80, 80, 90);
    doc.text('Confidential — Turtle Labs Brand Intelligence Platform', W / 2, H - 6, { align: 'center' });

    return doc;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function score2label(s: number): string {
    if (s >= 8.5) return '★ Excellent';
    if (s >= 7) return '✔ Good';
    if (s >= 5) return '⚠ Moderate';
    return '✗ Needs work';
}

function buildInsights(r: Record<string, string>): string[] {
    const lines: string[] = [];
    if (!r['Meta Description']) lines.push('✗ Missing meta description — critical for SEO ranking.');
    else if (Number(r['Description Length']) < 80) lines.push('⚠ Meta description too short (< 80 chars).');
    else lines.push('✔ Meta description is present and adequate.');

    if (!r['H1 Tag']) lines.push('✗ No H1 tag detected — hurts semantic structure badly.');
    else if (r['H1 Count'] !== '1') lines.push(`⚠ Found ${r['H1 Count']} H1 tags — only 1 is recommended.`);
    else lines.push('✔ Exactly one H1 tag — good semantic clarity.');

    const ssl = (r['Has SSL'] ?? '').toLowerCase();
    lines.push(ssl === 'yes' ? '✔ SSL certificate active.' : '✗ No SSL certificate — serious security risk.');

    const lms = Number(r['Load Time (ms)']);
    if (lms > 3000) lines.push(`✗ Slow page load: ${lms} ms — affects bounce rates and SEO.`);
    else if (lms > 1000) lines.push(`⚠ Moderate load time: ${lms} ms — consider optimisation.`);
    else lines.push(`✔ Fast page: ${lms} ms load time.`);

    const mob = (r['Mobile Friendly'] ?? '').toLowerCase();
    lines.push(mob === 'yes' ? '✔ Mobile-friendly confirmed.' : '✗ Not mobile-friendly — huge ranking penalty.');

    if (r['Broken Links'] && Number(r['Broken Links']) > 0)
        lines.push(`✗ ${r['Broken Links']} broken link(s) detected — degrades trust & SEO.`);

    return lines;
}

function buildActions(scores: Scores, r: Record<string, string>): string[] {
    const acts: string[] = [];
    if (scores.marketPresence < 7)
        acts.push('1. Strengthen social media presence across LinkedIn, Instagram & YouTube.');
    if (scores.technicalHealth < 7)
        acts.push('2. Optimise images and defer non-critical JS to reduce load time below 1 s.');
    if (scores.security < 7)
        acts.push('3. Install security headers (CSP, HSTS, X-Frame-Options) immediately.');
    if (scores.innovation < 5)
        acts.push('4. Integrate web analytics and structured data (Schema.org JSON-LD).');
    if (scores.customerExperience < 7)
        acts.push('5. Build a dedicated Contact page with address and phone number.');
    if (scores.contentQuality < 7)
        acts.push('6. Add descriptive alt text to all images and expand body copy > 500 words.');
    if (acts.length === 0) acts.push('✔ Excellent baseline — focus on advanced CRO and link building.');
    return acts;
}
