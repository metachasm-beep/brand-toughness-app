'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    Globe,
    Trophy,
    Search,
    Filter,
    ChevronLeft,
    ChevronRight,
    TrendingUp,
    Crown,
    MapPinned,
    BarChart3
} from 'lucide-react';
import DashboardShell from '@/components/DashboardShell';

type LeaderboardScope = 'global' | 'national';

type SiteRow = {
    rank: number;
    domain: string;
    brand: string;
    score: number;
    country: string;
    category: string;
    trend: number;
    trafficTier: string;
};

const PAGE_SIZE = 100;

const COUNTRIES = [
    'India',
    'United States',
    'United Kingdom',
    'Germany',
    'France',
    'Japan',
    'Singapore',
    'Canada',
    'Australia',
    'UAE',
    'Brazil',
    'South Korea'
];

const CATEGORIES = [
    'Technology',
    'Retail',
    'Finance',
    'Healthcare',
    'Media',
    'Luxury',
    'Education',
    'Travel',
    'Government',
    'Consumer',
    'SaaS',
    'Marketplace'
];

const TRAFFIC_TIERS = ['Ultra', 'Very High', 'High', 'Strong', 'Growing'];

const INDIAN_BRANDS = [
    ['reliance', 'reliance.com'],
    ['tata', 'tata.com'],
    ['infosys', 'infosys.com'],
    ['wipro', 'wipro.com'],
    ['hdfc', 'hdfcbank.com'],
    ['icici', 'icicibank.com'],
    ['airtel', 'airtel.in'],
    ['flipkart', 'flipkart.com'],
    ['zomato', 'zomato.com'],
    ['swiggy', 'swiggy.com'],
    ['ola', 'olacabs.com'],
    ['jio', 'jio.com'],
    ['byjus', 'byjus.com'],
    ['paytm', 'paytm.com'],
    ['zerodha', 'zerodha.com'],
    ['nykaa', 'nykaa.com'],
    ['boat', 'boat-lifestyle.com'],
    ['adani', 'adani.com'],
    ['mahindra', 'mahindra.com'],
    ['godrej', 'godrej.com']
];

const GLOBAL_BRANDS = [
    ['google', 'google.com'],
    ['facebook', 'facebook.com'],
    ['nike', 'nike.com'],
    ['apple', 'apple.com'],
    ['amazon', 'amazon.com'],
    ['microsoft', 'microsoft.com'],
    ['netflix', 'netflix.com'],
    ['spotify', 'spotify.com'],
    ['tesla', 'tesla.com'],
    ['adobe', 'adobe.com'],
    ['samsung', 'samsung.com'],
    ['sony', 'sony.com'],
    ['disney', 'disney.com'],
    ['airbnb', 'airbnb.com'],
    ['uber', 'uber.com'],
    ['openai', 'openai.com'],
    ['oracle', 'oracle.com'],
    ['salesforce', 'salesforce.com'],
    ['intel', 'intel.com'],
    ['paypal', 'paypal.com']
];

function seededNoise(seed: number) {
    const x = Math.sin(seed * 999.91) * 10000;
    return x - Math.floor(x);
}

function titleCase(value: string) {
    return value
        .split(/[\s\-_.]+/)
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
}

function makeDomain(seed: number, country: string) {
    const prefixes = [
        'prime', 'nova', 'zen', 'hyper', 'aero', 'quant', 'atlas', 'pixel', 'core', 'vista',
        'urban', 'lumen', 'vertex', 'signal', 'spectrum', 'elevate', 'alpha', 'orbit', 'catalyst'
    ];
    const suffixes = [
        'tech', 'labs', 'group', 'digital', 'systems', 'works', 'brands', 'media', 'care', 'finance',
        'retail', 'global', 'network', 'energy', 'ventures', 'studio', 'cloud', 'market'
    ];

    const a = prefixes[seed % prefixes.length];
    const b = suffixes[(seed * 7) % suffixes.length];
    const tld = country === 'India' ? '.in' : '.com';
    return `${a}${seed}${b}${tld}`;
}

