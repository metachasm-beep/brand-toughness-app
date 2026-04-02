'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Globe, Loader2, Play, Activity, Users, Zap, Lock, Share, FileDown, EyeOff, CheckCircle, Shield
} from 'lucide-react';
import MetricCard from '@/components/MetricCard';
import LoadingBar from '@/components/LoadingBar';
import DiagnosticOrbit from '@/components/DiagnosticOrbit';
import CountUp from './react-bits/CountUp';
import SpotlightCard from './react-bits/SpotlightCard';
import DecryptedText from './react-bits/DecryptedText';
import StarBorder from './react-bits/StarBorder';

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
                    <StarBorder thickness={2} speed="3s" color="#B05CFF" className="w-full">
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

    const scoreValues = result ? [
        result.scores.clarity,
        result.scores.consistency,
        result.scores.differentiation,
        result.scores.emotionalImpact,
        result.scores.marketResonance,
        result.scores.ctaStrength,
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
                        BRAND STRATEGY<br /><span className="text-[#B05CFF] neon-text-purple">COMMAND.</span>
                    </h1>
                    <p className="text-xl text-white/40 font-medium max-w-xl leading-relaxed">
                        Strategic brand intelligence for communication systems. Initialize clarity audits to analyze messaging alignment and market positioning.
                    </p>
                </div>

                <div className="w-full lg:w-auto flex flex-col items-end gap-6">
                    <form
                        onSubmit={handleAudit}
                        className="flex bg-white/[0.03] border border-white/10 rounded-[30px] p-2 pl-8 hover:bg-white/[0.05] focus-within:bg-white/[0.08] focus-within:border-[#00D1FF]/30 transition-all shadow-pro w-full lg:w-[500px] group"
                    >
                        <Globe className="my-auto mr-4 text-white/20 group-focus-within:text-[#00D1FF] transition-colors shrink-0" size={22} />
                        <input
                            type="url" required
                            placeholder="brand-identity.io"
                            className="bg-transparent border-none outline-none flex-1 py-5 text-lg font-black tracking-tight text-white placeholder:text-white/10"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            disabled={loading}
                        />
                        <button
                            type="submit" disabled={loading}
                            className="apple-button-primary px-10 h-full flex items-center gap-3 shrink-0 rounded-[24px] !bg-[#B05CFF] hover:shadow-[0_0_20px_#B05CFF55]"
                        >
                            {loading ? <Loader2 className="animate-spin" size={22} /> : <Play size={20} fill="currentColor" />}
                            <span className="text-[12px] font-black uppercase tracking-widest">Run Brand Strategy Scan</span>
                        </button>
                    </form>

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
                    <MetricCard title="Brand Clarity" value={result ? result.scores.clarity.toFixed(1) : '8.8'} trend="+4.2%" trendDirection="up" status="optimal" icon={Activity} />
                    <MetricCard title="Tone Consistency" value={result ? result.scores.consistency.toFixed(1) : '7.2'} trend="+1.5%" trendDirection="up" status="stable" icon={Users} />
                    <MetricCard title="Market Differentiation" value={result ? result.scores.differentiation.toFixed(1) : '9.4'} trend="+0.8%" trendDirection="up" status="optimal" icon={Shield} />
                    <MetricCard title="Emotional Impact" value={result ? result.scores.emotionalImpact.toFixed(1) : '6.5'} trend="-2.1%" trendDirection="down" status="critical" icon={Zap} />
                </div>
            </div>

            <AnimatePresence>
                {ai && (
                    <motion.section className="apple-card p-12 space-y-16 border-white/5" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="flex items-center justify-between border-b border-white/5 pb-10">
                            <div className="flex items-center gap-5">
                                <div className="p-4 bg-gradient-to-br from-[#00D1FF] to-[#7B5CFF] rounded-[24px] shadow-neon">
                                    <Activity size={28} className="text-black" />
                                </div>
                                <div>
                                    <h3 className="text-4xl font-black font-display tracking-tighter text-white">
                                        <DecryptedText text="STRATEGIC PLAYBOOK" animateOn="view" revealDirection="center" />
                                    </h3>
                                    <p className="surgical-label mt-1.5 !text-[#B05CFF] !opacity-100">LLM BRAND ARCHITECTURE READY</p>
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
                                <h4 className="surgical-label text-[#7B5CFF]">Core Corrections</h4>
                                <ul className="space-y-3">
                                    {(ai.priorityFixes || []).slice(0, 6).map((item: string, i: number) => (
                                        <li key={i} className="flex gap-4 text-sm text-white/60 font-medium">
                                            <span className="text-[#7B5CFF] font-black mt-0.5">•</span> {item}
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
                                <p className="surgical-label mt-3 !text-white/20">Messaging Node Persistence · BrandOS v1.0</p>
                            </div>
                            <div className="flex items-center gap-4 bg-white/5 px-6 py-3 rounded-2xl border border-white/10 shadow-inner">
                                <div className="w-2.5 h-2.5 rounded-full bg-[#B05CFF] animate-pulse shadow-[0_0_12px_#B05CFF]" />
                                <span className="text-[11px] font-black uppercase tracking-[0.3em] text-[#B05CFF]">Intelligence Stable</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
                            <div className="space-y-12">
                                <h5 className="surgical-label !text-white/20">Neural Pillars</h5>
                                <div className="grid grid-cols-2 gap-6">
                                    {[
                                        { l: 'CORE PROMISE', v: result.scores.clarity },
                                        { l: 'TONE CONSISTENCY', v: result.scores.consistency },
                                        { l: 'MESSAGING PILLARS', v: result.scores.differentiation },
                                        { l: 'AUDIENCE RESONANCE', v: result.scores.emotionalImpact },
                                        { l: 'TAGLINE STRENGTH', v: result.scores.marketResonance },
                                        { l: 'CTA CLARITY', v: result.scores.ctaStrength },
                                    ].map((n: { l: string, v: number }, i: number) => (
                                        <SpotlightCard key={i} className="bg-white/[0.04] border border-white/5 p-7 rounded-[24px] hover:border-white/10 transition-all backdrop-blur-none spotlight-purple">
                                            <div className="surgical-label text-[9px] mb-2">{n.l}</div>
                                            <div className="text-3xl font-black font-display text-white">
                                                <CountUp value={Number(n.v.toFixed(1))} fontSize={30} gap={1} />
                                            </div>
                                            <div className="w-full h-1.5 bg-white/5 rounded-full mt-5 overflow-hidden">
                                                <motion.div
                                                    className="h-full bg-gradient-to-r from-[#B05CFF] to-[#7B5CFF]"
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${n.v * 10}%` }}
                                                    transition={{ duration: 1.5, delay: i * 0.1, ease: 'easeOut' as any }}
                                                />
                                            </div>
                                        </SpotlightCard>
                                    ))}
                                </div>
                            </div>

                            <div className="relative space-y-8">
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
                                        <StarBorder thickness={2} speed="3s" color="#B05CFF" className="hover:scale-105 transition-transform">
                                            <button onClick={() => setShowPaywall(true)} className="bg-transparent text-white px-12 py-5 flex items-center gap-3 font-black uppercase text-xs tracking-widest">
                                                <Lock size={18} /> <DecryptedText text="INITIALIZE CLEARANCE" animateOn="hover" />
                                            </button>
                                        </StarBorder>
                                    </div>
                                )}
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
