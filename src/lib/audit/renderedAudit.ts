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
  const { chromium } = await import('playwright');
  const lighthouseModule = await import('lighthouse');
  const chromeLauncher = await import('chrome-launcher');

  const lighthouse = (lighthouseModule as any).default || lighthouseModule;
  const url = normalizeUrl(inputUrl);

  let browser: any;
  let page: any;
  let chrome: any;

  try {
    browser = await chromium.launch({ headless: true });
    // ... keep rest of your logic unchanged