function generateRows(scope: LeaderboardScope): SiteRow[] {
    const rows: SiteRow[] = [];
    const target = 10000;

    for (let i = 1; i <= target; i++) {
        const n = seededNoise(i);
        const country =
            scope === 'national'
                ? 'India'
                : COUNTRIES[Math.floor(seededNoise(i * 3) * COUNTRIES.length)];

        const category = CATEGORIES[Math.floor(seededNoise(i * 5) * CATEGORIES.length)];
        const trafficTier = TRAFFIC_TIERS[Math.floor(seededNoise(i * 11) * TRAFFIC_TIERS.length)];
        const trend = Math.round((seededNoise(i * 13) * 8 - 3) * 10) / 10;

        let brand = '';
        let domain = '';

        if (scope === 'national' && i <= INDIAN_BRANDS.length) {
            brand = titleCase(INDIAN_BRANDS[i - 1][0]);
            domain = INDIAN_BRANDS[i - 1][1];
        } else if (scope === 'global' && i <= GLOBAL_BRANDS.length) {
            brand = titleCase(GLOBAL_BRANDS[i - 1][0]);
            domain = GLOBAL_BRANDS[i - 1][1];
        } else {
            domain = makeDomain(i, country);
            brand = titleCase(domain.replace(/\.(com|in|org|net)$/, ''));
        }

        const baseScore =
            scope === 'national'
                ? 94 - i * 0.0048 + seededNoise(i * 17) * 3.8
                : 96 - i * 0.0046 + seededNoise(i * 19) * 4.2;

        const score = Math.max(52, Math.min(99.6, Math.round(baseScore * 10) / 10));

        rows.push({
            rank: i,
            domain,
            brand,
            score,
            country,
            category,
            trend,
            trafficTier
        });
    }

    return rows;
}

function scoreTone(score: number) {
    if (score >= 90) return 'text-[#00E28A]';
    if (score >= 75) return 'text-[#00D1FF]';
    if (score >= 60) return 'text-yellow-300';
    return 'text-[#FF3D57]';
}

function trendTone(trend: number) {
    if (trend > 0) return 'text-[#00E28A]';
    if (trend < 0) return 'text-[#FF3D57]';
    return 'text-white/50';
}

