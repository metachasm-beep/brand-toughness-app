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

const MAX_HTML_BYTES = 750_000;
const MAX_REMOTE_BYTES = 6 * 1024 * 1024;
const MAX_FINDINGS = 80;
const ENABLE_PSI = process.env.DISABLE_PSI !== 'true';

export class AuditEngine {
  private url: string;
  private html = '';
  private headers: HeaderMap = {};
  private status = 0;
  private findings: AuditFinding[] = [];
  private metrics: any[] = [];

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

      if (ENABLE_PSI) {
        await this.runAsyncChecks();
      }

      if (this.findings.length > MAX_FINDINGS) {
        this.findings = this.findings.slice(0, MAX_FINDINGS);
      }

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
          htmlBytes: this.html.length,
          metrics: this.metrics,
        },
      };
    } catch (error: any) {
      throw new Error(`Audit failed: ${error?.message || 'Unknown error'}`);
    } finally {
      this.html = '';
    }
  }

  private normalizeUrl(input: string): string {
    const trimmed = String(input || '').trim();
    if (!trimmed) throw new Error('URL is required.');
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
  }

  private async fetchPage(): Promise<void> {
    try {
      const response = await axios.get(this.url, {
        timeout: 25000,
        maxRedirects: 5,
        responseType: 'text',
        transformResponse: [(data) => data],
        maxContentLength: MAX_REMOTE_BYTES,
        maxBodyLength: MAX_REMOTE_BYTES,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
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

      this.html = rawData.slice(0, MAX_HTML_BYTES);

      if (
        !contentType.includes('text/html') &&
        !contentType.includes('application/xhtml+xml')
      ) {
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

      if (rawData.length > MAX_HTML_BYTES) {
        this.addFinding({
          code: 'FETCH_HTML_TRUNCATED',
          title: 'Large Page HTML Truncated for Safe Analysis',
          category: 'Performance',
          severity: 'LOW',
          confidence: 0.95,
          recommendation:
            'This page is very large. Audit was performed on a safe truncated snapshot of the HTML.',
          effort: 'EASY',
          impact: 'Low',
          evidence: {
            originalBytes: rawData.length,
            analyzedBytes: MAX_HTML_BYTES,
          },
        });
      }

      if (this.status >= 400) {
        this.addFinding({
          code: 'FETCH_HTTP_ERROR',
          title: `HTTP Error ${this.status}`,
          category: 'UX',
          severity: this.status >= 500 ? 'CRITICAL' : 'HIGH',
          confidence: 1,
          recommendation:
            'Fix the page response status and ensure the URL is publicly accessible.',
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
    } catch (err: any) {
      const msg = String(err?.message || '');

      if (msg.includes('maxContentLength size')) {
        this.status = 200;
        this.html = '';
        this.addFinding({
          code: 'FETCH_PAGE_TOO_LARGE',
          title: 'Page Too Large for Full Safe Fetch',
          category: 'Performance',
          severity: 'MEDIUM',
          confidence: 1,
          recommendation:
            'The target page is unusually large. Safe audit limits prevented full HTML fetch. Reduce page payload or use lighter markup.',
          effort: 'MEDIUM',
          impact: 'Medium',
          evidence: {
            limitBytes: MAX_REMOTE_BYTES,
          },
        });
        return;
      }

      throw err;
    }
  }

  private normalizeHeaders(
    headers:
      | AxiosResponseHeaders
      | RawAxiosResponseHeaders
      | Record<string, any>
      | undefined
  ): HeaderMap {
    const out: HeaderMap = {};
    if (!headers || typeof headers !== 'object') return out;

    Object.entries(headers).forEach(([key, value]) => {
      const normalizedKey = String(key).toLowerCase();
      if (Array.isArray(value)) out[normalizedKey] = value.join(', ');
      else if (value !== undefined && value !== null) out[normalizedKey] = String(value);
    });

    return out;
  }

  private getHeader(name: string): string {
    return this.headers[name.toLowerCase()] || '';
  }

  private sanitizeEvidence(evidence: any) {
    if (!evidence) return undefined;
    try {
      const text = typeof evidence === 'string' ? evidence : JSON.stringify(evidence);
      return { summary: text.slice(0, 300) };
    } catch {
      return undefined;
    }
  }

  private addFinding(finding: AuditFinding) {
    if (this.findings.length >= MAX_FINDINGS) return;
    this.findings.push({
      ...finding,
      evidence: this.sanitizeEvidence(finding.evidence),
    });
  }

  private loadCheerio() {
    const $ = cheerio.load(this.html || '');
    if (this.html) {
      if (!this.metrics.find(m => m.id === 'dom_size')) {
        this.metrics.push({
          id: 'dom_size',
          title: 'DOM Elements',
          description: 'Total number of HTML elements found on the page.',
          value: $('*').length,
          unit: 'elements',
          category: 'Performance'
        });
      }
    }
    return $;
  }

  private runSeoChecks() {
    if (!this.html) return;
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
    } else if (title.length < 20 || title.length > 75) {
      this.addFinding({
        code: 'SEO_TITLE_LENGTH',
        title: 'Title Length Suboptimal',
        category: 'SEO',
        severity: 'LOW',
        confidence: 0.8,
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
        severity: 'MEDIUM',
        confidence: 0.85,
        recommendation: 'Add a meta description of roughly 150–160 characters.',
        effort: 'EASY',
        impact: 'Medium',
      });
    }

    const canonical = $('link[rel="canonical"]').attr('href')?.trim();
    if (!canonical) {
      this.addFinding({
        code: 'SEO_MISSING_CANONICAL',
        title: 'Missing Canonical Tag',
        category: 'SEO',
        severity: 'MEDIUM',
        confidence: 0.9,
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
        severity: 'MEDIUM',
        confidence: 0.8,
        recommendation: 'Ensure the page contains one meaningful <h1>.',
        effort: 'EASY',
        impact: 'Medium',
      });
    } else if (h1Count > 1) {
      this.addFinding({
        code: 'SEO_MULTIPLE_H1',
        title: 'Multiple H1 Headings',
        category: 'SEO',
        severity: 'LOW',
        confidence: 0.7,
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
        confidence: 0.75,
        recommendation:
          'Add OpenGraph tags such as og:title, og:description, and og:image.',
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
        confidence: 0.75,
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
        severity: 'LOW',
        confidence: 0.8,
        recommendation: 'Add relevant Schema.org JSON-LD structured data.',
        effort: 'MEDIUM',
        impact: 'Low',
      });
    }

    if (!$('link[rel="icon"], link[rel="shortcut icon"]').length) {
      this.addFinding({
        code: 'SEO_MISSING_FAVICON',
        title: 'Missing Favicon',
        category: 'SEO',
        severity: 'LOW',
        confidence: 0.8,
        recommendation: 'Add a favicon.',
        effort: 'EASY',
        impact: 'Low',
      });
    }

    if (!$('html').attr('lang')) {
      this.addFinding({
        code: 'SEO_MISSING_LANG',
        title: 'Missing HTML lang Attribute',
        category: 'SEO',
        severity: 'LOW',
        confidence: 0.8,
        recommendation: 'Add a lang attribute to the <html> element.',
        effort: 'EASY',
        impact: 'Low',
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
          confidence: 0.92,
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
        confidence: 0.8,
        recommendation: 'Hide or minimize Server and X-Powered-By headers.',
        effort: 'EASY',
        impact: 'Low',
      });
    }
  }

  private runAccessibilityChecks() {
    if (!this.html) return;
    const $ = this.loadCheerio();

    let missingAlt = 0;
    $('img').each((_, el) => {
      const alt = $(el).attr('alt');
      if (alt === undefined) missingAlt++;
    });
    if (missingAlt > 0) {
      this.addFinding({
        code: 'A11Y_MISSING_ALT',
        title: `${missingAlt} Images Missing Alt Text`,
        category: 'Accessibility',
        severity: missingAlt > 8 ? 'HIGH' : 'MEDIUM',
        confidence: 0.9,
        recommendation: 'Add meaningful alt text to informative images.',
        effort: 'MEDIUM',
        impact: 'High',
      });
    }

    let emptyButtons = 0;
    $('button, a').each((_, el) => {
      const text = $(el).text().trim();
      const aria = $(el).attr('aria-label');
      const title = $(el).attr('title');
      const hasSvg = $(el).find('svg').length > 0;
      if (!text && !aria && !title && !hasSvg) emptyButtons++;
    });
    if (emptyButtons > 0) {
      this.addFinding({
        code: 'A11Y_EMPTY_BUTTONS',
        title: `${emptyButtons} Empty Buttons/Links`,
        category: 'Accessibility',
        severity: 'MEDIUM',
        confidence: 0.8,
        recommendation:
          'Ensure interactive elements have visible text or accessible labels.',
        effort: 'MEDIUM',
        impact: 'Medium',
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
        confidence: 0.8,
        recommendation: 'Associate all form fields with labels or ARIA labeling.',
        effort: 'MEDIUM',
        impact: 'Medium',
      });
    }

    if (!$('main').length && !$('[role="main"]').length) {
      this.addFinding({
        code: 'A11Y_MISSING_MAIN',
        title: 'Missing Main Landmark',
        category: 'Accessibility',
        severity: 'LOW',
        confidence: 0.85,
        recommendation: 'Wrap the main content in a <main> landmark.',
        effort: 'EASY',
        impact: 'Low',
      });
    }
  }

  private runContentChecks() {
    if (!this.html) return;
    const $ = this.loadCheerio();
    const bodyText = $('body').text().replace(/\s+/g, ' ').trim();
    const wordCount = bodyText ? bodyText.split(' ').filter(Boolean).length : 0;

    if (wordCount < 120) {
      this.addFinding({
        code: 'CONTENT_THIN',
        title: 'Thin Content',
        category: 'SEO',
        severity: 'LOW',
        confidence: 0.7,
        recommendation: 'Add more descriptive, relevant page content.',
        effort: 'HARD',
        impact: 'Low',
        evidence: { wordCount },
      });
    }

    const inlineStyleCount = $('[style]').length;
    
    if (!this.metrics.find((m) => m.id === 'word_count')) {
      this.metrics.push({
        id: 'word_count',
        title: 'Word Count',
        description: 'Total number of words detected in the page body.',
        value: wordCount,
        displayValue: String(wordCount),
        unit: 'words',
        category: 'SEO'
      });
    }

    if (!this.metrics.find((m) => m.id === 'inline_styles')) {
        this.metrics.push({
          id: 'inline_styles',
          title: 'Inline Styles',
          description: 'Number of elements utilizing inline CSS.',
          value: inlineStyleCount,
          displayValue: String(inlineStyleCount),
          unit: 'elements',
          category: 'Performance'
        });
    }

    if (inlineStyleCount > 40) {
      this.addFinding({
        code: 'CONTENT_INLINE_STYLES',
        title: 'Excessive Inline Styles',
        category: 'Performance',
        severity: 'LOW',
        confidence: 0.75,
        recommendation: 'Move repeated inline styles into CSS classes or stylesheets.',
        effort: 'MEDIUM',
        impact: 'Low',
        evidence: { inlineStyleCount },
      });
    }
  }

  private runUXChecks() {
    if (!this.html) return;
    const $ = this.loadCheerio();

    const modalCount = $('.modal, .popup, [role="dialog"]').length;
    if (modalCount > 5) {
      this.addFinding({
        code: 'UX_TOO_MANY_MODALS',
        title: 'Excessive Modals Found',
        category: 'UX',
        severity: 'LOW',
        confidence: 0.65,
        recommendation: 'Reduce overlapping modal and popup usage.',
        effort: 'MEDIUM',
        impact: 'Low',
      });
    }

    const interactiveCount = $('a, button').length;

    if (!this.metrics.find((m) => m.id === 'interactive_elements')) {
        this.metrics.push({
          id: 'interactive_elements',
          title: 'Interactive Elements',
          description: 'Total number of clickable buttons and links.',
          value: interactiveCount,
          displayValue: String(interactiveCount),
          unit: 'elements',
          category: 'UX'
        });
    }

    if (!this.metrics.find((m) => m.id === 'modal_count')) {
        this.metrics.push({
          id: 'modal_count',
          title: 'Modals / Popups',
          description: 'Total number of dialogs or popups detected.',
          value: modalCount,
          displayValue: String(modalCount),
          unit: 'modals',
          category: 'UX'
        });
    }

    if (interactiveCount > 180) {
      this.addFinding({
        code: 'UX_CLUTTER',
        title: 'High Link or Button Clutter',
        category: 'UX',
        severity: 'LOW',
        confidence: 0.6,
        recommendation: 'Simplify navigation and reduce interaction clutter.',
        effort: 'HARD',
        impact: 'Low',
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
        timeout: 30000,
        validateStatus: () => true,
        maxContentLength: MAX_REMOTE_BYTES,
        maxBodyLength: MAX_REMOTE_BYTES,
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
        });
        return;
      }

      const lighthouse = response.data?.lighthouseResult;
      const audits = lighthouse?.audits || {};
      const categories = lighthouse?.categories || {};

      for (const [key, value] of Object.entries(categories) as any[]) {
        const score = typeof value?.score === 'number' ? Math.round(value.score * 100) : 0;
        if (score < 90) {
          let severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
          if (score < 30) severity = 'CRITICAL';
          else if (score < 60) severity = 'HIGH';
          else severity = 'MEDIUM';

          const mappedCategory =
            key === 'accessibility'
              ? 'Accessibility'
              : key === 'seo'
              ? 'SEO'
              : key === 'best-practices'
              ? 'Security'
              : 'Performance';

          this.addFinding({
            code: `PSI_CATEGORY_${String(key).toUpperCase()}`,
            title: `${value?.title || key} Score Below Target`,
            category: mappedCategory,
            severity,
            confidence: 0.98,
            recommendation: `Improve ${String(value?.title || key).toLowerCase()} score toward 90+.`,
            effort: 'MEDIUM',
            impact: 'Determined by Lighthouse',
            evidence: { score },
          });
        }
      }

      let added = 0;
      for (const auditId of Object.keys(audits)) {
        const audit = audits[auditId];
        if (!audit) continue;

        if (audit.numericValue !== undefined && audit.displayValue) {
          if (!this.metrics.find((m) => m.id === auditId)) {
            this.metrics.push({
              id: audit.id || auditId,
              title: audit.title || auditId,
              description: audit.description || '',
              value: audit.numericValue,
              displayValue: audit.displayValue,
              unit: audit.numericUnit || 'v',
              category: 'Lighthouse' // Or extract true category
            });
          }
        }

        if (added >= 20) continue;
        if (audit.score === null || typeof audit.score !== 'number' || audit.score >= 0.9) continue;

        let severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
        if (audit.score < 0.3) severity = 'CRITICAL';
        else if (audit.score < 0.6) severity = 'HIGH';
        else severity = 'MEDIUM';

        const id = String(audit.id || auditId).toLowerCase();
        const mappedCategory =
          id.includes('seo') || id.includes('meta') || id.includes('canonical')
            ? 'SEO'
            : id.includes('aria') || id.includes('alt') || id.includes('label') || id.includes('heading')
            ? 'Accessibility'
            : id.includes('csp') || id.includes('https') || id.includes('mixed-content') || id.includes('unsafe')
            ? 'Security'
            : 'Performance';

        this.addFinding({
          code: `PSI_${String(audit.id || auditId).toUpperCase().replace(/[^A-Z0-9_]/g, '_')}`,
          title: audit.title || auditId,
          category: mappedCategory,
          severity,
          confidence: 0.92,
          recommendation: audit.description || 'Review and fix this Lighthouse issue.',
          effort: 'MEDIUM',
          impact: 'Determined by Lighthouse',
          evidence: {
            score: audit.score,
            displayValue: audit.displayValue,
          },
        });

        added++;
      }
    } catch (err: any) {
      this.addFinding({
        code: 'PSI_UNAVAILABLE',
        title: 'PageSpeed Insights Unavailable',
        category: 'Performance',
        severity: 'LOW',
        confidence: 0.9,
        recommendation: 'PageSpeed Insights could not be fetched. Check API key, quota, or retry later.',
        effort: 'EASY',
        impact: 'Low',
        evidence: { message: err?.message || 'Unknown error' },
      });
    }
  }

  private getFindingWeight(f: AuditFinding): number {
    const base =
      f.severity === 'CRITICAL'
        ? 1.0
        : f.severity === 'HIGH'
        ? 0.7
        : f.severity === 'MEDIUM'
        ? 0.4
        : 0.18;

    const code = String(f.code || '').toUpperCase();
    const title = String(f.title || '').toLowerCase();
    const category = String(f.category || '');

    let modifier = 1;

    const advisoryPatterns = [
      'SEO_MISSING_TWITTER_CARD',
      'SEO_MISSING_OG',
      'SEO_MISSING_FAVICON',
      'SEO_MULTIPLE_H1',
      'CONTENT_INLINE_STYLES',
      'UX_TOO_MANY_MODALS',
      'UX_CLUTTER',
      'SEC_EXPOSED_SERVER',
      'SEC_REFERRER',
    ];

    if (advisoryPatterns.includes(code)) modifier *= 0.45;
    if (code === 'SEO_MISSING_META_DESC') modifier *= 0.6;
    if (code === 'SEO_MISSING_SCHEMA') modifier *= 0.55;

    if (
      code === 'SEO_MISSING_LANG' ||
      code === 'SEO_MISSING_FAVICON' ||
      code === 'SEO_MISSING_OG' ||
      code === 'SEO_MISSING_TWITTER_CARD'
    ) {
      modifier *= 0.5;
    }

    if (code === 'CONTENT_THIN') modifier *= 0.55;
    if (code === 'A11Y_EMPTY_BUTTONS' || code === 'A11Y_MISSING_LABELS') modifier *= 0.75;
    if (code === 'SEO_MISSING_H1') modifier *= 0.7;

    if (
      code === 'SEO_MISSING_VIEWPORT' ||
      code === 'SEC_NO_HTTPS' ||
      code === 'SEC_HSTS' ||
      code === 'SEC_CSP'
    ) {
      modifier *= 1.15;
    }

    if (code.startsWith('PSI_CATEGORY_')) modifier *= 1.25;
    if (code.startsWith('PSI_') && !code.startsWith('PSI_CATEGORY_')) modifier *= 0.8;

    if (category === 'Performance' && !code.startsWith('PSI_CATEGORY_')) modifier *= 0.9;
    if (category === 'UX') modifier *= 0.65;
    if (title.includes('missing') && f.severity === 'LOW') modifier *= 0.75;

    return base * modifier * (typeof f.confidence === 'number' ? f.confidence : 1);
  }

  private getCategoryPenaltyCap(category: string): number {
    switch (category) {
      case 'SEO':
        return 42;
      case 'Security':
        return 45;
      case 'Accessibility':
        return 40;
      case 'Performance':
        return 42;
      case 'UX':
        return 26;
      default:
        return 35;
    }
  }

  private getCategoryBaseline(category: string): number {
    switch (category) {
      case 'SEO':
        return 92;
      case 'Security':
        return 93;
      case 'Accessibility':
        return 90;
      case 'Performance':
        return 90;
      case 'UX':
        return 91;
      default:
        return 90;
    }
  }

  private calculateCategoryScores(): Record<string, { score: number; confidence: number }> {
    const categories = ['SEO', 'Security', 'Accessibility', 'Performance', 'UX'];
    const results: Record<string, { score: number; confidence: number }> = {};

    for (const cat of categories) {
      const catFindings = this.findings.filter((f) => f.category === cat);

      let totalPenalty = 0;
      for (const finding of catFindings) {
        totalPenalty += this.getFindingWeight(finding) * 12;
      }

      totalPenalty = Math.min(totalPenalty, this.getCategoryPenaltyCap(cat));

      let score = this.getCategoryBaseline(cat) - totalPenalty;

      const psiCategoryFinding = catFindings.find((f) =>
        String(f.code || '').startsWith('PSI_CATEGORY_')
      );

      const psiScore =
        typeof psiCategoryFinding?.evidence?.score === 'number'
          ? Number(psiCategoryFinding.evidence.score)
          : null;

      if (psiScore !== null) {
        score = score * 0.55 + psiScore * 0.45;
      }

      const hasCritical = catFindings.some((f) => f.severity === 'CRITICAL');
      const hasHigh = catFindings.some((f) => f.severity === 'HIGH');

      if (!hasCritical && !hasHigh) {
        score += 4;
      } else if (!hasCritical && hasHigh) {
        score += 1.5;
      }

      score = Math.max(35, Math.min(99, score));

      if (catFindings.length === 0) {
        score = 96;
      }

      results[cat] = {
        score: Math.round(score),
        confidence: catFindings.length > 0 ? 0.9 : 0.82,
      };
    }

    return results;
  }

  private calculateOverallScore(
    categories: Record<string, { score: number; confidence: number }>
  ): number {
    const weighted =
      categories.SEO.score * 0.24 +
      categories.Performance.score * 0.24 +
      categories.Security.score * 0.2 +
      categories.Accessibility.score * 0.17 +
      categories.UX.score * 0.15;

    return Math.round(Math.max(35, Math.min(99, weighted)));
  }
}
