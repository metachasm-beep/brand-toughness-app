import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { generateBrandPlaybook } from '@/lib/pdf/generator';

export const runtime = 'nodejs';

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        // In a real scenario, check if the user is PRO or has paid for this specific audit
        
        const body = await request.json();
        const { uid } = body;

        if (!uid) {
            return NextResponse.json({ error: 'Audit UID is required' }, { status: 400 });
        }

        const audit = await prisma.audit.findUnique({
            where: { uid },
            include: { brandIdentity: true }
        });

        if (!audit || !audit.brandIdentity) {
            return NextResponse.json({ error: 'Audit or Brand Identity not found' }, { status: 404 });
        }

        // Prepare data for PDF
        const playbookData = {
            url: audit.url,
            scores: {
                clarity: (audit.clarityScore as number) || 0,
                consistency: (audit.consistencyScore as number) || 0,
                differentiation: (audit.differentiationScore as number) || 0,
                emotionalImpact: (audit.emotionalImpactScore as number) || 0,
            },
            profile: {
                corePromise: audit.brandIdentity.businessDesc || '',
                targetAudience: audit.brandIdentity.targetAudience || '',
                toneOfVoice: audit.brandIdentity.toneOfVoice || '',
                marketPositioning: audit.brandIdentity.positioning || '',
            },
            playbook: audit.brandIdentity.playbook as any
        };

        const pdfBuffer = await generateBrandPlaybook(playbookData);

        return new NextResponse(new Uint8Array(pdfBuffer), {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="BrandOS_Strategy_${uid}.pdf"`,
            },
        });

    } catch (err: any) {
        console.error('[/api/pdf] Error:', err);
        return NextResponse.json({ error: err.message ?? 'PDF Generation Failed' }, { status: 500 });
    }
}
