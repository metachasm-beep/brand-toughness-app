'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Globe, Loader2, Play, Activity, BarChart3, LayoutGrid, History, Settings, HelpCircle, Shield, Command, Lock, EyeOff, Check, Copy, Share, FileDown, CheckCircle, Users, Zap, Layers, Monitor, Gauge, ShieldCheck, Search
} from 'lucide-react';
import MetricCard from '@/components/MetricCard';
import LoadingBar from '@/components/LoadingBar';
import DiagnosticOrbit from '@/components/DiagnosticOrbit';
import NeuralCanvas from '@/components/NeuralCanvas';
import CountUp from './react-bits/CountUp';
import SpotlightCard from './react-bits/SpotlightCard';
import DecryptedText from './react-bits/DecryptedText';
import StarBorder from './react-bits/StarBorder';
import LiquidFrame from './LiquidFrame';

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
            <LiquidFrame
                className="relative w-full max-w-md rounded-[40px] p-12 overflow-visible"
                showShimmer={true}
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
                    <StarBorder thickness={2} speed="3s" color="#FF3D57" className="w-full">
                        <button
                            onClick={handlePay}
                            className="w-full bg-transparent py-4 text-lg font-bold rounded-2xl flex items-center justify-center gap-3"
                        >
                            <Lock size={20} /> <DecryptedText text="Authorize & Download" animateOn="hover" />
                        </button>
                    </StarBorder>
                    <button
                        onClick={onClose}
                        className="w-full text-white/30 text-sm font-semibold mt-2 hover:text-white transition-colors cursor-pointer"
                    >
                        Cancel Protocol
                    </button>
                </div>
            </LiquidFrame>
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
    const [activeView, setActiveView] = useState<'LOGIC' | 'VISUAL'>('LOGIC');
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

            const errorText = await response.text();

            if (!response.ok) {
                if (response.status === 504) throw new Error('Render Gateway Timeout: The deep audit took longer than 30s. Please try again.');
                let errorData;
                try {
                    errorData = JSON.parse(errorText);
                } catch (e) {
                    throw new Error(`Technical Failure (${response.status}). The server returned an invalid response.`);
                }
                throw new Error(errorData.error || 'Audit failed');
            }

            const data = JSON.parse(errorText);
            setResult(data);
            if (typeof window !== 'undefined') {
                localStorage.setItem('brandos_active_audit', JSON.stringify(data));
            }
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
        if (!result?.uid) return;

        try {
            const res = await fetch('/api/pdf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ uid: result.uid }),
            });

            if (!res.ok) throw new Error('PDF generation failed');

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `BrandOS_Strategy_${result.uid}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
        } catch (err) {
            console.error('Download error:', err);
            alert('Failed to generate PDF. Strategy module under heavy load.');
        }
    };

    const scoreValues = result?.scores ? [
        result.scores.clarity ?? 0,
        result.scores.consistency ?? 0,
        result.scores.differentiation ?? 0,
        result.scores.emotionalImpact ?? 0,
        result.scores.marketResonance ?? 0,
        result.scores.ctaStrength ?? 0,
    ] : [8.8, 7.2, 9.4, 6.5, 8.1, 8.9];

    const aggregateScore = result ? result.aggregate : '8.4';
    const ai = result?.brandIntelligence;

    return (
        <div className="space-y-16 max-w-[1400px] mx-auto pt-10 pb-24 relative z-10">
            {/* ── Background Neural Overlay ────────────────────────────────────── */}
            <div className="fixed inset-0 neural-grid opacity-20 pointer-events-none -z-10" />

            <section className="flex flex-col lg:flex-row justify-between items-end gap-10 page-transition">
                <div className="flex-1 space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="px-3 py-1 rounded-full bg-[#00D1FF]/10 border border-[#00D1FF]/20 flex items-center gap-2 pr-4">
                            <img src="/branding/brand-icon.png" alt="" className="w-5 h-5 object-contain opacity-70" />
                            <span className="surgical-label !text-[#00D1FF] !opacity-100 !tracking-[0.2em]">TELEMETRY ACTIVE · L3 AUTHORIZED</span>
                        </div>
                    </div>
                    <h1 className="text-7xl xl:text-8xl font-black font-display tracking-tighter text-white leading-[0.85] text-gradient-pro">
                        BRAND STRATEGY<br /><span className="text-[#FF3D57] neon-text-purple">COMMAND.</span>
                    </h1>
                    <p className="text-xl text-white/40 font-medium max-w-xl leading-relaxed">
                        Strategic brand intelligence for communication systems. Initialize clarity audits to analyze messaging alignment and market positioning.
                    </p>
                </div>

                <div className="w-full lg:w-auto flex flex-col items-end gap-6">
                    <div className="max-w-4xl mx-auto space-y-12 relative z-10 px-6">
                        <LiquidFrame className="p-8 rounded-[40px]" showShimmer={!result}>
                            <div className="space-y-6">
                                <div className="flex flex-col md:flex-row items-center gap-6">
                                    <div className="flex-1 relative w-full">
                                        <Globe className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" size={20} />
                                        <input
                                            type="text"
                                            placeholder="Enter Corporate Domain (e.g. apple.com)"
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 py-5 outline-none focus:border-[#FF3D57]/40 text-sm font-medium transition-all text-white"
                                            value={url}
                                            onChange={(e) => setUrl(e.target.value)}
                                        />
                                    </div>
                                    <button
                                        onClick={handleAudit}
                                        disabled={loading}
                                        className="w-full md:w-auto bg-[#FF3D57] hover:bg-[#FF3D57]/90 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-neon active:scale-95"
                                    >
                                        {loading ? <Loader2 className="animate-spin" size={20} /> : <Play size={18} fill="currentColor" />}
                                        Initiate Audit
                                    </button>
                                </div>
                            </div>
                        </LiquidFrame>
                    </div>

                    <AnimatePresence>
                        {generating && (
                            <motion.div className="w-full" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                                <LoadingBar progress={progress} message="Synchronizing Neural Shards…" />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {error && <p className="text-[#FF3D57] text-xs font-black uppercase tracking-[0.3em] bg-[#FF3D57]/10 px-4 py-2 rounded-lg border border-[#FF3D57]/20">{error}</p>}
                </div>
            </section>

            {/* v3.0 Neural Navigator Navigation */}
            {result && (
                <div className="flex justify-center mb-[-20px]">
                    <div className="flex bg-white/5 p-1.5 rounded-3xl border border-white/10 shadow-pro-inner backdrop-blur-3xl relative z-20">
                        <button 
                            onClick={() => setActiveView('LOGIC')}
                            className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.25em] transition-all duration-500 flex items-center gap-3 ${
                                activeView === 'LOGIC' 
                                ? 'bg-[#FF3D57] text-white shadow-neon-glow' 
                                : 'text-white/30 hover:text-white/60'
                            }`}
                        >
                            <BarChart3 size={14} /> Telemetry
                        </button>
                        <button 
                            onClick={() => setActiveView('VISUAL')}
                            className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.25em] transition-all duration-500 flex items-center gap-3 ${
                                activeView === 'VISUAL' 
                                ? 'bg-[#FF3D57] text-white shadow-neon-glow' 
                                : 'text-white/30 hover:text-white/60'
                            }`}
                        >
                            <Layers size={14} /> Neural Canvas
                        </button>
                    </div>
                </div>
            )}

            <AnimatePresence mode="wait">
                {activeView === 'VISUAL' && result ? (
                    <motion.div
                        key="visual-view"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="px-6"
                    >
                        <NeuralCanvas 
                            solutions={result.remediationSolutions || []} 
                            scores={result.scores}
                            aggregate={Number(result.aggregate) * 10}
                        />
                    </motion.div>
                ) : (
                    <motion.div
                        key="logic-view"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-16"
                    >
                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                            <div className="xl:col-span-2 apple-card overflow-hidden !bg-white/[0.02] border-white/5 relative flex flex-col items-center justify-center min-h-[650px] group">
                                <div className="absolute inset-0 bg-gradient-to-br from-[#00D1FF]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                <DiagnosticOrbit scores={scoreValues} overallScore={aggregateScore} />
                                <div className="absolute bottom-12 flex gap-6">
                                    <button onClick={handleDownloadPDF} disabled={!result} className="apple-button-outline !px-10 flex items-center gap-3 disabled:opacity-30 group/btn !bg-white/5 border-white/5 hover:border-white/10">
                                        {pdfUnlocked ? <><CheckCircle size={18} className="text-[#00E28A]" /><span>DOWNLOAD ANALYSIS</span></> : <><Lock size={18} className="text-white/30 group-hover/btn:text-white" /><span>ACQUIRE DEEP REPORT</span></>}
                                    </button>
                                    <button className="apple-button-outline !px-10 flex items-center gap-3 bg-white/5 border-white/5 hover:border-white/10">
                                        <Share size={18} /><span>COMMAND SHARE</span>
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-8 h-full flex flex-col">
                                <MetricCard title="Brand Clarity" value={result ? (result.scores?.clarity ?? 0).toFixed(1) : '8.8'} trend="+4.2%" trendDirection="up" status="optimal" icon={Activity} />
                                <MetricCard title="Tone Consistency" value={result ? (result.scores?.consistency ?? 0).toFixed(1) : '7.2'} trend="+1.5%" trendDirection="up" status="stable" icon={Users} />
                                <MetricCard title="Market Differentiation" value={result ? (result.scores?.differentiation ?? 0).toFixed(1) : '9.4'} trend="+0.8%" trendDirection="up" status="optimal" icon={Shield} />
                                <MetricCard title="Emotional Impact" value={result ? (result.scores?.emotionalImpact ?? 0).toFixed(1) : '6.5'} trend="-2.1%" trendDirection="down" status="critical" icon={Zap} />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {ai && (
                    <motion.section className="apple-card p-12 space-y-16 border-white/5" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="flex items-center justify-between border-b border-white/5 pb-10">
                            <div className="flex items-center gap-5">
                                <div className="p-4 bg-gradient-to-br from-[#FF3D57] to-[#E31B23] rounded-[24px] shadow-neon">
                                    <Activity size={28} className="text-black" />
                                </div>
                                <div>
                                    <h3 className="text-4xl font-black font-display tracking-tighter text-white">
                                        <DecryptedText text="STRATEGIC PLAYBOOK" animateOn="view" revealDirection="center" />
                                    </h3>
                                    <p className="surgical-label mt-1.5 !text-[#FF3D57] !opacity-100">LLM BRAND ARCHITECTURE READY</p>
                                </div>
                            </div>
                            <div className="px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black tracking-[0.3em] text-white/40">
                                STRATEGIC CONFIDENCE: <span className="text-white">{ai.confidence || 72}%</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
                            <div className="space-y-6">
                                <h4 className="surgical-label">Brand Positioning</h4>
                                <p className="text-white/50 text-base leading-relaxed font-medium">{ai.positioning || 'Calculating strategic coordinates...'}</p>
                            </div>
                            <div className="space-y-6">
                                <h4 className="surgical-label">Tone of Voice</h4>
                                <p className="text-white/50 text-base leading-relaxed font-medium">{ai.toneOfVoice || 'Analyzing linguistic patterns...'}</p>
                            </div>
                            <div className="space-y-6">
                                <h4 className="surgical-label">Target Resonance</h4>
                                <p className="text-white/50 text-base leading-relaxed font-medium">{ai.audience || 'Scanning resonance frequency...'}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 border-t border-white/5 pt-12">
                            <div className="space-y-6">
                                <h4 className="surgical-label text-[#FF3D57]">Friction Points</h4>
                                <ul className="space-y-3">
                                    {[...(ai.trustGaps || []), ...(ai.conversionGaps || [])].slice(0, 6).map((item: string, i: number) => (
                                        <li key={i} className="flex gap-4 text-sm text-white/60 font-medium">
                                            <span className="text-[#FF3D57] font-black mt-0.5">•</span> {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="space-y-6">
                                <h4 className="surgical-label text-[#FF3D57]">Core Corrections</h4>
                                <ul className="space-y-3">
                                    {(ai.priorityFixes || []).slice(0, 6).map((item: string, i: number) => (
                                        <li key={i} className="flex gap-4 text-sm text-white/60 font-medium">
                                            <span className="text-[#FF3D57] font-black mt-0.5">•</span> {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="space-y-6">
                                <h4 className="surgical-label text-[#00E28A]">Velocity Wins</h4>
                                <ul className="space-y-3">
                                    {(ai.quickWins || []).slice(0, 6).map((item: string, i: number) => (
                                        <li key={i} className="flex gap-4 text-sm text-white/60 font-medium">
                                            <span className="text-[#00E28A] font-black mt-0.5">•</span> {item}
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
                    <motion.section className="apple-card p-12 space-y-12 border-white/5" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="flex justify-between items-end border-b border-white/5 pb-10">
                            <div>
                                <h3 className="text-5xl font-black font-display tracking-tighter uppercase leading-none text-white">Brand Telemetry</h3>
                                <p className="surgical-label mt-3 !text-white/20">Messaging Node Persistence · BrandOS v2.0</p>
                            </div>
                            <div className="flex items-center gap-4 bg-[#FF3D57]/5 px-6 py-3 rounded-2xl border border-[#FF3D57]/20 shadow-inner">
                                <div className="w-2.5 h-2.5 rounded-full bg-[#FF3D57] animate-pulse shadow-[0_0_12px_#FF3D57]" />
                                <span className="text-[11px] font-black uppercase tracking-[0.3em] text-[#FF3D57]">Autonomous Intelligence v2.0</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
                            <div className="space-y-12">
                                <h5 className="surgical-label !text-white/20">Neural Pillars</h5>
                                <div className="grid grid-cols-2 gap-6">
                                    {[
                                        { l: 'CORE PROMISE', v: result.scores?.clarity ?? 0 },
                                        { l: 'TONE CONSISTENCY', v: result.scores?.consistency ?? 0 },
                                        { l: 'MESSAGING PILLARS', v: result.scores?.differentiation ?? 0 },
                                        { l: 'AUDIENCE RESONANCE', v: result.scores?.emotionalImpact ?? 0 },
                                        { l: 'TAGLINE STRENGTH', v: result.scores?.marketResonance ?? 0 },
                                        { l: 'CTA CLARITY', v: result.scores?.ctaStrength ?? 0 },
                                    ].map((n: { l: string, v: number }, i: number) => (
                                        <SpotlightCard key={i} className="bg-white/[0.04] border border-white/5 p-7 rounded-[24px] hover:border-white/10 transition-all backdrop-blur-none spotlight-red">
                                            <div className="surgical-label text-[9px] mb-2">{n.l}</div>
                                            <div className="text-3xl font-black font-display text-white">
                                                <CountUp value={Number(n.v.toFixed(1))} fontSize={30} gap={1} />
                                            </div>
                                            <div className="w-full h-1.5 bg-white/5 rounded-full mt-5 overflow-hidden">
                                                <motion.div
                                                    className="h-full bg-gradient-to-r from-[#FF3D57] to-[#E31B23]"
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${n.v * 10}%` }}
                                                    transition={{ duration: 1.5, delay: i * 0.1, ease: 'easeOut' as any }}
                                                />
                                            </div>
                                        </SpotlightCard>
                                    ))}
                                </div>
                            </div>

                            {/* Technical Telemetry */}
                            <div className="space-y-12">
                                <h5 className="surgical-label !text-white/20">Technical Core Vitals</h5>
                                <div className="grid grid-cols-2 gap-6">
                                    {[
                                        { l: 'PERFORMANCE', v: result.pageSpeed?.performance ?? 0, icon: Gauge, color: '#00D1FF' },
                                        { l: 'ACCESSIBILITY', v: result.pageSpeed?.accessibility ?? 0, icon: Users, color: '#00E28A' },
                                        { l: 'BEST PRACTICES', v: result.pageSpeed?.bestPractices ?? 0, icon: ShieldCheck, color: '#FFD600' },
                                        { l: 'SEO OPTIMIZATION', v: result.pageSpeed?.seo ?? 0, icon: Search, color: '#FF3D57' },
                                    ].map((n: any, i: number) => (
                                        <SpotlightCard key={i} className="bg-white/[0.04] border border-white/5 p-7 rounded-[24px] hover:border-white/10 transition-all backdrop-blur-none spotlight-red">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="surgical-label text-[9px]">{n.l}</div>
                                                <n.icon size={14} className="text-white/20" />
                                            </div>
                                            <div className="text-3xl font-black font-display text-white">
                                                <CountUp value={n.v} fontSize={30} gap={1} />
                                            </div>
                                            <div className="w-full h-1.5 bg-white/5 rounded-full mt-5 overflow-hidden">
                                                <motion.div
                                                    className="h-full"
                                                    style={{ backgroundColor: n.color }}
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${n.v}%` }}
                                                    transition={{ duration: 1.5, delay: i * 0.1, ease: 'easeOut' as any }}
                                                />
                                            </div>
                                        </SpotlightCard>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="relative space-y-8 pt-12 border-t border-white/5">
                            <h5 className="surgical-label !text-white/20">Telemetry Shards</h5>
                                <div className={`space-y-3 transition-all duration-1000 ${!pdfUnlocked ? 'blur-xl select-none pointer-events-none opacity-20' : ''}`}>
                                    {result.findings ? result.findings.map((f: any) => (
                                        <SpotlightCard key={f.code} className="flex justify-between items-center py-5 border-b border-white/[0.03] group transition-all hover:bg-white/[0.02] px-4 rounded-lg bg-transparent border-none">
                                            <div className="flex flex-col">
                                                <span className="text-white/90 font-black text-base tracking-tight">{f.title}</span>
                                                <div className="flex items-center gap-3 mt-2">
                                                    <span className="surgical-label text-[9px] tracking-[0.2em] !text-white/40">{f.category}</span>
                                                    <div className="w-1 h-1 rounded-full bg-white/10" />
                                                    <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${f.severity === 'CRITICAL' ? 'text-[#FF3D57]' : 'text-[#00D1FF]'}`}>
                                                        {f.severity}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <span className="text-white/80 font-black text-xs">{f.impact}</span>
                                                <span className="surgical-label text-[8px] tracking-[0.2em] !text-white/20">Effect Range</span>
                                            </div>
                                        </SpotlightCard>
                                    )) : (
                                        <div className="text-white/20 font-bold italic py-10">Telemetry feed unavailable.</div>
                                    )}
                                </div>

                                {!pdfUnlocked && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-8 z-20">
                                        <div className="w-20 h-20 bg-[#0B0F14]/80 rounded-[32px] flex items-center justify-center border border-white/10 shadow-pro backdrop-blur-xl animate-float">
                                            <EyeOff size={32} className="text-[#00D1FF]/40" />
                                        </div>
                                        <div className="text-center space-y-2">
                                            <p className="text-white font-black uppercase text-xl tracking-tighter">TELEMETRY LOCKED</p>
                                            <p className="text-white/30 text-sm font-medium max-w-[280px] mx-auto leading-relaxed">System requires L3 Diagnostic clearance to unlock mission-critical findings.</p>
                                        </div>
                                        <StarBorder thickness={2} speed="3s" color="#FF3D57" className="hover:scale-105 transition-transform">
                                            <button onClick={() => setShowPaywall(true)} className="bg-transparent text-white px-12 py-5 flex items-center gap-3 font-black uppercase text-xs tracking-widest">
                                                <Lock size={18} /> <DecryptedText text="INITIALIZE CLEARANCE" animateOn="hover" />
                                            </button>
                                        </StarBorder>
                                    </div>
                                )}
                            </div>

                        {/* v3.0: Generative Remediation Solutions */}
                        {(result as any).remediationSolutions?.length > 0 && (
                            <div className="mt-16 pt-16 border-t border-white/5 pb-20">
                                <div className="flex items-center justify-between mb-10">
                                    <div>
                                        <h3 className="text-3xl font-black font-display tracking-tight text-white uppercase">Neural Solutions</h3>
                                        <p className="surgical-label mt-2 !text-[#FF3D57]">Generative Remediation Terminal · v3.0 Next Frontier</p>
                                    </div>
                                    <div className="bg-[#FF3D57]/5 px-5 py-2.5 rounded-2xl border border-[#FF3D57]/20 flex items-center gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#FF3D57] animate-pulse shadow-[0_0_8px_#FF3D57]" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-[#FF3D57]">Authority Healer: Active</span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    {(result as any).remediationSolutions.map((solution: any, idx: number) => (
                                        <div key={idx} className="p-10 rounded-[32px] apple-glass border-white/5 relative overflow-hidden group hover:border-[#FF3D57]/30 transition-all duration-700">
                                            <div className="absolute top-0 right-0 p-8">
                                                <button 
                                                    onClick={() => {
                                                        const textToCopy = solution.codeSnippet || solution.solution;
                                                        navigator.clipboard.writeText(textToCopy);
                                                        // Fallback alert for immediate feedback in this proto
                                                        alert(`[BrandOS v3.0] ${solution.type} Fix Copied to Clipboard`);
                                                    }}
                                                    className="w-10 h-10 rounded-full bg-white/5 hover:bg-[#FF3D57] flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-neon"
                                                >
                                                    <Command size={16} className="text-white" />
                                                </button>
                                            </div>

                                            <div className="flex items-center gap-5 mb-8">
                                                <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${
                                                    solution.type === 'COPY' ? 'bg-[#FF3D57]/20 text-[#FF3D57]' : 
                                                    solution.type === 'CSS' ? 'bg-[#00D1FF]/20 text-[#00D1FF]' : 'bg-white/10 text-white/40'
                                                }`}>
                                                    {solution.type} REMEDIATION
                                                </span>
                                                <span className="surgical-label !text-white/10 tracking-[0.2em]">{solution.impact} IMPACT</span>
                                            </div>

                                            <h4 className="text-xl font-black text-white mb-4 tracking-tight leading-tight">{solution.problem}</h4>
                                            
                                            <div className="p-6 rounded-2xl bg-[#0B0F14]/60 border border-white/5 mb-6 group-hover:border-[#FF3D57]/10 transition-colors">
                                                <p className="text-white/60 text-sm font-medium leading-relaxed italic">"{solution.solution}"</p>
                                            </div>

                                            {solution.rationale && (
                                                <div className="mb-6 px-2">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-[#FF3D57]/60 mb-2">Strategic Intent</p>
                                                    <p className="text-white/30 text-xs font-medium leading-relaxed">{solution.rationale}</p>
                                                </div>
                                            )}

                                            {solution.codeSnippet && (
                                                <div className="p-5 rounded-xl bg-black/40 border border-white/5 font-mono text-[11px] text-[#00D1FF]/80 overflow-x-auto relative group-hover:bg-black/60 transition-all">
                                                    <div className="absolute top-2 right-4 text-[9px] text-white/10 font-bold uppercase tracking-widest">
                                                        {solution.type === 'CSS' ? 'TAILWIND_UTILITIES' : 'SOURCE_RESOURCES'}
                                                    </div>
                                                    <code>{solution.codeSnippet}</code>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.section>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showPaywall && <PaywallModal onClose={() => setShowPaywall(false)} />}
            </AnimatePresence>
        </div>
    );
}
