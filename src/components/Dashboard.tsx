'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Globe, Loader2, Play, Activity, Users, Zap, Lock, Share, FileDown, EyeOff, CheckCircle, Shield,
    TrendingUp, BarChart3, AlertCircle, RefreshCcw, Bell, Megaphone, Flag
} from 'lucide-react';
import dynamic from 'next/dynamic';
import MetricCard from '@/components/MetricCard';
import LoadingBar from '@/components/LoadingBar';

const DiagnosticOrbit = dynamic(() => import('@/components/DiagnosticOrbit'), {
    ssr: false,
    loading: () => <div className="h-[400px] flex items-center justify-center text-white/10 uppercase font-black tracking-widest text-xs">Initializing Core…</div>
});

// ─── Paywall modal ───────────────────────────────────────────────────────────
function PaywallModal({ onClose }: { onClose: () => void }) {
    const [email, setEmail] = useState('');

    const handlePay = async () => {
        if (!email) return alert('Please enter your email.');
        try {
            const res = await fetch('/api/phonepe/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: 299,
                    redirectUrl: typeof window !== 'undefined' ? window.location.origin + '/?payment=success' : ''
                })
            });
            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                alert('Payment initialization failed: ' + (data.error || 'Unknown error'));
            }
        } catch (err) {
            console.error('Checkout error:', err);
            alert('An error occurred. Please try again.');
        }
    };

    return (
        <motion.div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-xl"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
            <motion.div
                className="relative w-full max-w-md apple-glass rounded-[40px] p-12"
                initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }}
            >
                <div className="text-center space-y-4 mb-10">
                    <div className="text-5xl">📊</div>
                    <h2 className="text-3xl font-extrabold tracking-tighter text-white">Unlock Deep Diagnostics</h2>
                    <p className="text-white/40 font-medium text-sm leading-relaxed">
                        Acquire full telemetry access for ₹299. Includes 100+ pillar audits,
                        AI strategic positioning, and a high-fidelity PDF report.
                    </p>
                    <div className="text-4xl font-black text-white mt-4">₹299 <span className="text-base font-normal text-white/30">/ report</span></div>
                </div>

                <div className="space-y-4">
                    <input
                        type="email"
                        placeholder="Diagnostic Destination Email"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-white/30 text-sm font-medium transition-all text-white"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <button
                        onClick={handlePay}
                        className="w-full apple-button-primary py-4 text-lg font-bold rounded-2xl flex items-center justify-center gap-3"
                    >
                        <Lock size={20} /> Authorize Payment & Download
                    </button>
                    <button
                        onClick={onClose}
                        className="w-full text-white/30 text-sm font-semibold mt-2 hover:text-white transition-colors cursor-pointer"
                    >
                        Cancel Protocol
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}

