import { chromium } from 'playwright';
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';

export type RenderedAuditResult = {
  url: string;
  finalUrl: string;
  lighthouse: {
    performance: number;
    accessibility: number;
    seo: number;
    bestPractices: number;
  };
  coreWebVitals: {
    lcp?: number | null;
    cls?: number | null;
    tbt?: number | null;
    fcp?: number | null;
    si?: number | null;
  };
  categories: Record<string, { score: number; confidence: number }>;
  findings: Array<{
    code: string;
    title: string;
    category: string;
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    confidence: number;
    recommendation: string;
    effort: 'EASY' | 'MEDIUM' | 'HARD';
    impact: string;
    evidence?: any;
  }>;
  meta: Record<string, any>;
};

function lhSeverity(score: number): 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' {
  if (score < 30) return 'CRITICAL';
  if (score < 60) return 'HIGH';
  if (score < 85) return 'MEDIUM';
  return 'LOW';
}

function normalizeUrl(input: string): string {
  const trimmed = String(input || '').trim();
  if (!trimmed) throw new Error('URL is required');
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export async function runRenderedAudit(inputUrl: string): Promise<RenderedAuditResult> {
  const url = normalizeUrl(inputUrl);

  let browser;
  let page;
  let chrome;

  try {
    browser = await chromium.launch({
      headless: true,
    });

    const context = await browser.newContext({
      viewport: { width: 1440, height: 960 },
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    });

    page = await context.newPage();

    await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: 45000,
    });

    await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {});

    const finalUrl = page.url();

    await browser.close();

    chrome = await chromeLauncher.launch({
      chromeFlags: ['--headless=new', '--disable-gpu', '--no-sandbox'],
    });

    const options = {
      logLevel: 'error' as const,
      output: 'json' as const,
      onlyCategories: ['performance', 'accessibility', 'seo', 'best-practices'],
      port: chrome.port,
    };

    const runnerResult = await lighthouse(finalUrl, options);

    if (!runnerResult?.lhr) {
      throw new Error('Lighthouse did not return a valid report');
    }

    const lhr = runnerResult.lhr;
    const audits = lhr.audits || {};

    const performance = Math.round((lhr.categories.performance?.score || 0) * 100);
    const accessibility = Math.round((lhr.categories.accessibility?.score || 0) * 100);
    const seo = Math.round((lhr.categories.seo?.score || 0) * 100);
    const bestPractices = Math.round((lhr.categories['best-practices']?.score || 0) * 100);

    const findings: RenderedAuditResult['findings'] = [];

    const categoryFindings = [
      {
        code: 'LH_CATEGORY_PERFORMANCE',
        title: 'Rendered Performance Score',
        category: 'Performance',
        score: performance,
      },
      {
        code: 'LH_CATEGORY_ACCESSIBILITY',
        title: 'Rendered Accessibility Score',
        category: 'Accessibility',
        score: accessibility,
      },
      {
        code: 'LH_CATEGORY_SEO',
        title: 'Rendered SEO Score',
        category: 'SEO',
        score: seo,
      },
      {
        code: 'LH_CATEGORY_BEST_PRACTICES',
        title: 'Rendered Best Practices Score',
        category: 'Security',
        score: bestPractices,
      },
    ];

    for (const item of categoryFindings) {
      if (item.score < 95) {
        findings.push({
          code: item.code,
          title: item.title,
          category: item.category,
          severity: lhSeverity(item.score),
          confidence: 0.98,
          recommendation: `Improve ${item.category.toLowerCase()} signals in rendered audit flow.`,
          effort: 'MEDIUM',
          impact: 'Rendered Lighthouse category score',
          evidence: { score: item.score },
        });
      }
    }

    const interestingAudits = [
      'largest-contentful-paint',
      'cumulative-layout-shift',
      'total-blocking-time',
      'first-contentful-paint',
      'speed-index',
      'interactive',
      'uses-https',
      'is-crawlable',
      'document-title',
      'meta-description',
      'aria-allowed-attr',
      'button-name',
      'image-alt',
      'color-contrast',
    ];

    for (const auditId of interestingAudits) {
      const audit = audits[auditId];
      if (!audit) continue;

      if (typeof audit.score === 'number' && audit.score < 0.9) {
        const mappedCategory =
          auditId.includes('aria') ||
          auditId.includes('button') ||
          auditId.includes('image-alt') ||
          auditId.includes('color-contrast')
            ? 'Accessibility'
            : auditId.includes('title') ||
              auditId.includes('description') ||
              auditId.includes('crawl')
            ? 'SEO'
            : auditId.includes('https')
            ? 'Security'
            : 'Performance';

        findings.push({
          code: `LH_${auditId.toUpperCase().replace(/[^A-Z0-9_]/g, '_')}`,
          title: audit.title || auditId,
          category: mappedCategory,
          severity: lhSeverity(Math.round((audit.score || 0) * 100)),
          confidence: 0.96,
          recommendation: audit.description || 'Review this Lighthouse audit.',
          effort: 'MEDIUM',
          impact: 'Rendered audit diagnostic',
          evidence: {
            score: audit.score,
            displayValue: audit.displayValue,
            numericValue: audit.numericValue,
          },
        });
      }
    }

    const categories = {
      SEO: { score: seo, confidence: 0.96 },
      Security: { score: bestPractices, confidence: 0.95 },
      Accessibility: { score: accessibility, confidence: 0.97 },
      Performance: { score: performance, confidence: 0.98 },
      UX: {
        score: Math.round((accessibility * 0.45 + performance * 0.35 + seo * 0.2)),
        confidence: 0.9,
      },
    };

    return {
      url,
      finalUrl,
      lighthouse: {
        performance,
        accessibility,
        seo,
        bestPractices,
      },
      coreWebVitals: {
        lcp: audits['largest-contentful-paint']?.numericValue ?? null,
        cls: audits['cumulative-layout-shift']?.numericValue ?? null,
        tbt: audits['total-blocking-time']?.numericValue ?? null,
        fcp: audits['first-contentful-paint']?.numericValue ?? null,
        si: audits['speed-index']?.numericValue ?? null,
      },
      categories,
      findings,
      meta: {
        fetchMode: 'rendered',
        userAgent: lhr.userAgent,
        lighthouseVersion: lhr.lighthouseVersion,
        finalDisplayedUrl: lhr.finalDisplayedUrl,
        requestedUrl: lhr.requestedUrl,
      },
    };
  } finally {
    try {
      if (page) await page.close();
    } catch {}
    try {
      if (browser) await browser.close();
    } catch {}
    try {
      if (chrome) await chrome.kill();
    } catch {}
  }
}
