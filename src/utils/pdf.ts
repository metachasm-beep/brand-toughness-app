import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
// Note: Type assertions provided natively by jspdf-autotable plugin injects autoTable to jsPDF type

export async function generatePDF(scores: number[], url: string, details: any) {
    // Simple grade logic (mirrors the scoring algorithm)
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    const grade = avg >= 9 ? 'S' : avg >= 8 ? 'A' : avg >= 6 ? 'B' : avg >= 4 ? 'C' : 'D';

    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
    });

    // Header background (Rugged Red #c44536)
    doc.setFillColor(196, 69, 54);
    doc.rect(0, 0, 210, 40, 'F');

    // Header Text
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('Brand Toughness Strategy Report', 105, 20, { align: 'center' });

    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text(`Protecting & Enhancing the Human Condition`, 105, 28, { align: 'center' });

    // Score & grade
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(`Analyzed Website: ${url}`, 20, 55);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text(`Overall Resilience Score: ${Math.round((avg / 10) * 100)}%`, 20, 65);
    doc.text(`Toughness Grade: ${grade}`, 20, 72);

    // Radar data table
    const pillarNames = [
        'Food (Content Quality)',
        'Water (Navigation Flow)',
        'Shelter (Semantic Structure)',
        'Education (Accessibility)',
        'Work (Performance)',
        'Energy (Sustainability/Code Cleanliness)'
    ];

    const tableData = pillarNames.map((p, i) => [p, `${scores[i]}/10`]);

    // @ts-ignore jspdf-autotable typings issue workaround
    if (typeof doc.autoTable === 'function') {
        // @ts-ignore
        doc.autoTable({
            startY: 85,
            head: [['Resilience Pillar', 'Score (0-10)']],
            body: tableData,
            theme: 'grid',
            headStyles: { fillColor: [196, 69, 54] },
            styles: { fontSize: 11, cellPadding: 5 }
        });
    }

    // SEO Insights mapped to Human Condition Mission
    // @ts-ignore
    const finalY = (typeof doc.autoTable === 'function' && doc.lastAutoTable) ? doc.lastAutoTable.finalY : 140;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Key Technical Insights', 20, finalY + 15);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    const insights = [];

    if (details.metaDescription) {
        if (details.metaDescription.toLowerCase().includes('protecting') || details.metaDescription.toLowerCase().includes('human condition')) {
            insights.push('✅ Meta Description accurately reflects the core human-centric mission.');
        } else {
            insights.push('⚠️ Meta Description lacks a strong mission statement. Consider adding "enhancing the human condition".');
        }
    } else {
        insights.push('❌ Missing Meta Description: Users and crawlers lack brand storytelling context.');
    }

    if (details.h1Count !== 1) {
        insights.push(`❌ Structural Flaw: Found ${details.h1Count} H1 tags. A clear semantic hierarchy is essential.`);
    } else {
        insights.push('✅ Clear H1 Structure establishes solid digital shelter.');
    }

    if (details.imagesMissingAlt > 0) {
        insights.push(`⚠️ Accessibility Gap: ${details.imagesMissingAlt} images missing adequate alt-text. Empathy in design requires inclusive accessibility.`);
    }

    insights.forEach((ins, i) => {
        doc.text(`• ${ins}`, 25, finalY + 25 + i * 8);
    });

    // Recommended actions
    const actionsStartY = finalY + 25 + (insights.length * 8) + 15;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Strategic Action Plan', 20, actionsStartY);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    const actions = [
        '1. Align all meta tags and headings with sustainable brand development values.',
        '2. Audit internal components replacing `<img>` with optimized elements and descriptive alt-text.',
        '3. Enhance digital structure by ensuring strict H1-H6 semantic nesting.',
        '4. Refactor heavy assets to reduce energy footprint to "zero-waste" digital standards.'
    ];

    actions.forEach((act, i) => {
        doc.text(act, 25, actionsStartY + 10 + i * 8);
    });

    return doc;
}