export default function Dashboard() {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [progress, setProgress] = useState(0);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState('');
    const [showPaywall, setShowPaywall] = useState(false);
    const [pdfUnlocked, setPdfUnlocked] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('payment') === 'success') {
            setPdfUnlocked(true);
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, []);

    useEffect(() => {
        if (generating) {
            setProgress(2);
            intervalRef.current = setInterval(() => {
                setProgress(p => p < 95 ? p + (93 / 90) : p);
            }, 1000);
        } else {
            if (intervalRef.current) clearInterval(intervalRef.current);
        }
        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }, [generating]);

    const handleAudit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!url) return;
        setLoading(true);
        setGenerating(true);
        setError('');
        setResult(null);
        try {
            const response = await fetch('/api/audit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Audit failed');
            setResult(data);
            setProgress(100);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
            setGenerating(false);
        }
    };

    const handleDownloadPDF = async () => {
        if (!pdfUnlocked) { setShowPaywall(true); return; }
        const { generatePDF } = await import('@/utils/pdf');
        try {
            const pdf = await generatePDF(result.scores, url, result.rawData, result.aggregate);
            pdf.save(`BrandIntelligence_${new URL(url).hostname}.pdf`);
        } catch {
            alert('PDF generation failed. Please try again.');
        }
    };

    const scoreValues = result ? [
        result.scores.marketPresence,
        result.scores.technicalHealth,
        result.scores.security,
        result.scores.innovation,
        result.scores.customerExperience,
        result.scores.contentQuality,
    ] : [0, 0, 0, 0, 0, 0];

    const aggregateScore = result ? result.aggregate : '--';
    const ai = result?.aiSummary;

    return (
        <div className="space-y-16 max-w-[1400px] mx-auto pt-10 pb-24">
            
            {/* Top Command Center Selector */}
            <div className="flex items-center justify-between border-b border-white/5 pb-6">
                <div className="flex items-center gap-4">
                    <div className="text-sm font-bold text-white/40">Active Brand:</div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors cursor-pointer">
                        <span className="font-display font-black tracking-tight text-white">Turtle Labs</span>
                        <span className="text-[10px] text-[#00D1FF] ml-2">▼</span>
                    </button>
                    <button className="text-xs text-white/30 hover:text-white transition-colors ml-2">+ Add Brand</button>
                </div>
                <div className="flex items-center gap-4">
                    <button className="relative p-2 text-white/50 hover:text-white transition-colors">
                        <Bell size={20} />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-[#FF3D57] rounded-full border border-[#0B0F14]"></span>
                    </button>
                </div>
            </div>

            <section className="flex flex-col lg:flex-row justify-between items-end gap-10 page-transition">
                <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3 text-white/40 text-sm font-bold uppercase tracking-[0.4em]">
                        <Activity size={14} className="text-[#00D1FF]" /> Diagnostic Link Active · v4.2
                    </div>
                    <h1 className="text-6xl xl:text-7xl font-extrabold font-display tracking-tighter text-white leading-[0.9]">
                        BRAND OS<br />DIAGNOSTIC
                    </h1>
                    <p className="text-lg text-white/40 font-medium max-w-xl">
                        Strategic monitoring interface for brand resilience. Initialize a <span className="text-[#00D1FF]">Brand OS Scan™</span> to monitor telemetry across diagnostic nodes.
                    </p>
                </div>

                <div className="w-full lg:w-auto flex flex-col items-end gap-5">
                    <div className="flex gap-4 mb-2">
                        <button className="surgical-label hover:text-white transition-all flex items-center gap-2">
                            <RefreshCcw size={10} /> Rescan Last Domain
                        </button>
                        <Link href="/history" className="surgical-label hover:text-white transition-all flex items-center gap-2">
                            <BarChart3 size={10} /> View History
                        </Link>
                    </div>
                    <form
                        onSubmit={handleAudit}
                        className="flex bg-white/[0.04] border border-white/10 rounded-[32px] p-2 pl-7 hover:bg-white/[0.06] focus-within:bg-white/[0.08] focus-within:border-white/20 transition-all shadow-2xl w-full lg:w-[500px]"
                    >
                        <Globe className="my-auto mr-3 text-white/30 shrink-0" size={20} />
                        <input
                            type="url" required
                            placeholder="https://console.target.io"
                            className="bg-transparent border-none outline-none flex-1 py-4 text-lg font-semibold text-white"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            disabled={loading}
                        />
                        <button
                            type="submit" disabled={loading}
                            className="apple-button-primary px-8 h-full flex items-center gap-2 shrink-0"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : <Play size={20} fill="currentColor" />}
                            <span>Diagnostic</span>
                        </button>
                    </form>

                    <AnimatePresence>
                        {generating && (
                            <motion.div className="w-full" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                                <LoadingBar progress={progress} message="Acquiring telemetric shards…" />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {error && <p className="text-red-400 text-sm font-bold uppercase tracking-widest">{error}</p>}
                </div>
            </section>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                <div className="xl:col-span-2 apple-card overflow-hidden !bg-white/[0.01] relative flex flex-col items-center justify-center min-h-[600px]">
                    <DiagnosticOrbit scores={scoreValues} overallScore={aggregateScore} />
                    <div className="absolute bottom-10 flex gap-4">
                        <button onClick={handleDownloadPDF} disabled={!result} className="apple-button-outline flex items-center gap-2 disabled:opacity-30">
                            {pdfUnlocked ? <><CheckCircle size={16} /><span>PDF Ready</span></> : <><Lock size={16} /><span>Unlock Executive PDF</span></>}
                        </button>
                        <button onClick={() => setShowPaywall(true)} className="apple-button-outline flex items-center gap-2">
                            <Users size={16} /><span>Compare Competitors</span>
                        </button>
                    </div>
                </div>

                <div className="space-y-6">
                    <MetricCard title="Market Presence" value={result ? result.scores.marketPresence.toFixed(1) : '--'} trend={result ? "+4.2%" : ""} trendDirection="up" status={result ? "optimal" : "stable"} icon={Activity} />
                    <button onClick={() => setShowPaywall(true)} className="w-full p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/5 transition-all text-left flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-[#00D1FF]/10 flex items-center justify-center">
                                <TrendingUp size={18} className="text-[#00D1FF]" />
                            </div>
                            <div>
                                <div className="text-white font-bold text-sm">View Score Timeline</div>
                                <div className="text-[10px] text-white/30 uppercase font-black">Retention Data</div>
                            </div>
                        </div>
                        <Lock size={14} className="text-white/20 group-hover:text-[#00D1FF] transition-colors" />
                    </button>
                    <MetricCard title="Technical Health" value={result ? result.scores.technicalHealth.toFixed(1) : '--'} trend={result ? "+1.5%" : ""} trendDirection="up" status={result ? "optimal" : "stable"} icon={Users} />
                    <MetricCard title="Security Profile" value={result ? result.scores.security.toFixed(1) : '--'} trend={result ? "+0.8%" : ""} trendDirection="up" status={result ? "optimal" : "stable"} icon={Shield} />
                    <MetricCard title="Innovation Rate" value={result ? result.scores.innovation.toFixed(1) : '--'} trend={result ? "-2.1%" : ""} trendDirection="down" status={result ? "optimal" : "stable"} icon={Zap} />
                </div>
            </div>

            {/* Dash.txt integration: Reputation & Competitors */}
            <AnimatePresence>
                {result && (
                    <motion.section className="grid grid-cols-1 lg:grid-cols-2 gap-10" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        {/* Reputation Monitor */}
                        <div className="apple-card p-10 space-y-8">
                            <div className="flex justify-between items-end">
                                <div>
                                    <h4 className="text-3xl font-extrabold font-display tracking-tight text-white">Reputation Monitor</h4>
                                    <p className="surgical-label mt-1">Sentiment & Mentions Tracker</p>
                                </div>
                                <Activity size={24} className="text-[#00D1FF]" />
                            </div>
                            
                            <div className="flex items-center gap-6">
                                <div className="flex-1 flex px-5 py-4 bg-[#00E28A]/10 border border-[#00E28A]/20 rounded-2xl items-center gap-3">
                                    <CheckCircle size={18} className="text-[#00E28A]" />
                                    <span className="text-sm font-black text-[#00E28A]">18 Positive Mentions</span>
                                </div>
                                <div className="flex-1 flex px-5 py-4 bg-[#FF3D57]/10 border border-[#FF3D57]/20 rounded-2xl items-center gap-3">
                                    <AlertCircle size={18} className="text-[#FF3D57]" />
                                    <span className="text-sm font-black text-[#FF3D57]">2 Risk Signals</span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h5 className="surgical-label text-[#FF3D57]">Critical Alerts</h5>
                                <div className="flex items-start gap-4 p-4 bg-white/5 border border-white/5 rounded-xl">
                                    <Megaphone size={16} className="text-[#FF3D57] mt-1 shrink-0" />
                                    <div>
                                        <div className="text-sm font-bold text-white">Negative Social Thread Detected</div>
                                        <div className="text-[10px] text-white/40 uppercase mt-1">Reddit /r/Entrepreneur · 3 hours ago</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4 p-4 bg-white/5 border border-white/5 rounded-xl">
                                    <Flag size={16} className="text-[#00D1FF] mt-1 shrink-0" />
                                    <div>
                                        <div className="text-sm font-bold text-white">New Press Mention (Positive)</div>
                                        <div className="text-[10px] text-white/40 uppercase mt-1">Industry Blog · 8 hours ago</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Competitor Radar & Growth Actions */}
                        <div className="apple-card p-10 space-y-8">
                            <div className="flex justify-between items-end">
                                <div>
                                    <h4 className="text-3xl font-extrabold font-display tracking-tight text-white">Competitor Radar</h4>
                                    <p className="surgical-label mt-1">Positioning & Growth Actions</p>
                                </div>
                                <Users size={24} className="text-[#7B5CFF]" />
                            </div>

                            <div className="p-6 bg-white/[0.03] rounded-2xl border border-white/5 flex flex-col justify-center">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-sm font-bold font-display text-white">Your Brand</span>
                                    <span className="text-sm font-black text-[#00D1FF]">{result.aggregate.toFixed(1)}</span>
                                </div>
                                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-6">
                                    <div className="h-full bg-[#00D1FF]" style={{ width: `${result.aggregate}%` }}></div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center opacity-60">
                                        <span className="text-xs font-semibold text-white">Competitor A (Industry Leader)</span>
                                        <span className="text-xs font-black text-white">83.0</span>
                                    </div>
                                    <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                                        <div className="h-full bg-white/40" style={{ width: '83%' }}></div>
                                    </div>

                                    <div className="flex justify-between items-center opacity-40">
                                        <span className="text-xs font-semibold text-white">Competitor B (Rising)</span>
                                        <span className="text-xs font-black text-white">65.2</span>
                                    </div>
                                    <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                                        <div className="h-full bg-white/20" style={{ width: '65.2%' }}></div>
                                    </div>
                                </div>
                            </div>
                            
                            <button onClick={() => setShowPaywall(true)} className="w-full py-4 bg-[#7B5CFF]/10 text-[#7B5CFF] font-black uppercase tracking-widest text-xs rounded-xl border border-[#7B5CFF]/30 hover:bg-[#7B5CFF]/20 transition-all flex items-center justify-center gap-2">
                                <Lock size={14} /> Add Immediate Rivals
                            </button>
                        </div>
                    </motion.section>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {ai && (
                    <motion.section className="apple-card p-10 space-y-12" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="flex items-center justify-between border-b border-white/10 pb-8">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-[#00D1FF]/20 rounded-2xl">
                                    <Activity size={24} className="text-[#00D1FF]" />
                                </div>
                                <div>
                                    <h3 className="text-3xl font-extrabold font-display tracking-tight">Diagnostic Analysis</h3>
                                    <p className="surgical-label mt-1">AI Strategic Intelligence Feed</p>
                                </div>
                            </div>
                            <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-black text-white/60">
                                CONFIDENCE: {ai.confidence || 72}%
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                            <div className="space-y-4">
                                <h4 className="surgical-label">Executive Overview</h4>
                                <p className="text-white/70 text-sm leading-relaxed font-medium">{ai.overview || 'Analysis pending...'}</p>
                            </div>
                            <div className="space-y-4">
                                <h4 className="surgical-label">Brand Positioning</h4>
                                <p className="text-white/70 text-sm leading-relaxed font-medium">{ai.positioning || 'Analyzing market placement...'}</p>
                            </div>
                            <div className="space-y-4">
                                <h4 className="surgical-label">Target Audience</h4>
                                <p className="text-white/70 text-sm leading-relaxed font-medium">{ai.audience || 'Filtering audience signals...'}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 border-t border-white/10 pt-10">
                            <div className="space-y-4">
                                <h4 className="surgical-label text-[#FF3D57]">Trust & Conversion Gaps</h4>
                                <ul className="space-y-2">
                                    {[...(ai.trustGaps || []), ...(ai.conversionGaps || [])].slice(0, 6).map((item: string, i: number) => (
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
                    </motion.section>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {result && (
                    <motion.section className="apple-card p-12 space-y-10" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="flex justify-between items-end">
                            <div>
                                <h3 className="text-4xl font-extrabold font-display tracking-tighter uppercase leading-none">Diagnostic Telemetry</h3>
                                <p className="surgical-label mt-2">System Node Status · Logic Layer v4.2</p>
                            </div>
                            <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-2xl border border-white/10">
                                <div className="w-2 h-2 rounded-full bg-[#00E28A] animate-pulse shadow-[0_0_8px_#00E28A]" />
                                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Feed Active</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
                            <div className="space-y-8">
                                <h5 className="surgical-label !text-white/20">Integrity Nodes</h5>
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { l: 'SEO Node', v: result.scores.marketPresence },
                                        { l: 'Network Latency', v: result.scores.technicalHealth },
                                        { l: 'Security Perimeter', v: result.scores.security },
                                        { l: 'UX Interaction', v: result.scores.innovation },
                                        { l: 'Accessibility Vector', v: result.scores.customerExperience },
                                        { l: 'Semantic Weight', v: result.scores.contentQuality },
                                    ].map((n: { l: string, v: number }, i: number) => (
                                        <div key={i} className="bg-white/[0.03] border border-white/5 p-5 rounded-2xl">
                                            <div className="surgical-label text-[8px] mb-1">{n.l}</div>
                                            <div className="text-2xl font-black font-display text-white">{n.v.toFixed(1)}</div>
                                            <div className="w-full h-1 bg-white/5 rounded-full mt-3 overflow-hidden">
                                                <motion.div
                                                    className="h-full bg-[#00D1FF]"
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${n.v * 10}%` }}
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
                                    {result.findings ? result.findings.map((f: any) => (
                                        <div key={f.code} className="flex justify-between items-center py-3 border-b border-white/[0.03] group transition-colors">
                                            <div className="flex flex-col">
                                                <span className="text-white/80 font-bold text-sm tracking-tight">{f.title}</span>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="surgical-label text-[8px] tracking-widest">{f.category}</span>
                                                    <div className="w-1 h-1 rounded-full bg-white/10" />
                                                    <span className={`text-[8px] font-black uppercase tracking-widest ${f.severity === 'CRITICAL' ? 'text-[#FF3D57]' : 'text-[#00D1FF]'}`}>
                                                        {f.severity}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <span className="text-white/60 font-black text-[10px]">{f.impact}</span>
                                                <span className="surgical-label text-[8px] tracking-widest !text-white/20">Effect Vector</span>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="text-white/20 font-bold italic">Telemetry feed unavailable.</div>
                                    )}
                                </div>

                            </div>
                        </div>
                    </motion.section>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showPaywall && <PaywallModal onClose={() => setShowPaywall(false)} />}
            </AnimatePresence>
        </div>
    );
}
