'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    Search,
    Gauge,
    Shield,
    Sparkles,
    Users,
    FileText,
    Lock,
    ArrowLeft,
    ArrowRight,
    CheckCircle2
} from 'lucide-react';
import DashboardShell from '@/components/DashboardShell';
import { useGuestAudit } from '@/context/GuestAuditContext';

type Scores = {
    marketPresence?: number;
    technicalHealth?: number;
    security?: number;
    innovation?: number;
    customerExperience?: number;
    contentQuality?: number;
};

type PillarKey =
    | 'marketPresence'
    | 'technicalHealth'
    | 'security'
    | 'innovation'
    | 'customerExperience'
    | 'contentQuality';

type Pillar = {
    key: PillarKey;
    title: string;
    shortTitle: string;
    subtitle: string;
    icon: any;
    color: string;
    border: string;
    bg: string;
    score: (scores: Scores) => number;
    metricCategories: string[];
    issues: string[];
    wins: string[];
};

const pillars: Pillar[] = [
    {
        key: 'marketPresence',
        title: 'Discovery',
        shortTitle: 'Discovery Score',
        subtitle: 'Search visibility, findability, and discoverability signals.',
        icon: Search,
        color: 'text-[#00D1FF]',
        border: 'border-[#00D1FF]/20',
        bg: 'bg-[#00D1FF]/10',
        score: (scores) => Number(scores.marketPresence || 0),
        metricCategories: ['SEO'],
        issues: [
            'Title, meta, and semantic relevance gaps',
            'Weak structured data and SERP enhancement signals',
            'Low visibility against stronger category competitors'
        ],
        wins: [
            'Tighten metadata and heading hierarchy',
            'Deploy schema and canonical consistency',
            'Strengthen landing-page relevance for core queries'
        ]
    },
    {
        key: 'technicalHealth',
        title: 'Performance Integrity',
        shortTitle: 'Performance Integrity',
        subtitle: 'Speed, rendering, stability, and delivery infrastructure quality.',
        icon: Gauge,
        color: 'text-[#7B5CFF]',
        border: 'border-[#7B5CFF]/20',
        bg: 'bg-[#7B5CFF]/10',
        score: (scores) => Number(scores.technicalHealth || 0),
        metricCategories: ['Performance', 'Lighthouse'],
        issues: [
            'Heavy payloads and rendering bottlenecks',
            'Slow critical path resources',
            'Front-end friction affecting perceived quality'
        ],
        wins: [
            'Compress and defer non-critical assets',
            'Reduce page weight and layout instability',
            'Improve core loading sequence and cache strategy'
        ]
    },
    {
        key: 'security',
        title: 'Trust & Authority',
        shortTitle: 'Trust & Authority',
        subtitle: 'Security, credibility, and confidence-building trust architecture.',
        icon: Shield,
        color: 'text-[#00E28A]',
        border: 'border-[#00E28A]/20',
        bg: 'bg-[#00E28A]/10',
        score: (scores) => Number(scores.security || 0),
        metricCategories: ['Security'],
        issues: [
            'Missing headers or weak hardening layers',
            'Reduced visible trust cues for users and buyers',
            'Potential authority loss from weak credibility framing'
        ],
        wins: [
            'Strengthen transport and browser security headers',
            'Surface proof, trust badges, and validation signals',
            'Tighten consistency between brand and security posture'
        ]
    },
    {
        key: 'innovation',
        title: 'Brand Clarity',
        shortTitle: 'Brand Clarity',
        subtitle: 'Positioning sharpness, differentiation, and strategic signal clarity.',
        icon: Sparkles,
        color: 'text-[#FFB84D]',
        border: 'border-[#FFB84D]/20',
        bg: 'bg-[#FFB84D]/10',
        score: (scores) => Number(scores.innovation || 0),
        metricCategories: ['Brand', 'Innovation'],
        issues: [
            'Messaging may be broad or overly generic',
            'Differentiation not immediately obvious',
            'Strategic narrative lacks edge or precision'
        ],
        wins: [
            'Clarify value proposition above the fold',
            'Sharpen category framing and offer articulation',
            'Build stronger narrative contrast against competitors'
        ]
    },
    {
        key: 'customerExperience',
        title: 'Customer Experience',
        shortTitle: 'Customer Experience',
        subtitle: 'Usability, accessibility, and user journey continuity.',
        icon: Users,
        color: 'text-[#FF3D57]',
        border: 'border-[#FF3D57]/20',
        bg: 'bg-[#FF3D57]/10',
        score: (scores) => Number(scores.customerExperience || 0),
        metricCategories: ['UX', 'Accessibility'],
        issues: [
            'Accessibility and navigation friction',
            'Unclear path to action or conversion',
            'Weak consistency across interaction patterns'
        ],
        wins: [
            'Improve accessibility labels and hierarchy',
            'Reduce friction in primary journey paths',
            'Make CTAs clearer and more conversion-aligned'
        ]
    },
    {
        key: 'contentQuality',
        title: 'Narrative Weight',
        shortTitle: 'Narrative Weight',
        subtitle: 'Depth, persuasiveness, and strategic communication quality.',
        icon: FileText,
        color: 'text-white',
        border: 'border-white/10',
        bg: 'bg-white/5',
        score: (scores) => Number(scores.contentQuality || 0),
        metricCategories: ['Content'],
        issues: [
            'Thin or underpowered communication',
            'Insufficient authority-building substance',
            'Content not fully aligned to buyer intent'
        ],
        wins: [
            'Expand persuasive and proof-based content',
            'Add clearer authority and expertise signals',
            'Map content to audience pain points and decision stage'
        ]
    }
];

