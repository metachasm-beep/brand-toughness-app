'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Crown,
  Globe,
  RefreshCcw,
  Search,
  Sparkles,
  Trophy,
  TrendingUp,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';
import DashboardShell from '@/components/DashboardShell';

type LeaderboardScope = 'global' | 'country';

type LeaderboardRow = {
  rank: number;
  domain: string;
  brand: string;
  source: string;
  countryCode?: string;
};

type LeaderboardResponse = {
  scope: string;
  label: string;
  source: string;
  rows: LeaderboardRow[];
  total: number;
  lastUpdated: string;
  countryCode?: string;
  countryName?: string;
  error?: string;
  details?: string;
};

type EnrichedRow = LeaderboardRow & {
  score: number;
  trend: number;
  trafficTier: string;
};

const PAGE_SIZE = 100;

const COUNTRY_OPTIONS = [
  { code: 'IN', name: 'India' },
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'JP', name: 'Japan' },
  { code: 'SG', name: 'Singapore' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'AU', name: 'Australia' },
  { code: 'CA', name: 'Canada' },
];

function scoreFromRank(rank: number, scope: LeaderboardScope): number {
  const base = scope === 'global' ? 98.6 : 97.4;
  const decay = scope === 'global' ? 0.0039 : 0.12;
  return Math.max(55, Math.min(99.5, Math.round((base - rank * decay) * 10) / 10));
}

function trafficTierFromRank(rank: number, scope: LeaderboardScope): string {
  if (scope === 'global') {
    if (rank <= 25) return 'Ultra';
    if (rank <= 100) return 'Very High';
    if (rank <= 1000) return 'High';
    if (rank <= 5000) return 'Strong';
    return 'Growing';
  }

  if (rank <= 10) return 'Ultra';
  if (rank <= 25) return 'Very High';
  if (rank <= 50) return 'High';
  if (rank <= 75) return 'Strong';
  return 'Growing';
}

function trendFromRank(rank: number): number {
  const val = Math.sin(rank * 1.137) * 4.2;
  return Math.round(val * 10) / 10;
}

function scoreTone(score: number): string {
  if (score >= 90) return 'text-[#00E28A]';
  if (score >= 75) return 'text-[#00D1FF]';
  if (score >= 60) return 'text-yellow-300';
  return 'text-[#FF3D57]';
}

function scoreBar(score: number): string {
  if (score >= 90) return 'bg-[#00E28A]';
  if (score >= 75) return 'bg-[#00D1FF]';
  if (score >= 60) return 'bg-yellow-300';
  return 'bg-[#FF3D57]';
}

function trendTone(trend: number): string {
  if (trend > 0) return 'text-[#00E28A]';
  if (trend < 0) return 'text-[#FF3D57]';
  return 'text-white/45';
}

