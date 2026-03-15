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

type AuditCategoryMap = Record<string, { score?: number; confidence?: number }>;

type StoredMeta = {
  aiSummary?: unknown;
  [key: string]: unknown;
};

type AuditFindingRow = {
  code: string;
  title: string;
  category: string;
  severity: string;
  confidence: number;
  recommendation: string;
  effort: string;
  impact: string;
  evidence?: unknown;
};

export async function POST(request: Request) {
  let inputUrl = '';
  let normalisedUrl = '';
  let userEmail: string | null = null;

  try {
    const body = await request.json().catch(() => ({}));
    inputUrl = String((body as { url?: string })?.url || '').trim();

    if (!inputUrl) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    normalisedUrl = normaliseUrl(inputUrl);
  } catch (err: unknown) {
    return NextResponse.json(
      {
        error: 'Invalid request payload',
        stage: 'request-parse',
        details: err instanceof Error ? err.message : 'Unknown parse error',
      },
      { status: 400 }
    );
  }

  try {
    try {
      const session = await getServerSession(authOptions);
      userEmail = session?.user?.email || null;
    } catch (authErr: unknown) {
      console.error(
        '[/api/audit] AUTH_FAILED (continuing as guest):',
        authErr instanceof Error ? authErr.message : authErr
      );
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
      const cachedCategories = (cachedAudit.categories || {}) as AuditCategoryMap;
      const cachedMeta = (cachedAudit.meta || {}) as StoredMeta;

      const scores = {
        marketPresence: Number(cachedCategories?.SEO?.score || 0),
        technicalHealth: Number(cachedCategories?.Performance?.score || 0),
        security: Number(cachedCategories?.Security?.score || 0),
        innovation: Number(cachedCategories?.UX?.score || 0),
        customerExperience: Number(cachedCategories?.Accessibility?.score || 0),
        contentQuality: Number(cachedCategories?.Content?.score || 0),
      };

      const aggregate = Number(cachedAudit.overallScore || 0);

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

    let auditData: {
      uid: string;
      overallScore: number;
      categories: AuditCategoryMap;
      findings: AuditFindingRow[];
      meta?: StoredMeta;
    };

    try {
      const engine = new AuditEngine(normalisedUrl);
      auditData = await engine.run();
    } catch (auditErr: unknown) {
      console.error('[/api/audit] ENGINE_FAILED:', auditErr);
      return NextResponse.json(
        {
          error: auditErr instanceof Error ? auditErr.message : 'Audit engine failed',
          stage: 'audit-engine',
          url: normalisedUrl,
        },
        { status: 502 }
      );
    }

    let findings: AuditFindingRow[] = Array.isArray(auditData?.findings) ? auditData.findings : [];
    findings = findings.slice(0, MAX_FINDINGS_RETURNED).map((f) => ({
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

    let aiSummary: unknown = null;
    try {
      const aiInput = findings.slice(0, MAX_FINDINGS_FOR_AI).map((f) => ({
        code: f.code,
        title: f.title,
        category: f.category,
        severity: f.severity,
        recommendation: f.recommendation,
      }));

      aiSummary = await getAiInsights(normalisedUrl, aiInput);
    } catch (aiErr: unknown) {
      console.error(
        '[/api/audit] AI_FAILED (continuing without AI):',
        aiErr instanceof Error ? aiErr.message : aiErr
      );
      aiSummary = null;
    }

    const safeMeta: StoredMeta = {
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
          categories: auditData.categories as object,
          meta: safeMeta as object,
          findings: {
            create: findings.map((f) => ({
              code: f.code,
              title: f.title,
              category: f.category,
              severity: f.severity,
              confidence: f.confidence,
              recommendation: f.recommendation,
              effort: f.effort,
              impact: f.impact,
              evidence: f.evidence as any,
            })),
          },
        },
      });
      persistedToDb = true;
    } catch (dbErr: unknown) {
      console.error(
        '[/api/audit] DB_FAILED (continuing without persistence):',
        dbErr instanceof Error ? dbErr.message : dbErr
      );
    }

    const scores = {
      marketPresence: Number(auditData?.categories?.SEO?.score || 0),
      technicalHealth: Number(auditData?.categories?.Performance?.score || 0),
      security: Number(auditData?.categories?.Security?.score || 0),
      innovation: Number(auditData?.categories?.UX?.score || 0),
      customerExperience: Number(auditData?.categories?.Accessibility?.score || 0),
      contentQuality: Number(auditData?.categories?.Content?.score || 0),
    };

    const aggregate = Number(auditData?.overallScore || 0);

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
  } catch (err: unknown) {
    console.error('[/api/audit] UNHANDLED_FATAL:', err);
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : 'Unhandled audit failure',
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
