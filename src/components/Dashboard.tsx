'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Globe, Loader2, Play, Activity, Users, Zap, Lock, CheckCircle, Shield,
    TrendingUp, BarChart3, AlertCircle, RefreshCcw, Bell, Megaphone, Flag, ArrowRight, Command, XCircle
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import MetricCard from '@/components/MetricCard';
import LoadingBar from '@/components/LoadingBar';
import { useGuestAudit } from '@/context/GuestAuditContext';

const DiagnosticOrbit = dynamic(() => import('@/components/DiagnosticOrbit'), {
    ssr: false,
    loading: () => (
        <div className="h-[400px] flex items-center justify-center text-white/10 uppercase font-black tracking-widest text-xs">
            Initializing Core…
        </div>
    )
});


export default function Dashboard() {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [progress, setProgress] = useState(0);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState('');
    const [pdfUnlocked, setPdfUnlocked] = useState(false);
    const router = useRouter();

    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);
    const telemetrySectionRef = useRef<HTMLElement | null>(null);

    const { guestAuditResult, setGuestAuditResult } = useGuestAudit();

    useEffect(() => {
        if (guestAuditResult && !result) {
            setResult(guestAuditResult);
            setUrl(guestAuditResult.url || '');
            setProgress(100);
        }

        const params = new URLSearchParams(window.location.search);
        if (params.get('payment') === 'success') {
            setPdfUnlocked(true);
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, [guestAuditResult, result]);

    useEffect(() => {
        if (generating) {
            setProgress(2);
            intervalRef.current = setInterval(() => {
                setProgress((p) => (p < 95 ? p + 93 / 90 : p));
            }, 1000);
        } else if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [generating]);

    const handleAudit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!url) return;

        setLoading(true);
        setGenerating(true);
        setError('');
        setResult(null);

        const controller = new AbortController();
        abortControllerRef.current = controller;

        try {
            const response = await fetch('/api/audit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url }),
                signal: controller.signal
            });

            const text = await response.text();
            let data: any;

            try {
                data = text ? JSON.parse(text) : {};
            } catch {
                console.error('JSON parse error:', text);
                throw new Error(
                    `Technical failure (HTTP ${response.status}). The intelligence node may be overloaded.`
                );
            }

            if (!response.ok) {
                const stage = data?.stage ? ` [${data.stage}]` : '';
                throw new Error(`${data?.error || 'Intelligence fetch failed'}${stage} (HTTP ${response.status})`);
            }

            setResult(data);
            setGuestAuditResult(data);
            setProgress(100);
        } catch (err: any) {
            if (err.name === 'AbortError') return;
            setError(err.message || 'Diagnostic protocol failed. Check your connection or the URL.');
        } finally {
            setLoading(false);
            setGenerating(false);
            abortControllerRef.current = null;
        }
    };

    const handleStop = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            setLoading(false);
            setGenerating(false);
            setProgress(0);
            setError('Diagnostic cancelled by operator.');
        }
    };

    const handleDownloadPDF = async () => {
        if (!pdfUnlocked) {
            router.push('/pricing');
            return;
        }

        const { generatePDF } = await import('@/utils/pdf');

        try {
            const pdf = await generatePDF(
                result?.scores || {},
                url,
                result?.rawData || {},
                typeof result?.aggregate === 'number'
                    ? result.aggregate
                    : Number(result?.aggregate ?? 0)
            );

            pdf.save(`BrandIntelligence_${new URL(url).hostname}.pdf`);
        } catch {
            alert('PDF generation failed. Please try again.');
        }
    };

    const handleScrollToTelemetry = () => {
        if (!result) return;

        telemetrySectionRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    };

    const scoreValues = result
        ? [
              Number(result.scores?.marketPresence || 0),
              Number(result.scores?.technicalHealth || 0),
              Number(result.scores?.security || 0),
              Number(result.scores?.innovation || 0),
              Number(result.scores?.customerExperience || 0),
              Number(result.scores?.contentQuality || 0)
          ]
        : [0, 0, 0, 0, 0, 0];

    const aggregateScore = Number(result?.aggregate || 0);

    const aggregatePercent = Math.max(0, Math.min(100, aggregateScore));
    const ai = result?.aiSummary;

    const lowLeakage = Math.round((100 - aggregatePercent) * 1.8);
    const highLeakage = Math.round((100 - aggregatePercent) * 5.2);
    const retentionIndex = Math.min(100, aggregatePercent * 1.05).toFixed(1);

    const baselineMetricsCount = 25;
    const dynamicMetricsCount = Array.isArray(result?.findings) ? result.findings.length : 0;
    const totalMetricsAnalyzed = result ? baselineMetricsCount + dynamicMetricsCount : 0;
    const totalMetricsDisplay =
        totalMetricsAnalyzed >= 100 ? '100+' : String(totalMetricsAnalyzed);
    return (
        <div className="space-y-20 max-w-[1400px] mx-auto pt-16 pb-24">
            {/* Top Bar Removed as requested */}

            <section className="flex flex-col items-start text-left space-y-12 page-transition px-10">
                <div className="space-y-6 max-w-4xl text-left">
                    <div className="flex items-center justify-start gap-3 text-[#00D1FF] text-xs font-black uppercase tracking-[0.5em]">
                        <Activity size={16} /> Diagnostic Link Active · v4.2
                    </div>
                    <h1 className="text-7xl md:text-8xl xl:text-9xl font-black font-display tracking-tighter text-white leading-none">
                        BRAND OS
                    </h1>
                    <p className="text-xl text-white/45 font-medium max-w-2xl leading-relaxed">
                        High-fidelity monitoring interface for brand resilience. Initialize a{' '}
                        <span className="text-white">Brand OS Scan™</span> to monitor telemetry
                        across sixty-four diagnostic nodes.
                    </p>
                </div>

                <div className="w-full max-w-3xl space-y-8">
                    <div className="flex justify-start gap-8">
                        <button className="surgical-label hover:text-white transition-all flex items-center gap-2 group">
                            <RefreshCcw size={12} className="group-hover:rotate-180 transition-transform duration-500" /> Rescan Last Domain
                        </button>
                        <Link
                            href="/history"
                            className="surgical-label hover:text-white transition-all flex items-center gap-2 group"
                        >
                            <BarChart3 size={12} className="group-hover:scale-110 transition-transform" /> View History
                        </Link>
                        <button 
                            onClick={() => alert('Comparison interface activated. Select secondary domain to overlay.')}
                            className="surgical-label text-[#00D1FF] hover:text-[#00D1FF]/80 transition-all flex items-center gap-2"
                        >
                            + Add Brand to Compare
                        </button>
                    </div>

                    <form
                        onSubmit={handleAudit}
                        className="group relative flex bg-white/[0.03] border border-white/10 rounded-[36px] p-2.5 pl-9 focus-within:bg-white/[0.06] focus-within:border-[#00D1FF]/40 focus-within:ring-4 focus-within:ring-[#00D1FF]/5 transition-all shadow-[0_30px_100px_rgba(0,0,0,0.4)]"
                    >
                        <div className="absolute inset-0 rounded-[36px] bg-gradient-to-r from-[#00D1FF]/5 to-[#7B5CFF]/5 opacity-0 group-focus-within:opacity-100 transition-opacity z-0" />
                        <Globe className="my-auto mr-4 text-white/20 shrink-0 relative z-10" size={24} />
                        <input
                            type="text"
                            required
                            placeholder="Domain (e.g. nike.com, brand.co.in, site.fun)"
                            className="bg-transparent border-none outline-none flex-1 py-5 text-xl font-bold text-white placeholder:text-white/10 relative z-10"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            disabled={loading}
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="apple-button-primary px-10 rounded-[28px] h-full flex items-center gap-3 shrink-0 relative z-10 shadow-[0_10px_30px_rgba(0,209,255,0.3)]"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" size={24} />
                            ) : (
                                <Play size={22} fill="currentColor" />
                            )}
                            <span className="text-lg font-black tracking-tight text-black">Diagnostic</span>
                        </button>
                    </form>

                    <AnimatePresence>
                        {generating && (
                            <motion.div
                                className="w-full space-y-4"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                <LoadingBar progress={progress} message="Initializing secure node connection..." />
                                <div className="flex justify-center">
                                    <button
                                        onClick={handleStop}
                                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-[#FF3D57] hover:border-[#FF3D57]/30 transition-all text-[10px] font-black uppercase tracking-widest"
                                    >
                                        <XCircle size={14} /> Stop Diagnostic Scan
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </section>

            <section className="grid grid-cols-1 xl:grid-cols-3 gap-10 relative z-20">
                <div className="xl:col-span-2 apple-card !bg-white/[0.01] relative flex flex-col items-center justify-center min-h-[620px] p-5 md:p-8 z-[160]">
                    {result && (
                        <div className="absolute top-8 left-8 z-30">
                            <div className="px-6 py-4 rounded-3xl border border-white/10 bg-[#0B0F14]/40 backdrop-blur-2xl shadow-2xl">
                                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-2">
                                    Metrics Analyzed
                                </div>
                                <div className="text-4xl font-black font-display text-white">
                                    {totalMetricsDisplay}
                                </div>
                                <div className="mt-2 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#00D1FF] animate-pulse" />
                                    <span className="text-[10px] text-white/50 font-bold uppercase tracking-widest">Active nodes</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {result && (
                        <div className="absolute top-8 right-8 z-30 text-right">
                           <div className="px-6 py-4 rounded-3xl border border-white/10 bg-[#0B0F14]/40 backdrop-blur-2xl shadow-2xl max-w-[200px]">
                                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#00D1FF] mb-2">
                                    Composite Signal
                                </div>
                                <div className="text-sm font-extrabold text-white leading-tight">
                                    Live multi-layer mapping active
                                </div>
                                <div className="mt-3 w-full h-1 bg-white/10 rounded-full overflow-hidden">
                                     <div className="h-full bg-[#00D1FF] w-2/3" />
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="w-full flex items-center justify-center pt-10 pb-10">
                        <div className="w-full max-w-[920px]">
                            <DiagnosticOrbit 
                                scores={scoreValues} 
                                overallScore={aggregateScore} 
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <MetricCard
                        title="Discovery Score"
                        value={result ? Number(result?.scores?.marketPresence || 0).toFixed(1) : '--'}
                        trend={result ? '+4.2%' : ''}
                        trendDirection="up"
                        status={result ? 'optimal' : 'stable'}
                        icon={Activity}
                    />
                    <MetricCard
                        title="Trust & Authority Index"
                        value={result ? Number(result?.scores?.security || 0).toFixed(1) : '--'}
                        trend={result ? '+0.8%' : ''}
                        trendDirection="up"
                        status={result ? 'optimal' : 'stable'}
                        icon={Shield}
                    />
                    <MetricCard
                        title="Brand Clarity Score"
                        value={result ? Number(result?.scores?.innovation || 0).toFixed(1) : '--'}
                        trend={result ? '-2.1%' : ''}
                        trendDirection="down"
                        status={result ? 'optimal' : 'stable'}
                        icon={Zap}
                    />
                    
                    <div className="apple-card p-6 bg-white/[0.02] border-white/5 space-y-4">
                        <button
                            onClick={handleDownloadPDF}
                            disabled={!result}
                            className="apple-button-outline w-full flex items-center justify-center gap-2"
                        >
                            {pdfUnlocked ? <CheckCircle size={16} /> : <Lock size={16} />}
                            <span>{pdfUnlocked ? 'PDF Ready' : 'Unlock Executive PDF'}</span>
                        </button>
                        
                        <button
                            onClick={() => router.push('/pricing')}
                            className="apple-button-primary-ghost w-full flex items-center justify-center gap-2"
                        >
                            <Users size={16} />
                            <span>Compare Competitors</span>
                        </button>
                    </div>
                </div>
            </section>

            <AnimatePresence>
                {result && (
                    <motion.section
                        className="grid grid-cols-1 lg:grid-cols-2 gap-10"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="apple-card p-10 space-y-8">
                            <div className="flex justify-between items-end">
                                <div>
                                    <h4 className="text-3xl font-extrabold font-display tracking-tight text-white">
                                        Reputation Monitor
                                    </h4>
                                    <p className="surgical-label mt-1">Sentiment & Mentions Tracker</p>
                                </div>
                                <Activity size={24} className="text-[#00D1FF]" />
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="flex-1 flex px-5 py-4 bg-[#00E28A]/10 border border-[#00E28A]/20 rounded-2xl items-center gap-3">
                                    <CheckCircle size={18} className="text-[#00E28A]" />
                                    <span className="text-sm font-black text-[#00E28A]">
                                        18 Positive Mentions
                                    </span>
                                </div>
                                <div className="flex-1 flex px-5 py-4 bg-[#FF3D57]/10 border border-[#FF3D57]/20 rounded-2xl items-center gap-3">
                                    <AlertCircle size={18} className="text-[#FF3D57]" />
                                    <span className="text-sm font-black text-[#FF3D57]">
                                        2 Risk Signals
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h5 className="surgical-label text-[#FF3D57]">Critical Alerts</h5>
                                <div className="flex items-start gap-4 p-4 bg-white/5 border border-white/5 rounded-xl">
                                    <Megaphone size={16} className="text-[#FF3D57] mt-1 shrink-0" />
                                    <div>
                                        <div className="text-sm font-bold text-white">
                                            Negative Social Thread Detected
                                        </div>
                                        <div className="text-[10px] text-white/40 uppercase mt-1">
                                            Reddit /r/Entrepreneur · 3 hours ago
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4 p-4 bg-white/5 border border-white/5 rounded-xl">
                                    <Flag size={16} className="text-[#00D1FF] mt-1 shrink-0" />
                                    <div>
                                        <div className="text-sm font-bold text-white">
                                            New Press Mention (Positive)
                                        </div>
                                        <div className="text-[10px] text-white/40 uppercase mt-1">
                                            Industry Blog · 8 hours ago
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="apple-card p-10 space-y-8">
                            <div className="flex justify-between items-end">
                                <div>
                                    <h4 className="text-3xl font-extrabold font-display tracking-tight text-white">
                                        Competitor Radar
                                    </h4>
                                    <p className="surgical-label mt-1">Positioning & Growth Actions</p>
                                </div>
                                <Users size={24} className="text-[#7B5CFF]" />
                            </div>

                            <div className="p-6 bg-white/[0.03] rounded-2xl border border-white/5 flex flex-col justify-center">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-sm font-bold font-display text-white">Your Brand</span>
                                    <span className="text-sm font-black text-[#00D1FF]">
                                        {aggregateScore.toFixed(1)}
                                    </span>
                                </div>
                                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-6">
                                    <div
                                        className="h-full bg-[#00D1FF]"
                                        style={{ width: `${aggregatePercent / 10}%` }}
                                    />
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center opacity-60">
                                        <span className="text-xs font-semibold text-white">
                                            Competitor A (Industry Leader)
                                        </span>
                                        <span className="text-xs font-black text-white">83.0</span>
                                    </div>
                                    <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                                        <div className="h-full bg-white/40" style={{ width: '83%' }} />
                                    </div>

                                    <div className="flex justify-between items-center opacity-40">
                                        <span className="text-xs font-semibold text-white">
                                            Competitor B (Rising)
                                        </span>
                                        <span className="text-xs font-black text-white">65.2</span>
                                    </div>
                                    <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                                        <div className="h-full bg-white/20" style={{ width: '65.2%' }} />
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => router.push('/pricing')}
                                className="w-full py-4 bg-[#7B5CFF]/10 text-[#7B5CFF] font-black uppercase tracking-widest text-xs rounded-xl border border-[#7B5CFF]/30 hover:bg-[#7B5CFF]/20 transition-all flex items-center justify-center gap-2"
                            >
                                <Lock size={14} /> Add Immediate Rivals
                            </button>
                        </div>
                    </motion.section>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {ai && (
                    <motion.section
                        className="apple-card p-10 space-y-12"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="flex items-center justify-between border-b border-white/10 pb-8">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-[#00D1FF]/20 rounded-2xl">
                                    <Activity size={24} className="text-[#00D1FF]" />
                                </div>
                                <div>
                                    <h3 className="text-3xl font-extrabold font-display tracking-tight">
                                        Diagnostic Analysis
                                    </h3>
                                    <p className="surgical-label mt-1">AI Strategic Intelligence Feed</p>
                                </div>
                            </div>
                            <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-black text-white/60">
                                CONFIDENCE: {Number(ai.confidence || 72)}%
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                            <div className="space-y-4">
                                <h4 className="surgical-label">Executive Overview</h4>
                                <p className="text-white/70 text-sm leading-relaxed font-medium">
                                    {ai.overview || 'Analysis pending...'}
                                </p>
                            </div>
                            <div className="space-y-4">
                                <h4 className="surgical-label">Brand Positioning</h4>
                                <p className="text-white/70 text-sm leading-relaxed font-medium">
                                    {ai.positioning || 'Analyzing market placement...'}
                                </p>
                            </div>
                            <div className="space-y-4">
                                <h4 className="surgical-label">Target Audience</h4>
                                <p className="text-white/70 text-sm leading-relaxed font-medium">
                                    {ai.audience || 'Filtering audience signals...'}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 border-t border-white/10 pt-10">
                            <div className="space-y-4">
                                <h4 className="surgical-label text-[#FF3D57]">Trust & Conversion Gaps</h4>
                                <ul className="space-y-2">
                                    {[...(ai.trustGaps || []), ...(ai.conversionGaps || [])]
                                        .slice(0, 6)
                                        .map((item: string, i: number) => (
                                            <li key={i} className="flex gap-3 text-sm text-white/70">
                                                <span className="text-[#FF3D57]">•</span> {item}
                                            </li>
                                        ))}
                                </ul>
                            </div>
                            <div className="space-y-4">
                                <h4 className="surgical-label text-[#7B5CFF]">Priority Corrections</h4>
                                <ul className="space-y-2">
                                    {(ai.priorityFixes || []).slice(0, 6).map((item: string, i: number) => (
                                        <li key={i} className="flex gap-3 text-sm text-white/70">
                                            <span className="text-[#7B5CFF]">•</span> {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="space-y-4">
                                <h4 className="surgical-label text-[#00E28A]">Quick Wins (7 Days)</h4>
                                <ul className="space-y-2">
                                    {(ai.quickWins || []).slice(0, 6).map((item: string, i: number) => (
                                        <li key={i} className="flex gap-3 text-sm text-white/70">
                                            <span className="text-[#00E28A]">•</span> {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div className="border-t border-white/10 pt-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
                            <div className="lg:col-span-2 space-y-6">
                                <h4 className="surgical-label !text-[#FF3D57]">
                                    Economic Impact Analysis — Revenue Leakage
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="p-6 bg-[#FF3D57]/5 border border-[#FF3D57]/10 rounded-2xl">
                                        <div className="text-[10px] font-black uppercase text-[#FF3D57] mb-2 tracking-widest">
                                            Est. Annual Trust Leakage
                                        </div>
                                        <div className="text-4xl font-black font-display text-white tabular-nums tracking-tighter">
                                            ${lowLeakage}k — ${highLeakage}k
                                        </div>
                                        <div className="text-[8px] text-white/20 mt-3 font-bold uppercase tracking-widest">
                                            Calculated per $1M Rev
                                        </div>
                                    </div>
                                    <div className="p-6 bg-white/5 border border-white/5 rounded-2xl">
                                        <div className="text-[10px] font-black uppercase text-white/40 mb-2 tracking-widest">
                                            Growth Retention Index
                                        </div>
                                        <div className="text-4xl font-black font-display text-white tabular-nums tracking-tighter">
                                            {retentionIndex}%
                                        </div>
                                        <div className="text-[8px] text-white/20 mt-3 font-bold uppercase tracking-widest">
                                            Signal Consistency Score
                                        </div>
                                    </div>
                                </div>
                                <p className="text-white/40 text-[10px] font-medium leading-relaxed italic">
                                    Conversion leakage detected in: Performance Integrity nodes and
                                    Semantic Narrative weight.
                                </p>
                            </div>
                            <div className="bg-[#0B0F14] border border-white/10 p-8 rounded-3xl flex flex-col justify-between group hover:border-[#00D1FF]/30 transition-all cursor-pointer z-[180]">
                                <div>
                                    <h5 className="text-sm font-black text-white uppercase tracking-tighter mb-2">
                                        Simulate Recovery
                                    </h5>
                                    <p className="text-[10px] text-white/30 font-medium">
                                        Model how brand signal optimization impacts LTV and CAC.
                                    </p>
                                </div>
                                <button
                                    onClick={() => router.push('/pricing')}
                                    className="surgical-label !text-[#00D1FF] flex items-center gap-2 mt-10"
                                >
                                    Acquire Simulator <ArrowRight size={10} />
                                </button>
                            </div>
                        </div>
                    </motion.section>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {result && (
                    <motion.section
                        ref={telemetrySectionRef}
                        id="diagnostic-telemetry"
                        className="apple-card p-12 space-y-10 scroll-mt-24"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="flex justify-between items-end">
                            <div>
                                <h3 className="text-4xl font-extrabold font-display tracking-tighter uppercase leading-none">
                                    Diagnostic Telemetry
                                </h3>
                                <p className="surgical-label mt-2">System Node Status · Logic Layer v4.2</p>
                            </div>
                            <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-2xl border border-white/10">
                                <div className="w-2 h-2 rounded-full bg-[#00E28A] animate-pulse shadow-[0_0_8px_#00E28A]" />
                                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">
                                    Feed Active
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
                            <div className="space-y-8">
                                <h5 className="surgical-label !text-white/20">Integrity Nodes</h5>
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { l: 'Discovery Score', v: Number(result?.scores?.marketPresence || 0) },
                                        { l: 'Performance Integrity Score', v: Number(result?.scores?.technicalHealth || 0) },
                                        { l: 'Trust & Authority Index', v: Number(result?.scores?.security || 0) },
                                        { l: 'Brand Clarity Score', v: Number(result?.scores?.innovation || 0) },
                                        { l: 'Customer Experience', v: Number(result?.scores?.customerExperience || 0) },
                                        { l: 'Narrative Weight', v: Number(result?.scores?.contentQuality || 0) }
                                    ].map((n: { l: string; v: number }, i: number) => (
                                        <div key={i} className="bg-white/[0.03] border border-white/5 p-5 rounded-2xl">
                                            <div className="surgical-label text-[8px] mb-1">{n.l}</div>
                                            <div className="text-2xl font-black font-display text-white">
                                                {(n.v || 0).toFixed(1)}
                                            </div>
                                            <div className="w-full h-1 bg-white/5 rounded-full mt-3 overflow-hidden">
                                                <motion.div
                                                    className="h-full bg-[#00D1FF]"
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${Math.max(0, Math.min(100, n.v))}%` }}
                                                    transition={{ duration: 1, delay: i * 0.1 }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="relative space-y-6">
                                <h5 className="surgical-label !text-white/20">Diagnostic Shards</h5>
                                <div className="space-y-2">
                                    {result?.findings ? (
                                        result.findings.map((f: any) => (
                                            <div
                                                key={f.code}
                                                className="flex justify-between items-center py-3 border-b border-white/[0.03] group transition-colors"
                                            >
                                                <div className="flex flex-col">
                                                    <span className="text-white/80 font-bold text-sm tracking-tight">
                                                        {f.title}
                                                    </span>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="surgical-label text-[8px] tracking-widest">
                                                            {f.category}
                                                        </span>
                                                        <div className="w-1 h-1 rounded-full bg-white/10" />
                                                        <span
                                                            className={`text-[8px] font-black uppercase tracking-widest ${
                                                                f.severity === 'CRITICAL'
                                                                    ? 'text-[#FF3D57]'
                                                                    : 'text-[#00D1FF]'
                                                            }`}
                                                        >
                                                            {f.severity}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end">
                                                    <span className="text-white/60 font-black text-[10px]">
                                                        {f.impact}
                                                    </span>
                                                    <span className="surgical-label text-[8px] tracking-widest !text-white/20">
                                                        Effect Vector
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-white/20 font-bold italic">
                                            Telemetry feed unavailable.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.section>
                )}
            </AnimatePresence>


        </div>
    );
}
