// f:\ANTIGRAVITY\WebsiteAudit\brand-toughness-app\src\lib\audit\engine.ts
import 'server-only';

import axios, { AxiosResponseHeaders, RawAxiosResponseHeaders } from 'axios';
import * as cheerio from 'cheerio';
import { v4 as uuidv4 } from 'uuid';

export interface AuditFinding {
  code: string;
  title: string;
  category: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  confidence: number;
  recommendation: string;
  effort: 'EASY' | 'MEDIUM' | 'HARD';
  impact: string;
  evidence?: any;
}

export interface AuditResult {
  url: string;
  uid: string;
  overallScore: number;
  categories: Record<string, { score: number; confidence: number }>;
  findings: AuditFinding[];
  meta: any;
}

type HeaderMap = Record<string, string>;

export class AuditEngine {
  private url: string;
  private html = '';
  private headers: HeaderMap = {};
  private status = 0;
  private findings: AuditFinding[] = [];

  constructor(url: string) {
    this.url = this.normalizeUrl(url);
  }

  async run(): Promise<AuditResult> {
    const uid = uuidv4();

    try {
      await this.fetchPage();

      this.runSeoChecks();
      this.runSecurityChecks();
      this.runAccessibilityChecks();
      this.runContentChecks();
      this.runUXChecks();
      await this.runAsyncChecks();

      const categories = this.calculateCategoryScores();
      const overallScore = this.calculateOverallScore(categories);

      return {
        url: this.url,
        uid,
        overallScore,
        categories,
        findings: this.findings,
        meta: {
          statusCode: this.status,
          contentType: this.getHeader('content-type'),
          server: this.getHeader('server'),
        },
      };
    } catch (error: any) {
      throw new Error(`Audit failed: ${error?.message || 'Unknown error'}`);
    }
  }

  private normalizeUrl(input: string): string {
    const trimmed = String(input || '').trim();
    if (!trimmed) {
      throw new Error('URL is required.');
    }

    if (/^https?:\/\//i.test(trimmed)) {
      return trimmed;
    }

    return `https://${trimmed}`;
  }

  private async fetchPage(): Promise<void> {
    const response = await axios.get(this.url, {
      timeout: 45000,
      maxRedirects: 5,
      responseType: 'text',
      transformResponse: [(data) => data],
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
      },
      validateStatus: () => true,
    });

    this.status = response.status;
    this.headers = this.normalizeHeaders(response.headers);

    const contentType = this.getHeader('content-type');
    const rawData = response.data;

    if (typeof rawData !== 'string') {
      this.html = '';
      this.addFinding({
        code: 'FETCH_NON_HTML_RESPONSE',
        title: 'Non-HTML Response',
        category: 'SEO',
        severity: 'HIGH',
        confidence: 1,
        recommendation: 'Ensure the URL returns a valid HTML document.',
        effort: 'MEDIUM',
        impact: 'High',
        evidence: { contentType, status: this.status },
      });
      return;
    }

    this.html = rawData;

    if (!contentType.includes('text/html') && !contentType.includes('application/xhtml+xml')) {
      this.addFinding({
        code: 'FETCH_UNEXPECTED_CONTENT_TYPE',
        title: 'Unexpected Content Type',
        category: 'SEO',
        severity: 'MEDIUM',
        confidence: 0.95,
        recommendation: 'Ensure the audited URL serves HTML content.',
        effort: 'EASY',
        impact: 'Medium',
        evidence: { contentType, status: this.status },
      });
    }

    if (this.status >= 400) {
      this.addFinding({
        code: 'FETCH_HTTP_ERROR',
        title: `HTTP Error ${this.status}`,
        category: 'UX',
        severity: this.status >= 500 ? 'CRITICAL' : 'HIGH',
        confidence: 1,
        recommendation: 'Fix the page response status and ensure the URL is publicly accessible.',
        effort: 'MEDIUM',
        impact: 'Critical',
        evidence: { status: this.status },
      });
    }

