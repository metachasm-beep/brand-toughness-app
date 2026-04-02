import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export interface PlaybookData {
    url: string;
    scores: {
        clarity: number;
        consistency: number;
        differentiation: number;
        emotionalImpact: number;
    };
    profile: {
        corePromise: string;
        targetAudience: string;
        toneOfVoice: string;
        marketPositioning: string;
    };
    playbook: {
        homepageArchitecture: { h1: string; subtext: string; cta: string };
        adCopyDirections: string[];
        contentThemes: string[];
        conversionGaps: string[];
        lowHangingFruit: string[];
    };
}

export async function generateBrandPlaybook(data: PlaybookData): Promise<Buffer> {
    const doc = new jsPDF() as any;
    const { profile, scores, playbook, url } = data;

    // --- Page 1: Hero / Title ---
    doc.setFillColor(11, 15, 20); // Dark Brand Background
    doc.rect(0, 0, 210, 297, 'F');
    
    doc.setTextColor(176, 92, 255); // Brand Purple
    doc.setFontSize(48);
    doc.setFont('helvetica', 'bold');
    doc.text('BRAND OS', 20, 60);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.text('STRATEGIC COMMUNICATION PLAYBOOK', 20, 80);
    
    doc.setFontSize(12);
    doc.setTextColor(150, 150, 150);
    doc.text(`Intelligence Audit for: ${url}`, 20, 95);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 102);

    // --- Page 2: Executive Score ---
    doc.addPage();
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, 210, 297, 'F');
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(24);
    doc.text('Brand Alignment Scores', 20, 30);

    const scoreTable = [
        ['Metric', 'Score', 'Status'],
        ['Clarity', `${scores.clarity}%`, scores.clarity > 70 ? 'Optimal' : 'Needs Work'],
        ['Consistency', `${scores.consistency}%`, scores.consistency > 70 ? 'Optimal' : 'Gap Detected'],
        ['Differentiation', `${scores.differentiation}%`, scores.differentiation > 70 ? 'Optimal' : 'Invisible'],
        ['Emotional Impact', `${scores.emotionalImpact}%`, scores.emotionalImpact > 70 ? 'High Resonance' : 'Low Connection'],
    ];

    doc.autoTable({
        startY: 45,
        head: [scoreTable[0]],
        body: scoreTable.slice(1),
        theme: 'striped',
        headStyles: { fillColor: [176, 92, 255] },
    });

    // --- Page 3: Strategic Identity ---
    doc.setFontSize(18);
    doc.text('Strategic Identity Profile', 20, doc.lastAutoTable.finalY + 30);
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Core Promise:', 20, doc.lastAutoTable.finalY + 45);
    doc.setFont('helvetica', 'normal');
    doc.text(profile.corePromise, 20, doc.lastAutoTable.finalY + 52, { maxWidth: 170 });

    doc.setFont('helvetica', 'bold');
    doc.text('Target Audience:', 20, doc.lastAutoTable.finalY + 70);
    doc.setFont('helvetica', 'normal');
    doc.text(profile.targetAudience, 20, doc.lastAutoTable.finalY + 77, { maxWidth: 170 });

    // --- Page 4: Messaging Playbook ---
    doc.addPage();
    doc.setFontSize(24);
    doc.text('Messaging Strategy', 20, 30);

    doc.setFontSize(14);
    doc.setTextColor(176, 92, 255);
    doc.text('Homepage Architecture (Optimized)', 20, 45);
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Proposed H1:', 20, 55);
    doc.setFont('helvetica', 'normal');
    doc.text(playbook.homepageArchitecture.h1, 20, 62, { maxWidth: 170 });

    doc.setFont('helvetica', 'bold');
    doc.text('Proposed Subtext:', 20, 75);
    doc.setFont('helvetica', 'normal');
    doc.text(playbook.homepageArchitecture.subtext, 20, 82, { maxWidth: 170 });

    doc.setFont('helvetica', 'bold');
    doc.text('Primary CTA:', 20, 95);
    doc.setFont('helvetica', 'normal');
    doc.text(playbook.homepageArchitecture.cta, 20, 102);

    // Final Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`BrandOS Strategy Module · Confidential Intelligence Report · Page ${i} of ${pageCount}`, 105, 285, { align: 'center' });
    }

    return Buffer.from(doc.output('arraybuffer'));
}