function getScoreTone(score: number) {
    if (score >= 80) return 'text-[#00E28A]';
    if (score >= 60) return 'text-[#00D1FF]';
    return 'text-[#FF3D57]';
}

function clampPercent(score: number) {
    return Math.max(0, Math.min(100, score));
}

export default function PillarsPage() {
    const { guestAuditResult } = useGuestAudit();

    const result = guestAuditResult || null;
    const scores: Scores = result?.scores || {};
    
    const rawMetrics = Array.isArray(result?.rawData?.metrics) 
        ? result.rawData.metrics 
        : Array.isArray(result?.meta?.metrics) 
        ? result.meta.metrics 
        : [];

    return (
        <DashboardShell>
            <div className="space-y-10 max-w-[1400px] mx-auto pt-10 pb-24">
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
                                Pillar Intelligence Layer
                            </div>
                            <h1 className="text-5xl md:text-6xl font-extrabold font-display tracking-tighter text-white leading-[0.95]">
                                ALL 6 BRAND
                                <br />
                                PILLARS
                            </h1>
                            <p className="text-white/45 text-base md:text-lg max-w-3xl font-medium">
                                Strategic view of your six diagnostic pillars. The sidebar remains active
                                here because this page renders inside the same dashboard shell.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <Link
                            href="/"
                            className="apple-button-outline flex items-center justify-center gap-2"
                        >
                            <ArrowLeft size={16} />
                            <span>Return to Scan</span>
                        </Link>
                        <Link href="/pricing" className="apple-button-primary flex items-center justify-center gap-2">
                            <Lock size={16} />
                            <span>Unlock Full Pillar Report</span>
                        </Link>
                    </div>
                </div>

                {!result && (
                    <div className="apple-card p-10 text-center space-y-4">
                        <div className="text-3xl font-black font-display text-white">
                            No cached audit found
                        </div>
                        <p className="text-white/45 max-w-2xl mx-auto">
                            Run a diagnostic scan from the dashboard first. Once an audit exists,
                            the pillars page will use the same data here without losing the sidebar.
                        </p>
                        <div className="pt-2">
                            <Link href="/" className="apple-button-primary inline-flex items-center gap-2">
                                <ArrowLeft size={16} />
                                <span>Go to Dashboard</span>
                            </Link>
                        </div>
                    </div>
                )}

                {result && (
                    <>
                        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
                            <div className="apple-card p-6">
                                <div className="text-[10px] font-black uppercase tracking-[0.24em] text-white/30">
                                    Active Domain
                                </div>
                                <div className="text-lg font-black text-white mt-2 break-all">
                                    {result?.url || 'Current scan'}
                                </div>
                            </div>

                            <div className="apple-card p-6">
                                <div className="text-[10px] font-black uppercase tracking-[0.24em] text-white/30">
                                    Pillars Tracked
                                </div>
                                <div className="text-4xl font-black font-display text-white mt-2">
                                    6
                                </div>
                            </div>

                            <div className="apple-card p-6">
                                <div className="text-[10px] font-black uppercase tracking-[0.24em] text-white/30">
                                    Diagnostic Findings
                                </div>
                                <div className="text-4xl font-black font-display text-white mt-2">
                                    {Array.isArray(result?.findings) ? result.findings.length : 0}
                                </div>
                            </div>

                            <div className="apple-card p-6">
                                <div className="text-[10px] font-black uppercase tracking-[0.24em] text-white/30">
                                    Composite Score
                                </div>
                                <div className={`text-4xl font-black font-display mt-2 ${getScoreTone(Number(result?.aggregate || 0) * 10)}`}>
                                    {Number(result?.aggregate || 0).toFixed(1)}
                                </div>
                            </div>
                        </section>

                        <section className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                            {pillars.map((pillar, i) => {
                                const Icon = pillar.icon;
                                const score = pillar.score(scores);
                                const scorePercent = clampPercent(score);

                                return (
                                    <motion.article
                                        key={pillar.key}
                                        initial={{ opacity: 0, y: 24 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="apple-card p-7 space-y-6"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className={`inline-flex p-3 rounded-2xl border ${pillar.border} ${pillar.bg}`}>
                                                <Icon size={20} className={pillar.color} />
                                            </div>

                                            <div className="text-right">
                                                <div className="text-[10px] font-black uppercase tracking-[0.24em] text-white/30">
                                                    {pillar.shortTitle}
                                                </div>
                                                <div className={`text-3xl font-black font-display mt-1 ${getScoreTone(score)}`}>
                                                    {score.toFixed(1)}
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <h2 className="text-2xl font-extrabold font-display tracking-tight text-white">
                                                {pillar.title}
                                            </h2>
                                            <p className="text-white/45 text-sm leading-relaxed mt-2">
                                                {pillar.subtitle}
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                                                <div
                                                    className="h-full bg-white/80"
                                                    style={{ width: `${scorePercent}%` }}
                                                />
                                            </div>
                                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-white/25">
                                                <span>Signal Strength</span>
                                                <span>{scorePercent.toFixed(0)}%</span>
                                            </div>
                                        </div>

                                        {(() => {
                                            const pillarMetrics = rawMetrics.filter((m: any) => pillar.metricCategories.includes(m.category));
                                            if (pillarMetrics.length === 0) return null;
                                            return (
                                                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                                                    <div className="text-[11px] font-black uppercase tracking-[0.18em] text-white/50 mb-3">
                                                        Analyzed Metrics
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        {pillarMetrics.slice(0, 10).map((m: any, idx: number) => {
                                                            let unit = m.unit === 'v' || !m.unit ? '' : m.unit;
                                                            if (unit === 'millisecond') {
                                                                m.displayValue = (m.value / 1000).toFixed(2);
                                                                unit = 's';
                                                            }
                                                            return (
                                                                <div key={m.id || idx} className="group relative rounded-xl bg-white/[0.02] p-3 hover:bg-white/[0.05] transition-colors">
                                                                    <div className="text-[9px] font-black uppercase text-white/50 mb-0.5 truncate">
                                                                        {m.title}
                                                                    </div>
                                                                    <div className="text-sm font-bold text-white font-mono break-words">
                                                                        {m.displayValue} {unit && <span className="text-[10px] text-white/40">{unit}</span>}
                                                                    </div>
                                                                    
                                                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 rounded-xl bg-black border border-white/20 shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10 hidden md:block">
                                                                        <div className="text-[11px] font-medium text-white/90">
                                                                            {m.description || m.title}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )
                                                        })}
                                                    </div>
                                                </div>
                                            );
                                        })()}

                                        <div className="grid grid-cols-1 gap-4">
                                            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                                                <div className="text-[11px] font-black uppercase tracking-[0.18em] text-[#FF3D57] mb-3">
                                                    Priority Risks
                                                </div>
                                                <ul className="space-y-2">
                                                    {pillar.issues.map((item, idx) => (
                                                        <li key={idx} className="flex gap-3 text-sm text-white/65">
                                                            <span className="text-[#FF3D57]">•</span>
                                                            <span>{item}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                                                <div className="text-[11px] font-black uppercase tracking-[0.18em] text-[#00E28A] mb-3">
                                                    Improvement Moves
                                                </div>
                                                <ul className="space-y-2">
                                                    {pillar.wins.map((item, idx) => (
                                                        <li key={idx} className="flex gap-3 text-sm text-white/65">
                                                            <CheckCircle2 size={14} className="text-[#00E28A] shrink-0 mt-0.5" />
                                                            <span>{item}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>

                                        <Link href="/pricing" className="w-full flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] py-3 text-sm font-black uppercase tracking-[0.16em] text-white/75 hover:bg-white/[0.06] hover:text-white transition-all">
                                            <Lock size={14} />
                                            Unlock {pillar.title}
                                            <ArrowRight size={14} />
                                        </Link>
                                    </motion.article>
                                );
                            })}
                        </section>
                    </>
                )}
            </div>
        </DashboardShell>
    );
}