    if (!this.html.trim()) {
      this.addFinding({
        code: 'FETCH_EMPTY_HTML',
        title: 'Empty HTML Response',
        category: 'SEO',
        severity: 'CRITICAL',
        confidence: 1,
        recommendation: 'Ensure the page returns a rendered HTML document.',
        effort: 'MEDIUM',
        impact: 'Critical',
      });
    }
  }

  private normalizeHeaders(
    headers: AxiosResponseHeaders | RawAxiosResponseHeaders | Record<string, any> | undefined
  ): HeaderMap {
    const out: HeaderMap = {};
    if (!headers || typeof headers !== 'object') return out;

    Object.entries(headers).forEach(([key, value]) => {
      const normalizedKey = String(key).toLowerCase();
      if (Array.isArray(value)) {
        out[normalizedKey] = value.join(', ');
      } else if (value !== undefined && value !== null) {
        out[normalizedKey] = String(value);
      }
    });

    return out;
  }

  private getHeader(name: string): string {
    return this.headers[name.toLowerCase()] || '';
  }

  private addFinding(finding: AuditFinding) {
    this.findings.push(finding);
  }

  private loadCheerio() {
    return cheerio.load(this.html || '');
  }

  private runSeoChecks() {
    const $ = this.loadCheerio();

    const title = $('title').first().text().trim();
    if (!title) {
      this.addFinding({
        code: 'SEO_MISSING_TITLE',
        title: 'Missing Page Title',
        category: 'SEO',
        severity: 'HIGH',
        confidence: 1.0,
        recommendation: 'Add a descriptive <title> tag.',
        effort: 'EASY',
        impact: 'Critical',
      });
    } else if (title.length < 30 || title.length > 70) {
      this.addFinding({
        code: 'SEO_TITLE_LENGTH',
        title: 'Title Length Suboptimal',
        category: 'SEO',
        severity: 'MEDIUM',
        confidence: 0.9,
        recommendation: 'Aim for a title length of about 50–60 characters.',
        effort: 'EASY',
        impact: 'Suboptimal',
        evidence: { length: title.length, title },
      });
    }

    const metaDesc = $('meta[name="description"]').attr('content')?.trim();
    if (!metaDesc) {
      this.addFinding({
        code: 'SEO_MISSING_META_DESC',
        title: 'Missing Meta Description',
        category: 'SEO',
        severity: 'HIGH',
        confidence: 1.0,
        recommendation: 'Add a meta description of roughly 150–160 characters.',
        effort: 'EASY',
        impact: 'High',
      });
    }

    const canonical = $('link[rel="canonical"]').attr('href')?.trim();
    if (!canonical) {
      this.addFinding({
        code: 'SEO_MISSING_CANONICAL',
        title: 'Missing Canonical Tag',
        category: 'SEO',
        severity: 'MEDIUM',
        confidence: 0.95,
        recommendation: 'Add <link rel="canonical" href="...">.',
        effort: 'EASY',
        impact: 'Medium',
      });
    }

    const h1Count = $('h1').length;
    if (h1Count === 0) {
      this.addFinding({
        code: 'SEO_MISSING_H1',
        title: 'No H1 Heading Found',
        category: 'SEO',
        severity: 'HIGH',
        confidence: 1.0,
        recommendation: 'Ensure the page contains exactly one meaningful <h1>.',
        effort: 'EASY',
        impact: 'High',
      });
    } else if (h1Count > 1) {
      this.addFinding({
        code: 'SEO_MULTIPLE_H1',
        title: 'Multiple H1 Headings',
        category: 'SEO',
        severity: 'LOW',
        confidence: 0.9,
        recommendation: 'Prefer one primary <h1> per page.',
        effort: 'EASY',
        impact: 'Low',
        evidence: { h1Count },
      });
    }

    if (!$('meta[property^="og:"]').length) {
      this.addFinding({
        code: 'SEO_MISSING_OG',
        title: 'Missing OpenGraph Tags',
        category: 'SEO',
        severity: 'LOW',
        confidence: 0.9,
        recommendation: 'Add OpenGraph tags such as og:title, og:description, and og:image.',
        effort: 'EASY',
        impact: 'Low',
      });
    }

    if (!$('meta[name^="twitter:"]').length) {
      this.addFinding({
        code: 'SEO_MISSING_TWITTER_CARD',
        title: 'Missing Twitter Card Tags',
        category: 'SEO',
        severity: 'LOW',
        confidence: 0.9,
        recommendation: 'Add Twitter Card metadata.',
        effort: 'EASY',
        impact: 'Low',
      });
    }

    if (!$('meta[name="viewport"]').length) {
      this.addFinding({
        code: 'SEO_MISSING_VIEWPORT',
        title: 'Missing Viewport Meta Tag',
        category: 'SEO',
        severity: 'CRITICAL',
        confidence: 1.0,
        recommendation: 'Add a viewport meta tag for mobile responsiveness.',
        effort: 'EASY',
        impact: 'Critical',
      });
    }

    if (!$('script[type="application/ld+json"]').length) {
      this.addFinding({
        code: 'SEO_MISSING_SCHEMA',
        title: 'Missing Structured Data',
        category: 'SEO',
        severity: 'MEDIUM',
        confidence: 0.9,
        recommendation: 'Add relevant Schema.org JSON-LD structured data.',
        effort: 'MEDIUM',
        impact: 'Medium',
      });
    }

    if (!$('link[rel="icon"], link[rel="shortcut icon"]').length) {
      this.addFinding({
        code: 'SEO_MISSING_FAVICON',
        title: 'Missing Favicon',
        category: 'SEO',
        severity: 'LOW',
        confidence: 1.0,
        recommendation: 'Add a favicon for better brand presence and browser UX.',
        effort: 'EASY',
        impact: 'Low',
      });
    }

    if (!$('html').attr('lang')) {
      this.addFinding({
        code: 'SEO_MISSING_LANG',
        title: 'Missing HTML lang Attribute',
        category: 'SEO',
        severity: 'MEDIUM',
        confidence: 1.0,
        recommendation: 'Add a lang attribute to the <html> element.',
        effort: 'EASY',
        impact: 'Medium',
      });
    }

    const robots = $('meta[name="robots"]').attr('content')?.toLowerCase() || '';
    if (robots.includes('noindex')) {
      this.addFinding({
        code: 'SEO_NOINDEX',
        title: 'Page Marked Noindex',
        category: 'SEO',
        severity: 'HIGH',
        confidence: 1.0,
        recommendation: 'Remove noindex if this page should appear in search results.',
        effort: 'EASY',
        impact: 'High',
        evidence: { robots },
      });
    }
  }

  private runSecurityChecks() {
    if (!this.url.startsWith('https://')) {
      this.addFinding({
        code: 'SEC_NO_HTTPS',
        title: 'No HTTPS',
        category: 'Security',
        severity: 'CRITICAL',
        confidence: 1.0,
        recommendation: 'Serve the page over HTTPS.',
        effort: 'MEDIUM',
        impact: 'Critical',
      });
    }

    const checkHeader = (
      key: string,
      code: string,
      title: string,
      severity: 'HIGH' | 'MEDIUM' | 'LOW'
    ) => {
      if (!this.getHeader(key)) {
        this.addFinding({
          code,
          title: `Missing ${title}`,
          category: 'Security',
          severity,
          confidence: 0.95,
          recommendation: `Add the ${title} header.`,
          effort: 'EASY',
          impact: severity,
        });
      }
    };

    checkHeader('strict-transport-security', 'SEC_HSTS', 'HSTS Header', 'HIGH');
    checkHeader('content-security-policy', 'SEC_CSP', 'CSP Header', 'HIGH');
    checkHeader('x-frame-options', 'SEC_XFO', 'X-Frame-Options Header', 'MEDIUM');
    checkHeader('x-content-type-options', 'SEC_NOSNIFF', 'X-Content-Type-Options Header', 'MEDIUM');
    checkHeader('referrer-policy', 'SEC_REFERRER', 'Referrer-Policy Header', 'LOW');

    if (this.getHeader('server') || this.getHeader('x-powered-by')) {
      this.addFinding({
        code: 'SEC_EXPOSED_SERVER',
        title: 'Server Information Exposed',
        category: 'Security',
        severity: 'LOW',
        confidence: 1.0,
        recommendation: 'Hide or minimize Server and X-Powered-By headers.',
        effort: 'EASY',
        impact: 'Low',
        evidence: {
          server: this.getHeader('server'),
          poweredBy: this.getHeader('x-powered-by'),
        },
      });
    }
  }

  private runAccessibilityChecks() {
    const $ = this.loadCheerio();

    let missingAlt = 0;
    $('img').each((_, el) => {
      if (!$(el).attr('alt')) missingAlt++;
    });

    if (missingAlt > 0) {
      this.addFinding({
        code: 'A11Y_MISSING_ALT',
        title: `${missingAlt} Images Missing Alt Text`,
        category: 'Accessibility',
        severity: 'HIGH',
        confidence: 1.0,
        recommendation: 'Add meaningful alt text to all informative images.',
        effort: 'MEDIUM',
        impact: 'High',
        evidence: { missingAlt },
      });
    }

    let emptyButtons = 0;
    $('button, a').each((_, el) => {
      const text = $(el).text().trim();
      const aria = $(el).attr('aria-label');
      const title = $(el).attr('title');
      if (!text && !aria && !title) emptyButtons++;
    });

    if (emptyButtons > 0) {
      this.addFinding({
        code: 'A11Y_EMPTY_BUTTONS',
        title: `${emptyButtons} Empty Buttons/Links`,
        category: 'Accessibility',
        severity: 'HIGH',
        confidence: 1.0,
        recommendation: 'Ensure interactive elements have visible text or accessible labels.',
        effort: 'MEDIUM',
        impact: 'High',
        evidence: { emptyButtons },
      });
    }

    let missingLabels = 0;
    $('input:not([type="hidden"]):not([type="submit"]):not([type="button"]), textarea, select').each(
      (_, el) => {
        const id = $(el).attr('id');
        const ariaLabel = $(el).attr('aria-label');
        const ariaLabelledBy = $(el).attr('aria-labelledby');

        const hasLabel =
          !!ariaLabel ||
          !!ariaLabelledBy ||
          (!!id && $(`label[for="${id}"]`).length > 0);

        if (!hasLabel) missingLabels++;
      }
    );

    if (missingLabels > 0) {
      this.addFinding({
        code: 'A11Y_MISSING_LABELS',
        title: `${missingLabels} Form Fields Missing Labels`,
        category: 'Accessibility',
        severity: 'MEDIUM',
        confidence: 0.9,
        recommendation: 'Associate all form fields with labels or ARIA labeling.',
        effort: 'MEDIUM',
        impact: 'Medium',
        evidence: { missingLabels },
      });
    }

    if (!$('main').length && !$('[role="main"]').length) {
      this.addFinding({
        code: 'A11Y_MISSING_MAIN',
        title: 'Missing Main Landmark',
        category: 'Accessibility',
        severity: 'MEDIUM',
        confidence: 0.9,
        recommendation: 'Wrap the main content in a <main> landmark.',
        effort: 'EASY',
        impact: 'Medium',
      });
    }
  }

  private runContentChecks() {
    const $ = this.loadCheerio();
    const bodyText = $('body').text().replace(/\s+/g, ' ').trim();
    const wordCount = bodyText ? bodyText.split(' ').filter(Boolean).length : 0;

    if (wordCount < 300) {
      this.addFinding({
        code: 'CONTENT_THIN',
        title: 'Thin Content',
        category: 'SEO',
        severity: 'MEDIUM',
        confidence: 0.8,
        recommendation: 'Add more descriptive, relevant page content.',
        effort: 'HARD',
        impact: 'Medium',
        evidence: { wordCount },
      });
    }

    const inlineStyleCount = $('[style]').length;
    if (inlineStyleCount > 20) {
      this.addFinding({
        code: 'CONTENT_INLINE_STYLES',
        title: 'Excessive Inline Styles',
        category: 'Performance',
        severity: 'LOW',
        confidence: 0.9,
        recommendation: 'Move repeated inline styles into CSS classes or stylesheets.',
        effort: 'MEDIUM',
        impact: 'Low',
        evidence: { inlineStyleCount },
      });
    }
  }

  private runUXChecks() {
    const $ = this.loadCheerio();

    const modalCount = $('.modal, .popup, [role="dialog"]').length;
    if (modalCount > 3) {
      this.addFinding({
        code: 'UX_TOO_MANY_MODALS',
        title: 'Excessive Modals Found',
        category: 'UX',
        severity: 'LOW',
        confidence: 0.7,
        recommendation: 'Reduce overlapping modal and popup usage.',
        effort: 'MEDIUM',
        impact: 'Low',
        evidence: { modalCount },
      });
    }

    const interactiveCount = $('a, button').length;
    if (interactiveCount > 100) {
      this.addFinding({
        code: 'UX_CLUTTER',
        title: 'High Link or Button Clutter',
        category: 'UX',
        severity: 'LOW',
        confidence: 0.6,
        recommendation: 'Simplify navigation and reduce interaction clutter.',
        effort: 'HARD',
        impact: 'Low',
        evidence: { interactiveCount },
      });
    }
  }

  private async runAsyncChecks() {
    const key = process.env.PAGESPEED_API_KEY;

    try {
      const psiUrl =
        `https://www.googleapis.com/pagespeedonline/v5/runPagespeed` +
        `?url=${encodeURIComponent(this.url)}` +
        `&strategy=mobile` +
        `&category=performance` +
        `&category=accessibility` +
        `&category=seo` +
        `&category=best-practices` +
        (key ? `&key=${encodeURIComponent(key)}` : '');

      const response = await axios.get(psiUrl, {
        timeout: 45000,
        validateStatus: () => true,
      });

      if (response.status >= 400) {
        this.addFinding({
          code: `PSI_HTTP_${response.status}`,
          title: 'PageSpeed Insights Request Failed',
          category: 'Performance',
          severity: response.status >= 500 ? 'HIGH' : 'MEDIUM',
          confidence: 0.95,
          recommendation:
            response.status === 401
              ? 'Set a valid PAGESPEED_API_KEY on the server.'
              : response.status === 429
              ? 'PageSpeed quota was exceeded. Retry later or use a valid API key with quota.'
              : 'Check the PageSpeed request, URL validity, and server configuration.',
          effort: 'MEDIUM',
          impact: 'Medium',
          evidence: { status: response.status, data: response.data },
        });
        return;
      }

      const lighthouse = response.data?.lighthouseResult;
      const audits = lighthouse?.audits || {};
      const categories = lighthouse?.categories || {};

      const categoryScores: Array<{
        key: string;
        label: string;
        score: number;
      }> = Object.entries(categories)
        .map(([key, value]: any) => ({
          key,
          label: value?.title || key,
          score: typeof value?.score === 'number' ? Math.round(value.score * 100) : 0,
        }));

      for (const cat of categoryScores) {
        if (cat.score < 90) {
          let severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
          if (cat.score < 30) severity = 'CRITICAL';
          else if (cat.score < 60) severity = 'HIGH';
          else if (cat.score < 90) severity = 'MEDIUM';

          const mappedCategory =
            cat.key === 'accessibility'
              ? 'Accessibility'
              : cat.key === 'seo'
              ? 'SEO'
              : cat.key === 'best-practices'
              ? 'Security'
              : 'Performance';

          this.addFinding({
            code: `PSI_CATEGORY_${cat.key.toUpperCase()}`,
            title: `${cat.label} Score Below Target`,
            category: mappedCategory,
            severity,
            confidence: 0.95,
            recommendation: `Improve ${cat.label.toLowerCase()} score toward 90+.`,
            effort: 'MEDIUM',
            impact: 'Determined by Lighthouse',
            evidence: { score: cat.score },
          });
        }
      }

      for (const auditId of Object.keys(audits)) {
        const audit = audits[auditId];
        if (!audit) continue;

        if (audit.score !== null && typeof audit.score === 'number' && audit.score < 0.9) {
          let severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
          if (audit.score < 0.3) severity = 'CRITICAL';
          else if (audit.score < 0.6) severity = 'HIGH';
          else severity = 'MEDIUM';

          const id = String(audit.id || auditId).toLowerCase();
          const mappedCategory =
            id.includes('seo') || id.includes('meta') || id.includes('canonical')
              ? 'SEO'
              : id.includes('aria') ||
                id.includes('alt') ||
                id.includes('label') ||
                id.includes('heading')
              ? 'Accessibility'
              : id.includes('csp') ||
                id.includes('https') ||
                id.includes('mixed-content') ||
                id.includes('unsafe')
              ? 'Security'
              : 'Performance';

          this.addFinding({
            code: `PSI_${String(audit.id || auditId).toUpperCase().replace(/[^A-Z0-9_]/g, '_')}`,
            title: audit.title || auditId,
            category: mappedCategory,
            severity,
            confidence: 0.95,
            recommendation: audit.description || 'Review and fix this Lighthouse issue.',
            effort: 'MEDIUM',
            impact: 'Determined by Lighthouse',
            evidence: {
              score: audit.score,
              numericValue: audit.numericValue,
              displayValue: audit.displayValue,
            },
          });
        }
      }
    } catch (err: any) {
      this.addFinding({
        code: 'PSI_UNAVAILABLE',
        title: 'PageSpeed Insights Unavailable',
        category: 'Performance',
        severity: 'LOW',
        confidence: 0.9,
        recommendation:
          'PageSpeed Insights could not be fetched. Check API key, quota, network access, or retry later.',
        effort: 'EASY',
        impact: 'Low',
        evidence: {
          message: err?.message || 'Unknown error',
          status: err?.response?.status || null,
        },
      });
    }
  }

  private calculateCategoryScores(): Record<string, { score: number; confidence: number }> {
    const categories = ['SEO', 'Security', 'Accessibility', 'Performance', 'UX'];
    const results: Record<string, { score: number; confidence: number }> = {};

    for (const cat of categories) {
      const catFindings = this.findings.filter((f) => f.category === cat);
      let score = 100;

      for (const f of catFindings) {
        const penalty =
          f.severity === 'CRITICAL'
            ? 30
            : f.severity === 'HIGH'
            ? 15
            : f.severity === 'MEDIUM'
            ? 7
            : 3;

        score -= penalty * (typeof f.confidence === 'number' ? f.confidence : 1);
      }

      results[cat] = {
        score: Math.max(0, Math.min(100, Math.round(score))),
        confidence: 0.9,
      };
    }

    return results;
  }

  private calculateOverallScore(
    categories: Record<string, { score: number; confidence: number }>
  ): number {
    const values = Object.values(categories).map((c) => c.score);
    if (!values.length) return 0;
    return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  }
}
