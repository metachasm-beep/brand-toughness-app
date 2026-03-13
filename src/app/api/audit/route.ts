import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AuditEngine } from '@/lib/audit/engine';
import { getAiInsights } from '@/lib/audit/ai';
import { getPrisma } from '@/lib/db';
import { normaliseUrl } from '@/utils/googleSheet';

export const runtime = 'nodejs';
export const maxDuration = 120;

const MAX_FINDINGS_RETURNED = 60;
const MAX_FINDINGS_FOR_AI = 20;
const CACHE_WINDOW_MS = 24 * 60 * 60 * 1000;

export async function POST(request: Request) {
  let inputUrl = '';
  let normalisedUrl = '';
  let userEmail: string | null = null;

  try {
    const body = await request.json().catch(() => ({}));
    inputUrl = String(body?.url || '').trim();

    if (!inputUrl) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    normalisedUrl = normaliseUrl(inputUrl);
  } catch (err: any) {
    return NextResponse.json(
      {
        error: 'Invalid request payload',
        stage: 'request-parse',
        details: err?.message || 'Unknown parse error',
      },
      { status: 400 }
    );
  }

  try {
    try {
      const session = await getServerSession(authOptions);
      userEmail = session?.user?.email || null;
    } catch (authErr: any) {
      console.error('[/api/audit] AUTH_FAILED (continuing as guest):', authErr?.message);
    }

    const prisma = await getPrisma();

    const cachedAudit = await prisma.audit.findFirst({
      where: {
        url: normalisedUrl,
        status: 'COMPLETED',
        createdAt: {
          gte: new Date(Date.now() - CACHE_WINDOW_MS),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        findings: true,
      },
    });

    if (cachedAudit) {
      const cachedCategories = (cachedAudit.categories || {}) as any;
      const cachedMeta = (cachedAudit.meta || {}) as any;

      const scores = {
        marketPresence: Number(cachedCategories?.SEO?.score || 0),
        technicalHealth: Number(cachedCategories?.Performance?.score || 0),
        security: Number(cachedCategories?.Security?.score || 0),
        innovation: Number(cachedCategories?.UX?.score || 0),
        customerExperience: Number(cachedCategories?.Accessibility?.score || 0),
        contentQuality: 8.5,
      };

      const aggregate = Number((Number(cachedAudit.overallScore || 0) / 10).toFixed(1));

      return NextResponse.json({
        url: normalisedUrl,
        scores,
        aggregate,
        rawData: cachedMeta,
        findings: Array.isArray(cachedAudit.findings)
          ? cachedAudit.findings.slice(0, MAX_FINDINGS_RETURNED)
          : [],
        uid: cachedAudit.uid,
        aiSummary: cachedMeta?.aiSummary || null,
        debug: {
          source: 'cache',
          cached: true,
          cachedAt: cachedAudit.createdAt,
        },
      });
    }

    let auditData: any;
    try {
      const engine = new AuditEngine(normalisedUrl);
      auditData = await engine.run();
    } catch (auditErr: any) {
      console.error('[/api/audit] ENGINE_FAILED:', auditErr);
      return NextResponse.json(
        {
          error: auditErr?.message || 'Audit engine failed',
          stage: 'audit-engine',
          url: normalisedUrl,
        },
        { status: 502 }
      );
    }

    let findings = Array.isArray(auditData?.findings) ? auditData.findings : [];
    findings = findings.slice(0, MAX_FINDINGS_RETURNED).map((f: any) => ({
      code: String(f.code || ''),
      title: String(f.title || ''),
      category: String(f.category || 'General'),
      severity: String(f.severity || 'LOW'),
      confidence: Number(f.confidence || 0),
      recommendation: String(f.recommendation || ''),
      effort: String(f.effort || 'MEDIUM'),
      impact: String(f.impact || ''),
      evidence: f.evidence || null,
    }));

    let aiSummary: any = null;
    try {
      const aiInput = findings.slice(0, MAX_FINDINGS_FOR_AI).map((f: any) => ({
        code: f.code,
        title: f.title,
        category: f.category,
        severity: f.severity,
        recommendation: f.recommendation,
      }));

      aiSummary = await getAiInsights(normalisedUrl, aiInput);
    } catch (aiErr: any) {
      console.error('[/api/audit] AI_FAILED (continuing without AI):', aiErr?.message);
      aiSummary = null;
    }

    const safeMeta = {
      statusCode: auditData?.meta?.statusCode || null,
      contentType: auditData?.meta?.contentType || null,
      server: auditData?.meta?.server || null,
      htmlBytes: auditData?.meta?.htmlBytes || null,
      aiSummary,
    };

    let persistedToDb = false;

    try {
      await prisma.audit.create({
        data: {
          url: normalisedUrl,
          uid: auditData.uid,
          status: 'COMPLETED',
          userEmail,
          overallScore: Number(auditData.overallScore || 0),
          categories: (auditData.categories || {}) as any,
          meta: safeMeta as any,
          findings: {
            create: findings.map((f: any) => ({
              code: f.code,
              title: f.title,
              category: f.category,
              severity: f.severity,
              confidence: f.confidence,
              recommendation: f.recommendation,
              effort: f.effort,
              impact: f.impact,
              evidence: f.evidence,
            })),
          },
        },
      });
      persistedToDb = true;
    } catch (dbErr: any) {
      console.error('[/api/audit] DB_FAILED (continuing without persistence):', dbErr?.message);
    }

    const scores = {
      marketPresence: Number(auditData?.categories?.SEO?.score || 0),
      technicalHealth: Number(auditData?.categories?.Performance?.score || 0),
      security: Number(auditData?.categories?.Security?.score || 0),
      innovation: Number(auditData?.categories?.UX?.score || 0),
      customerExperience: Number(auditData?.categories?.Accessibility?.score || 0),
      contentQuality: 8.5,
    };

    const aggregate = Number((Number(auditData?.overallScore || 0) / 10).toFixed(1));

    return NextResponse.json({
      url: normalisedUrl,
      scores,
      aggregate,
      rawData: safeMeta,
      findings,
      uid: auditData?.uid || null,
      aiSummary,
      debug: {
        source: 'fresh',
        cached: false,
        aiIncluded: !!aiSummary,
        persistedToDb,
      },
    });
  } catch (err: any) {
    console.error('[/api/audit] UNHANDLED_FATAL:', err);
    return NextResponse.json(
      {
        error: err?.message || 'Unhandled audit failure',
        stage: 'unhandled',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    route: '/api/audit',
    runtime: 'nodejs',
    cacheWindowHours: 24,
  });
}