export default function LeaderboardPage() {
    const [scope, setScope] = useState<LeaderboardScope>('global');
    const [query, setQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [page, setPage] = useState(1);

    const globalRows = useMemo(() => generateRows('global'), []);
    const nationalRows = useMemo(() => generateRows('national'), []);

    const baseRows = scope === 'global' ? globalRows : nationalRows;

    const filteredRows = useMemo(() => {
        const q = query.trim().toLowerCase();

        return baseRows.filter((row) => {
            const matchesQuery =
                !q ||
                row.brand.toLowerCase().includes(q) ||
                row.domain.toLowerCase().includes(q) ||
                row.country.toLowerCase().includes(q) ||
                row.category.toLowerCase().includes(q);

            const matchesCategory =
                categoryFilter === 'All' || row.category === categoryFilter;

            return matchesQuery && matchesCategory;
        });
    }, [baseRows, query, categoryFilter]);

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
                ? Math.round(
                      (filteredRows.reduce((sum, row) => sum + row.score, 0) / total) * 10
                  ) / 10
                : 0;
        const above90 = filteredRows.filter((row) => row.score >= 90).length;
        return { total, avg, above90 };
    }, [filteredRows]);

    const changeScope = (next: LeaderboardScope) => {
        setScope(next);
        setPage(1);
        setQuery('');
        setCategoryFilter('All');
    };

    const goPrev = () => setPage((p) => Math.max(1, p - 1));
    const goNext = () => setPage((p) => Math.min(totalPages, p + 1));

    return (
        <DashboardShell>
            <div className="space-y-10 max-w-[1500px] mx-auto pt-10 pb-24">
                <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 border-b border-white/5 pb-6">
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
                                GLOBAL & NATIONAL
                                <br />
                                TOP 10,000
                            </h1>
                            <p className="text-white/45 text-base md:text-lg max-w-4xl font-medium">
                                A leaderboard interface for the top 10,000 websites across the world
                                and across India, with ranking, score, category, country, movement,
                                and search controls.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <button className="apple-button-outline flex items-center justify-center gap-2">
                            <BarChart3 size={16} />
                            <span>Export Rankings</span>
                        </button>
                        <button className="apple-button-primary flex items-center justify-center gap-2">
                            <Trophy size={16} />
                            <span>Unlock Live Leaderboard Feed</span>
                        </button>
                    </div>
                </div>

                <section className="grid grid-cols-1 md:grid-cols-4 gap-5">
                    <div className="apple-card p-6">
                        <div className="text-[10px] font-black uppercase tracking-[0.24em] text-white/30">
                            Current Scope
                        </div>
                        <div className="text-3xl font-black font-display text-white mt-2">
                            {scope === 'global' ? 'Global' : 'India'}
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
                            90+ Websites
                        </div>
                        <div className="text-3xl font-black font-display text-white mt-2">
                            {stats.above90.toLocaleString()}
                        </div>
                    </div>
                </section>

                <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {topThree.map((site, idx) => (
                        <motion.div
                            key={`${scope}-${site.domain}`}
                            initial={{ opacity: 0, y: 18 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.06 }}
                            className="apple-card p-7 space-y-5"
                        >
                            <div className="flex items-start justify-between">
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

                            <div>
                                <div className="text-2xl font-extrabold font-display tracking-tight text-white">
                                    {site.brand}
                                </div>
                                <div className="text-white/40 text-sm mt-1">{site.domain}</div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
                                        Country
                                    </div>
                                    <div className="text-white font-bold mt-2">{site.country}</div>
                                </div>
                                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
                                        Category
                                    </div>
                                    <div className="text-white font-bold mt-2">{site.category}</div>
                                </div>
                            </div>
                        </motion.div>
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
                                    Global 10,000
                                </span>
                            </button>

                            <button
                                onClick={() => changeScope('national')}
                                className={`px-5 py-3 rounded-2xl border text-sm font-black uppercase tracking-[0.16em] transition-all ${
                                    scope === 'national'
                                        ? 'border-[#00D1FF]/30 bg-[#00D1FF]/10 text-[#00D1FF]'
                                        : 'border-white/10 bg-white/[0.03] text-white/60 hover:text-white'
                                }`}
                            >
                                <span className="inline-flex items-center gap-2">
                                    <MapPinned size={14} />
                                    India 10,000
                                </span>
                            </button>
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
                                    placeholder="Search brand, domain, country..."
                                    className="w-full md:w-[320px] rounded-2xl border border-white/10 bg-white/[0.03] pl-11 pr-4 py-3 text-white outline-none focus:border-white/25"
                                />
                            </div>

                            <div className="relative">
                                <Filter
                                    size={16}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
                                />
                                <select
                                    value={categoryFilter}
                                    onChange={(e) => {
                                        setCategoryFilter(e.target.value);
                                        setPage(1);
                                    }}
                                    className="appearance-none rounded-2xl border border-white/10 bg-white/[0.03] pl-11 pr-10 py-3 text-white outline-none focus:border-white/25"
                                >
                                    <option value="All" className="bg-[#0B0F14]">All Categories</option>
                                    {CATEGORIES.map((category) => (
                                        <option key={category} value={category} className="bg-[#0B0F14]">
                                            {category}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto rounded-3xl border border-white/10 bg-white/[0.02]">
                        <table className="w-full min-w-[1100px]">
                            <thead className="border-b border-white/10">
                                <tr className="text-left">
                                    <th className="px-6 py-4 text-[11px] font-black uppercase tracking-[0.22em] text-white/30">Rank</th>
                                    <th className="px-6 py-4 text-[11px] font-black uppercase tracking-[0.22em] text-white/30">Website</th>
                                    <th className="px-6 py-4 text-[11px] font-black uppercase tracking-[0.22em] text-white/30">Score</th>
                                    <th className="px-6 py-4 text-[11px] font-black uppercase tracking-[0.22em] text-white/30">Country</th>
                                    <th className="px-6 py-4 text-[11px] font-black uppercase tracking-[0.22em] text-white/30">Category</th>
                                    <th className="px-6 py-4 text-[11px] font-black uppercase tracking-[0.22em] text-white/30">Trend</th>
                                    <th className="px-6 py-4 text-[11px] font-black uppercase tracking-[0.22em] text-white/30">Traffic Tier</th>
                                </tr>
                            </thead>

                            <tbody>
                                {visibleRows.map((row, idx) => (
                                    <motion.tr
                                        key={`${scope}-${row.rank}-${row.domain}`}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: idx * 0.003 }}
                                        className="border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors"
                                    >
                                        <td className="px-6 py-4 text-white font-black">#{row.rank}</td>
                                        <td className="px-6 py-4">
                                            <div className="text-white font-bold">{row.brand}</div>
                                            <div className="text-white/35 text-sm mt-1">{row.domain}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className={`text-lg font-black font-display ${scoreTone(row.score)}`}>
                                                {row.score.toFixed(1)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-white/75">{row.country}</td>
                                        <td className="px-6 py-4 text-white/75">{row.category}</td>
                                        <td className="px-6 py-4">
                                            <div className={`inline-flex items-center gap-2 font-black ${trendTone(row.trend)}`}>
                                                <TrendingUp size={14} />
                                                {row.trend > 0 ? '+' : ''}{row.trend.toFixed(1)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-white/75">{row.trafficTier}</td>
                                    </motion.tr>
                                ))}

                                {visibleRows.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-16 text-center text-white/40 font-bold">
                                            No websites matched your filters.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="text-sm text-white/40 font-medium">
                            Showing{' '}
                            <span className="text-white font-bold">
                                {visibleRows.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}
                            </span>
                            {' '}to{' '}
                            <span className="text-white font-bold">
                                {Math.min(currentPage * PAGE_SIZE, filteredRows.length)}
                            </span>
                            {' '}of{' '}
                            <span className="text-white font-bold">{filteredRows.length.toLocaleString()}</span>
                            {' '}ranked websites
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