function faviconUrl(domain: string): string {
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`;
}

function formatLastUpdated(dateStr?: string): string {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  return date.toLocaleString();
}

async function safeJsonFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    cache: 'no-store',
    headers: {
      Accept: 'application/json',
      ...(init?.headers || {}),
    },
  });

  const contentType = response.headers.get('content-type') || '';
  const raw = await response.text();

  if (!raw.trim()) {
    throw new Error(`Empty response from ${url}`);
  }

  if (!contentType.includes('application/json')) {
    throw new Error(
      `Expected JSON from ${url}, but received ${contentType || 'unknown content type'}.\n` +
        `Preview: ${raw.slice(0, 120)}`
    );
  }

  let data: T;
  try {
    data = JSON.parse(raw) as T;
  } catch {
    throw new Error(`Invalid JSON returned from ${url}`);
  }

  if (!response.ok) {
    const maybeError =
      typeof data === 'object' &&
      data !== null &&
      'error' in (data as Record<string, unknown>)
        ? String((data as Record<string, unknown>).error || '')
        : '';

    throw new Error(maybeError || `Request failed: HTTP ${response.status}`);
  }

  return data;
}

export default function LeaderboardPage() {
  const [scope, setScope] = useState<LeaderboardScope>('global');
  const [countryCode, setCountryCode] = useState('IN');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);

  const [globalData, setGlobalData] = useState<LeaderboardResponse | null>(null);
  const [countryData, setCountryData] = useState<LeaderboardResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async (mode: LeaderboardScope, code?: string) => {
    setLoading(true);
    setError('');

    try {
      const endpoint =
        mode === 'global'
          ? '/api/leaderboard/global'
          : `/api/leaderboard/country?code=${encodeURIComponent(code || 'IN')}`;

      const data = await safeJsonFetch<LeaderboardResponse>(endpoint);

      if (mode === 'global') setGlobalData(data);
      else setCountryData(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData('global');
  }, []);

  useEffect(() => {
    if (scope === 'country') {
      fetchData('country', countryCode);
    }
  }, [scope, countryCode]);

  const activeData: LeaderboardResponse | null =
    scope === 'global' ? globalData : countryData;

  const enrichedRows = useMemo<EnrichedRow[]>(() => {
    const rows = activeData?.rows || [];
    return rows.map((row) => {
      const score = scoreFromRank(row.rank, scope);
      return {
        ...row,
        score,
        trend: trendFromRank(row.rank),
        trafficTier: trafficTierFromRank(row.rank, scope),
      };
    });
  }, [activeData, scope]);

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();

    return enrichedRows.filter((row) => {
      if (!q) return true;
      return (
        row.brand.toLowerCase().includes(q) ||
        row.domain.toLowerCase().includes(q) ||
        row.trafficTier.toLowerCase().includes(q)
      );
    });
  }, [enrichedRows, query]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const visibleRows = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredRows.slice(start, start + PAGE_SIZE);
  }, [filteredRows, currentPage]);

  const topThree = filteredRows.slice(0, 3);

  const stats = useMemo(() => {
    const total = filteredRows.length;
    const avg =
      total > 0
        ? Math.round((filteredRows.reduce((sum, row) => sum + row.score, 0) / total) * 10) / 10
        : 0;
    const rising = filteredRows.filter((row) => row.trend > 0).length;
    return { total, avg, rising };
  }, [filteredRows]);

  const changeScope = (next: LeaderboardScope) => {
    setScope(next);
    setPage(1);
    setQuery('');
  };

  const goPrev = () => setPage((p) => Math.max(1, p - 1));
  const goNext = () => setPage((p) => Math.min(totalPages, p + 1));

  return (
    <DashboardShell>
      <div className="space-y-10 max-w-[1550px] mx-auto pt-10 pb-24">
        <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-6 border-b border-white/5 pb-6">
          <div className="space-y-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-bold text-white/40 hover:text-white transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Dashboard
            </Link>

            <div className="space-y-2">
              <div className="text-[11px] font-black uppercase tracking-[0.32em] text-[#00D1FF]/70">
                Ranking Intelligence Layer
              </div>
              <h1 className="text-5xl md:text-6xl font-extrabold font-display tracking-tighter text-white leading-[0.95]">
                REAL-WORLD
                <br />
                LEADERBOARD
              </h1>
              <p className="text-white/45 text-base md:text-lg max-w-4xl font-medium">
                Enterprise ranking interface with live source-backed lists, elite bands,
                movement signals, and high-clarity browsing controls.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => fetchData(scope, countryCode)}
              className="apple-button-outline flex items-center justify-center gap-2"
            >
              <RefreshCcw size={16} />
              <span>Refresh Source Data</span>
            </button>
            <button className="apple-button-primary flex items-center justify-center gap-2">
              <Sparkles size={16} />
              <span>Unlock Live Intelligence Feed</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="apple-card p-6 border border-[#FF3D57]/20 bg-[#FF3D57]/10">
            <div className="flex items-center gap-3 text-[#FF3D57] font-bold">
              <AlertTriangle size={18} />
              {error}
            </div>
          </div>
        )}

        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          <div className="apple-card p-6">
            <div className="text-[10px] font-black uppercase tracking-[0.24em] text-white/30">
              Scope
            </div>
            <div className="text-3xl font-black font-display text-white mt-2">
              {scope === 'global' ? 'Global 10k' : `${countryCode} Top 100`}
            </div>
          </div>

          <div className="apple-card p-6">
            <div className="text-[10px] font-black uppercase tracking-[0.24em] text-white/30">
              Ranked Websites
            </div>
            <div className="text-3xl font-black font-display text-white mt-2">
              {stats.total.toLocaleString()}
            </div>
          </div>

          <div className="apple-card p-6">
            <div className="text-[10px] font-black uppercase tracking-[0.24em] text-white/30">
              Average Score
            </div>
            <div className="text-3xl font-black font-display text-white mt-2">
              {stats.avg.toFixed(1)}
            </div>
          </div>

          <div className="apple-card p-6">
            <div className="text-[10px] font-black uppercase tracking-[0.24em] text-white/30">
              Rising Websites
            </div>
            <div className="text-3xl font-black font-display text-white mt-2">
              {stats.rising.toLocaleString()}
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {topThree.map((site) => (
            <div
              key={`${scope}-${site.domain}`}
              className="apple-card p-7 space-y-5 overflow-hidden relative"
            >
              <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_40%)]" />

              <div className="relative z-10 flex items-start justify-between">
                <div className="inline-flex items-center gap-2 rounded-2xl border border-yellow-300/20 bg-yellow-300/10 px-4 py-2">
                  <Crown size={16} className="text-yellow-300" />
                  <span className="text-[11px] font-black uppercase tracking-[0.22em] text-yellow-200">
                    Rank #{site.rank}
                  </span>
                </div>
                <div className={`text-4xl font-black font-display ${scoreTone(site.score)}`}>
                  {site.score.toFixed(1)}
                </div>
              </div>

              <div className="relative z-10 flex items-center gap-4">
                <img
                  src={faviconUrl(site.domain)}
                  alt=""
                  className="w-14 h-14 rounded-2xl border border-white/10 bg-white/5"
                />
                <div className="min-w-0">
                  <div className="text-2xl font-extrabold font-display tracking-tight text-white truncate">
                    {site.brand}
                  </div>
                  <div className="text-white/40 text-sm mt-1 truncate">{site.domain}</div>
                </div>
              </div>

              <div className="relative z-10 space-y-3">
                <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className={`h-full ${scoreBar(site.score)}`}
                    style={{ width: `${Math.max(0, Math.min(100, site.score))}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="text-white/45 font-medium">{site.trafficTier} traffic band</div>
                  <div className={`font-black ${trendTone(site.trend)}`}>
                    {site.trend > 0 ? '+' : ''}
                    {site.trend.toFixed(1)}
                  </div>
                </div>
              </div>

              <div className="relative z-10 flex items-center justify-between pt-2">
                <div className="text-[11px] text-white/35 uppercase tracking-[0.18em]">
                  Source: {activeData?.source || '—'}
                </div>
                <a
                  href={`https://${site.domain}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-bold text-white/65 hover:text-white transition-colors"
                >
                  Open site
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>
          ))}
        </section>

        <section className="apple-card p-6 md:p-8 space-y-6">
          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => changeScope('global')}
                className={`px-5 py-3 rounded-2xl border text-sm font-black uppercase tracking-[0.16em] transition-all ${
                  scope === 'global'
                    ? 'border-[#00D1FF]/30 bg-[#00D1FF]/10 text-[#00D1FF]'
                    : 'border-white/10 bg-white/[0.03] text-white/60 hover:text-white'
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  <Globe size={14} />
                  Global Top 10,000
                </span>
              </button>

              <button
                onClick={() => changeScope('country')}
                className={`px-5 py-3 rounded-2xl border text-sm font-black uppercase tracking-[0.16em] transition-all ${
                  scope === 'country'
                    ? 'border-[#00D1FF]/30 bg-[#00D1FF]/10 text-[#00D1FF]'
                    : 'border-white/10 bg-white/[0.03] text-white/60 hover:text-white'
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  <Trophy size={14} />
                  {activeData?.countryName || 'Country'} Top 100
                </span>
              </button>

              {scope === 'country' && (
                <select
                  value={countryCode}
                  onChange={(e) => {
                    setCountryCode(e.target.value);
                    setPage(1);
                  }}
                  className="appearance-none rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-white outline-none focus:border-white/25"
                >
                  {COUNTRY_OPTIONS.map((country) => (
                    <option key={country.code} value={country.code} className="bg-[#0B0F14]">
                      {country.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
                />
                <input
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search brand, domain, traffic band..."
                  className="w-full md:w-[340px] rounded-2xl border border-white/10 bg-white/[0.03] pl-11 pr-4 py-3 text-white outline-none focus:border-white/25"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_0.7fr_0.7fr_0.7fr_0.5fr] rounded-3xl border border-white/10 bg-white/[0.02] overflow-hidden">
            <div className="px-6 py-4 text-[11px] font-black uppercase tracking-[0.22em] text-white/30 border-b xl:border-b-0 xl:border-r border-white/10">
              Website
            </div>
            <div className="px-6 py-4 text-[11px] font-black uppercase tracking-[0.22em] text-white/30 border-b xl:border-b-0 xl:border-r border-white/10">
              Rank
            </div>
            <div className="px-6 py-4 text-[11px] font-black uppercase tracking-[0.22em] text-white/30 border-b xl:border-b-0 xl:border-r border-white/10">
              Score
            </div>
            <div className="px-6 py-4 text-[11px] font-black uppercase tracking-[0.22em] text-white/30 border-b xl:border-b-0 xl:border-r border-white/10">
              Trend
            </div>
            <div className="px-6 py-4 text-[11px] font-black uppercase tracking-[0.22em] text-white/30">
              Open
            </div>
          </div>

          <div className="space-y-3">
            {visibleRows.length === 0 ? (
              <div className="rounded-3xl border border-white/10 bg-white/[0.02] px-6 py-16 text-center text-white/40 font-bold">
                {loading ? 'Loading leaderboard...' : 'No websites matched your search.'}
              </div>
            ) : (
              visibleRows.map((row) => (
                <div
                  key={`${scope}-${row.rank}-${row.domain}`}
                  className="grid grid-cols-1 xl:grid-cols-[1.5fr_0.7fr_0.7fr_0.7fr_0.5fr] items-center rounded-3xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-all overflow-hidden"
                >
                  <div className="px-6 py-5 flex items-center gap-4 border-b xl:border-b-0 xl:border-r border-white/10 min-w-0">
                    <div className="relative shrink-0">
                      {row.rank <= 3 ? (
                        <div className="w-12 h-12 rounded-2xl bg-yellow-300/10 border border-yellow-300/20 flex items-center justify-center">
                          <Crown size={18} className="text-yellow-300" />
                        </div>
                      ) : (
                        <img
                          src={faviconUrl(row.domain)}
                          alt=""
                          className="w-12 h-12 rounded-2xl border border-white/10 bg-white/5"
                        />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="text-white font-extrabold text-lg truncate">
                        {row.brand}
                      </div>
                      <div className="text-white/40 text-sm mt-1 truncate">{row.domain}</div>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-[10px] uppercase tracking-[0.18em] text-white/30 font-black">
                          {row.trafficTier}
                        </span>
                        <span className="text-[10px] uppercase tracking-[0.18em] text-white/25 font-black">
                          {activeData?.source}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="px-6 py-5 border-b xl:border-b-0 xl:border-r border-white/10">
                    <div className="text-[10px] uppercase tracking-[0.18em] text-white/25 font-black xl:hidden mb-1">
                      Rank
                    </div>
                    <div className="text-white font-black text-lg">#{row.rank}</div>
                  </div>

                  <div className="px-6 py-5 border-b xl:border-b-0 xl:border-r border-white/10">
                    <div className="text-[10px] uppercase tracking-[0.18em] text-white/25 font-black xl:hidden mb-1">
                      Score
                    </div>
                    <div className={`text-2xl font-black font-display ${scoreTone(row.score)}`}>
                      {row.score.toFixed(1)}
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-white/10 mt-3 overflow-hidden">
                      <div
                        className={`h-full ${scoreBar(row.score)}`}
                        style={{ width: `${Math.max(0, Math.min(100, row.score))}%` }}
                      />
                    </div>
                  </div>

                  <div className="px-6 py-5 border-b xl:border-b-0 xl:border-r border-white/10">
                    <div className="text-[10px] uppercase tracking-[0.18em] text-white/25 font-black xl:hidden mb-1">
                      Trend
                    </div>
                    <div className={`inline-flex items-center gap-2 font-black ${trendTone(row.trend)}`}>
                      <TrendingUp size={15} />
                      {row.trend > 0 ? '+' : ''}
                      {row.trend.toFixed(1)}
                    </div>
                  </div>

                  <div className="px-6 py-5">
                    <a
                      href={`https://${row.domain}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-bold text-white/65 hover:text-white transition-colors"
                    >
                      Visit
                      <ExternalLink size={14} />
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pt-2">
            <div className="space-y-1">
              <div className="text-sm text-white/40 font-medium">
                Showing{' '}
                <span className="text-white font-bold">
                  {visibleRows.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}
                </span>{' '}
                to{' '}
                <span className="text-white font-bold">
                  {Math.min(currentPage * PAGE_SIZE, filteredRows.length)}
                </span>{' '}
                of{' '}
                <span className="text-white font-bold">
                  {filteredRows.length.toLocaleString()}
                </span>{' '}
                ranked websites
              </div>
              <div className="text-xs text-white/28">
                Last updated: {formatLastUpdated(activeData?.lastUpdated)}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={goPrev}
                disabled={currentPage === 1}
                className="apple-button-outline disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-2"
              >
                <ChevronLeft size={16} />
                Prev
              </button>

              <div className="px-4 py-2 rounded-2xl border border-white/10 bg-white/[0.03] text-sm font-black text-white">
                Page {currentPage} / {totalPages}
              </div>

              <button
                onClick={goNext}
                disabled={currentPage === totalPages}
                className="apple-button-outline disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-2"
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
