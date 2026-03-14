import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 180;

type RenderedAuditResponse = {
  url: string;
  finalUrl?: string;
  categories: Record<string, { score: number; confidence: number }>;
  coreWebVitals: {
    lcp?: number | null;
    cls?: number | null;
    tbt?: number | null;
    fcp?: number | null;
    si?: number | null;
  };
  lighthouse: {
    performance: number;
    accessibility: number;
    seo: number;
    bestPractices: number;
  };
  findings: Array<{
    code: string;
    title: string;
    category: string;
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    confidence: number;
    recommendation: string;
    effort: 'EASY' | 'MEDIUM' | 'HARD';
    impact: string;
    evidence?: unknown;
  }>;
  meta: Record<string, unknown>;
};

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const url = String((body as { url?: string })?.url || '').trim();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    let runRenderedAudit: ((inputUrl: string) => Promise<RenderedAuditResponse>);

    try {
      ({ runRenderedAudit } = await import('@/lib/audit/renderedAudit'));
    } catch (importErr: unknown) {
      return NextResponse.json(
        {
          error:
            'Rendered audit dependencies are not installed. Install playwright, lighthouse, and chrome-launcher.',
          stage: 'rendered-audit-import',
          details: importErr instanceof Error ? importErr.message : 'Import failed',
        },
        { status: 500 }
      );
    }

    const rendered = await runRenderedAudit(url);

    const overallScore = Math.round(
      rendered.categories.SEO.score * 0.24 +
        rendered.categories.Performance.score * 0.24 +
        rendered.categories.Security.score * 0.2 +
        rendered.categories.Accessibility.score * 0.17 +
        rendered.categories.UX.score * 0.15
    );

    const aggregate = Number((overallScore / 10).toFixed(1));

    return NextResponse.json({
      url: rendered.finalUrl || rendered.url,
      scores: {
        marketPresence: rendered.categories.SEO.score,
        technicalHealth: rendered.categories.Performance.score,
        security: rendered.categories.Security.score,
        innovation: rendered.categories.UX.score,
        customerExperience: rendered.categories.Accessibility.score,
        contentQuality: 8.8,
      },
      aggregate,
      rawData: {
        ...rendered.meta,
        coreWebVitals: rendered.coreWebVitals,
        lighthouse: rendered.lighthouse,
      },
      findings: rendered.findings,
      uid: `rendered-${Date.now()}`,
      aiSummary: null,
      debug: {
        source: 'rendered-lighthouse',
        cached: false,
      },
    });
  } catch (err: unknown) {
    console.error('[/api/audit-rendered] FAILED:', err);

    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : 'Rendered Lighthouse audit failed',
        stage: 'rendered-audit',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    route: '/api/audit-rendered',
    mode: 'playwright + headless chrome + lighthouse',
  });
}
