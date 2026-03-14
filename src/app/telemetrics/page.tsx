'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    Activity,
    ArrowLeft,
    ArrowRight,
    Clock3,
    Shield,
    Search,
    Gauge,
    Sparkles,
    Users,
    FileText,
    Lock,
    AlertTriangle
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

function getScoreTone(score: number) {
    if (score >= 80) return 'text-[#00E28A]';
    if (score >= 60) return 'text-[#00D1FF]';
    return 'text-[#FF3D57]';
}

function getBarTone(score: number) {
    if (score >= 80) return 'bg-[#00E28A]';
    if (score >= 60) return 'bg-[#00D1FF]';
    return 'bg-[#FF3D57]';
}

function clampPercent(score: number) {
    return Math.max(0, Math.min(100, score));
}

export default function TelemetricsPage() {
    const { guestAuditResult } = useGuestAudit();

    const result = guestAuditResult || null;
    const scores: Scores = result?.scores || {};

    const integrityNodes = [
        {
            label: 'Discovery Score',
            value: Number(scores.marketPresence || 0),
            icon: Search,
            note: 'Visibility and search presence layer',
        },
        {
            label: 'Performance Integrity',
            value: Number(scores.technicalHealth || 0),
            icon: Gauge,
            note: 'Speed and delivery resilience layer',
        },
        {
            label: 'Trust & Authority',
            value: Number(scores.security || 0),
            icon: Shield,
            note: 'Security and confidence framework',
        },
        {
            label: 'Brand Clarity',
            value: Number(scores.innovation || 0),
            icon: Sparkles,
            note: 'Positioning sharpness and differentiation',
        },
        {
            label: 'Customer Experience',
            value: Number(scores.customerExperience || 0),
            icon: Users,
            note: 'Usability and accessibility continuity',
        },
        {
            label: 'Narrative Weight',
            value: Number(scores.contentQuality || 0),
            icon: FileText,
            note: 'Message depth and persuasive density',
        }
    ];

    const findings = Array.isArray(result?.findings) ? result.findings : [];
    const rawMetrics = Array.isArray(result?.rawData?.metrics) 
        ? result.rawData.metrics 
        : Array.isArray(result?.meta?.metrics) 
        ? result.meta.metrics 
        : [];
        
    const criticalCount = findings.filter((f: any) => f?.severity === 'CRITICAL').length;
    const highCount = findings.filter((f: any) => f?.severity === 'HIGH').length;
    const mediumCount = findings.filter((f: any) => f?.severity === 'MEDIUM').length;
    const lowCount = findings.filter((f: any) => f?.severity === 'LOW').length;

    const aggregateScore =
        typeof result?.aggregate === 'number'
            ? result.aggregate
            : Number(result?.aggregate || 0);

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
                                Telemetrics Interface
                            </div>
                            <h1 className="text-5xl md:text-6xl font-extrabold font-display tracking-tighter text-white leading-[0.95]">
                                DIAGNOSTIC
                                <br />
                                TELEMETRICS
                            </h1>
                            <p className="text-white/45 text-base md:text-lg max-w-3xl font-medium">
                                Deep view into audit findings, signal breakdowns, and severity distribution,
                                with the sidebar still active because this page renders inside the same dashboard shell.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <Link
                            href="/"
                            className="apple-button-outline flex items-center justify-center gap-2"
                        >
                            <ArrowLeft size={16} />
                            <span>Return to Dashboard</span>
                        </Link>
                        <button className="apple-button-primary flex items-center justify-center gap-2">
                            <Lock size={16} />
                            <span>Unlock Executive Telemetry Export</span>
                        </button>
                    </div>
                </div>

                {!result && (
                    <div className="apple-card p-10 text-center space-y-4">
                        <div className="text-3xl font-black font-display text-white">
                            No telemetric feed available yet
                        </div>
                        <p className="text-white/45 max-w-2xl mx-auto">
                            Run a diagnostic scan from the dashboard first. Once an audit exists,
                            this page will render the same audit data here without losing the sidebar.
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
                                    Composite Score
                                </div>
                                <div className={`text-4xl font-black font-display mt-2 ${getScoreTone(aggregateScore * 10)}`}>
                                    {aggregateScore.toFixed(1)}
                                </div>
                            </div>

                            <div className="apple-card p-6">
                                <div className="text-[10px] font-black uppercase tracking-[0.24em] text-white/30">
                                    Total Findings
                                </div>
                                <div className="text-4xl font-black font-display text-white mt-2">
                                    {findings.length}
                                </div>
                            </div>

                            <div className="apple-card p-6">
                                <div className="text-[10px] font-black uppercase tracking-[0.24em] text-white/30">
                                    Feed Status
                                </div>
                                <div className="flex items-center gap-3 mt-3">
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#00E28A] shadow-[0_0_10px_#00E28A]" />
                                    <div className="text-lg font-black text-white">Active</div>
                                </div>
                            </div>
                        </section>

                        <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                            <div className="xl:col-span-2 apple-card p-8 space-y-8">
                                <div className="flex items-center justify-between border-b border-white/10 pb-5">
                                    <div>
                                        <div className="text-[11px] font-black uppercase tracking-[0.28em] text-white/30">
                                            Integrity Nodes
                                        </div>
                                        <h2 className="text-3xl font-extrabold font-display tracking-tight text-white mt-2">
                                            Score Distribution
                                        </h2>
                                    </div>
                                    <Activity size={22} className="text-[#00D1FF]" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    {integrityNodes.map((node, i) => {
                                        const Icon = node.icon;
                                        const percent = clampPercent(node.value);

                                        return (
                                            <motion.div
                                                key={node.label}
                                                initial={{ opacity: 0, y: 18 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.05 }}
                                                className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 space-y-4"
                                            >
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                                                            <Icon size={18} className="text-[#00D1FF]" />
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-black text-white">
                                                                {node.label}
                                                            </div>
                                                            <div className="text-[11px] text-white/35 mt-1">
                                                                {node.note}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className={`text-2xl font-black font-display ${getScoreTone(node.value)}`}>
                                                        {node.value.toFixed(1)}
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                                                        <div
                                                            className={`h-full ${getBarTone(node.value)}`}
                                                            style={{ width: `${percent}%` }}
                                                        />
                                                    </div>
                                                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-white/25">
                                                        <span>Signal Strength</span>
                                                        <span>{percent.toFixed(0)}%</span>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="apple-card p-8 space-y-8">
                                <div className="border-b border-white/10 pb-5">
                                    <div className="text-[11px] font-black uppercase tracking-[0.28em] text-white/30">
                                        Severity Stack
                                    </div>
                                    <h2 className="text-3xl font-extrabold font-display tracking-tight text-white mt-2">
                                        Alert Density
                                    </h2>
                                </div>

                                <div className="space-y-5">
                                    <div className="rounded-2xl border border-[#FF3D57]/20 bg-[#FF3D57]/10 p-5">
                                        <div className="flex items-center justify-between">
                                            <div className="text-sm font-black text-[#FF3D57] uppercase tracking-[0.18em]">
                                                Critical
                                            </div>
                                            <div className="text-3xl font-black font-display text-white">
                                                {criticalCount}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="rounded-2xl border border-orange-400/20 bg-orange-400/10 p-5">
                                        <div className="flex items-center justify-between">
                                            <div className="text-sm font-black text-orange-300 uppercase tracking-[0.18em]">
                                                High
                                            </div>
                                            <div className="text-3xl font-black font-display text-white">
                                                {highCount}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="rounded-2xl border border-[#00D1FF]/20 bg-[#00D1FF]/10 p-5">
                                        <div className="flex items-center justify-between">
                                            <div className="text-sm font-black text-[#00D1FF] uppercase tracking-[0.18em]">
                                                Medium
                                            </div>
                                            <div className="text-3xl font-black font-display text-white">
                                                {mediumCount}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                                        <div className="flex items-center justify-between">
                                            <div className="text-sm font-black text-white/70 uppercase tracking-[0.18em]">
                                                Low
                                            </div>
                                            <div className="text-3xl font-black font-display text-white">
                                                {lowCount}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <button className="w-full apple-button-outline flex items-center justify-center gap-2">
                                    <Lock size={16} />
                                    <span>Unlock Live Trend Graphs</span>
                                </button>
                            </div>
                        </section>

                        {rawMetrics.length > 0 && (
                            <section className="apple-card p-8 space-y-8">
                                <div className="border-b border-white/10 pb-5">
                                    <div className="text-[11px] font-black uppercase tracking-[0.28em] text-white/30">
                                        Data Points
                                    </div>
                                    <h2 className="text-3xl font-extrabold font-display tracking-tight text-white mt-2">
                                        Analyzed Metrics
                                    </h2>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                    {rawMetrics.map((m: any, i: number) => {
                                        let unit = m.unit === 'v' || !m.unit ? '' : m.unit;
                                        if (unit === 'millisecond') {
                                            m.displayValue = (m.value / 1000).toFixed(2);
                                            unit = 's';
                                        }
                                        return (
                                        <div key={m.id || i} className="group relative rounded-2xl border border-white/10 bg-white/[0.03] p-4 hover:bg-white/[0.05] transition-colors">
                                            <div className="text-[10px] font-black uppercase text-white/50 mb-1 truncate">
                                                {m.title}
                                            </div>
                                            <div className="text-xl font-bold text-white font-mono break-words">
                                                {m.displayValue} {unit && <span className="text-xs text-white/40">{unit}</span>}
                                            </div>
                                            
                                            {/* Hover Modal */}
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-4 rounded-xl bg-black border border-white/20 shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10 hidden md:block">
                                                <div className="text-xs font-medium text-white/90">
                                                    {m.description || m.title}
                                                </div>
                                                <div className="text-[9px] text-[#00D1FF] mt-2 uppercase tracking-wider font-bold">
                                                    Category: {m.category || 'General'}
                                                </div>
                                            </div>
                                        </div>
                                    )})}
                                </div>
                            </section>
                        )}

                        <section className="apple-card p-8 space-y-8">
                            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-b border-white/10 pb-5">
                                <div>
                                    <div className="text-[11px] font-black uppercase tracking-[0.28em] text-white/30">
                                        Telemetric Shards
                                    </div>
                                    <h2 className="text-3xl font-extrabold font-display tracking-tight text-white mt-2">
                                        Findings Stream
                                    </h2>
                                </div>

                                <div className="flex items-center gap-2 text-white/35 text-xs font-black uppercase tracking-[0.2em]">
                                    <Clock3 size={14} />
                                    Ordered by current diagnostic payload
                                </div>
                            </div>

                            {findings.length === 0 ? (
                                <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center">
                                    <div className="text-2xl font-black font-display text-white">
                                        No findings available
                                    </div>
                                    <p className="text-white/45 mt-2">
                                        Once a diagnostic scan returns findings, they will appear here.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {findings.map((f: any, i: number) => {
                                        const severityColor =
                                            f?.severity === 'CRITICAL'
                                                ? 'text-[#FF3D57]'
                                                : f?.severity === 'HIGH'
                                                ? 'text-orange-300'
                                                : f?.severity === 'MEDIUM'
                                                ? 'text-[#00D1FF]'
                                                : 'text-white/60';

                                        const severityBg =
                                            f?.severity === 'CRITICAL'
                                                ? 'bg-[#FF3D57]/10 border-[#FF3D57]/20'
                                                : f?.severity === 'HIGH'
                                                ? 'bg-orange-400/10 border-orange-400/20'
                                                : f?.severity === 'MEDIUM'
                                                ? 'bg-[#00D1FF]/10 border-[#00D1FF]/20'
                                                : 'bg-white/[0.03] border-white/10';

                                        return (
                                            <motion.div
                                                key={`${f?.code || 'finding'}-${i}`}
                                                initial={{ opacity: 0, y: 16 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.02 }}
                                                className={`rounded-3xl border p-5 ${severityBg}`}
                                            >
                                                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
                                                    <div className="space-y-3">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <span className="text-white font-black text-lg tracking-tight">
                                                                {f?.title || 'Untitled finding'}
                                                            </span>
                                                            <span className={`text-[10px] font-black uppercase tracking-[0.22em] ${severityColor}`}>
                                                                {f?.severity || 'LOW'}
                                                            </span>
                                                        </div>

                                                        <div className="flex flex-wrap items-center gap-3 text-[11px] font-black uppercase tracking-[0.18em] text-white/35">
                                                            <span>{f?.category || 'General'}</span>
                                                            <span>Impact: {f?.impact || 'Unknown'}</span>
                                                            <span>Confidence: {Number(f?.confidence || 0).toFixed(2)}</span>
                                                        </div>

                                                        <p className="text-white/65 text-sm leading-relaxed max-w-4xl">
                                                            {f?.recommendation || 'No recommendation available.'}
                                                        </p>
                                                    </div>

                                                    <div className="lg:min-w-[180px] rounded-2xl border border-white/10 bg-black/20 p-4">
                                                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-2">
                                                            Action Status
                                                        </div>
                                                        <div className="flex items-center gap-2 text-sm font-bold text-white">
                                                            <AlertTriangle size={15} className={severityColor} />
                                                            Requires review
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            )}
                        </section>

                        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="apple-card p-8">
                                <div className="text-[11px] font-black uppercase tracking-[0.28em] text-white/30">
                                    Recovery Layer
                                </div>
                                <h2 className="text-3xl font-extrabold font-display tracking-tight text-white mt-2">
                                    Strategic Follow-up
                                </h2>
                                <p className="text-white/45 mt-3 leading-relaxed">
                                    Move from passive findings into decision-oriented remediation tracks,
                                    competitor comparisons, and prioritized execution flows.
                                </p>

                                <button className="mt-6 apple-button-primary flex items-center gap-2">
                                    <Lock size={16} />
                                    <span>Unlock Recovery Simulator</span>
                                </button>
                            </div>

                            <div className="apple-card p-8">
                                <div className="text-[11px] font-black uppercase tracking-[0.28em] text-white/30">
                                    Navigation
                                </div>
                                <h2 className="text-3xl font-extrabold font-display tracking-tight text-white mt-2">
                                    Continue Analysis
                                </h2>

                                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                                    <Link
                                        href="/pillars"
                                        className="apple-button-outline flex items-center justify-center gap-2"
                                    >
                                        <span>Open Pillars View</span>
                                        <ArrowRight size={16} />
                                    </Link>

                                    <Link
                                        href="/"
                                        className="apple-button-outline flex items-center justify-center gap-2"
                                    >
                                        <ArrowLeft size={16} />
                                        <span>Return to Dashboard</span>
                                    </Link>
                                </div>
                            </div>
                        </section>
                    </>
                )}
            </div>
        </DashboardShell>
    );
}
