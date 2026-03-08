'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import {
    Activity, Shield, Zap, Globe, ArrowRight, CheckCircle,
    TrendingUp, BarChart3, Lock, Users, MousePointer2, AlertCircle, RefreshCcw, Search, FileDown,
    Loader2
} from 'lucide-react';
import { useGuestAudit } from '@/context/GuestAuditContext';
import LoadingBar from '@/components/LoadingBar';

export default function LandingPage() {
    const { setGuestAuditResult } = useGuestAudit();
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [progress, setProgress] = useState(0);

    const login = () => signIn('google', { callbackUrl: '/' });

    const handleAudit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!url) return;
        setLoading(true);
        setError('');
        setProgress(5);

        const interval = setInterval(() => {
            setProgress(prev => prev < 90 ? prev + (90 / 60) : prev);
        }, 500);

        try {
            const response = await fetch('/api/audit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url }),
            });

            let data;
            const text = await response.text();
            
            try {
                data = text ? JSON.parse(text) : {};
            } catch (e) {
                console.error("JSON parse error:", text);
                throw new Error(`Server returned invalid data (HTTP ${response.status})`);
            }

            if (!response.ok) {
                throw new Error(data.error || `Diagnostic failed (HTTP ${response.status})`);
            }
            
            clearInterval(interval);
            setProgress(100);
            
            // Artificial delay for "Intelligence Computation" feel
            setTimeout(() => {
                setGuestAuditResult(data);
            }, 800);
        } catch (err: any) {
            clearInterval(interval);
            setError(err.message || 'The diagnostic node timed out. Please try again.');
            setLoading(false);
        }
    };

    const handleDeploy = (price: string) => {
        window.location.href = `https://merchants.phonepe.com/pay/brandos?amount=${price}&currency=USD`;
    };

    return (
        <div className="bg-[#0B0F14] min-h-screen selection:bg-[#00D1FF] selection:text-black">
            {/* ── Navbar ────────────────────────────────────────────────────────── */}
            <nav className="fixed top-0 w-full z-[100] border-b border-white/5 bg-[#0B0F14]/80 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-10 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#00D1FF] rounded-lg flex items-center justify-center font-black text-black">OS</div>
                        <span className="font-display font-bold tracking-tighter text-xl">BRANDOS</span>
                    </div>
                    <div className="flex items-center gap-8">
                        <a href="#signals" className="surgical-label hover:text-white transition-colors">Signals</a>
                        <a href="#comparison" className="surgical-label hover:text-white transition-colors">OS Comparison</a>
                        <a href="#pricing" className="surgical-label hover:text-white transition-colors">Acquisition</a>
                        <Link href="/faq" className="surgical-label hover:text-white transition-colors flex items-center gap-2">
                            FAQ <div className="w-1.5 h-1.5 rounded-full bg-[#00D1FF] animate-pulse" />
                        </Link>
                        <button onClick={login} className="apple-button-outline !px-6 !py-2 text-[10px] font-black uppercase tracking-widest hover:bg-[#00D1FF] hover:text-black transition-all">
                            Sign In
                        </button>
                    </div>
                </div>
            </nav>

            {/* ── Hero Section ──────────────────────────────────────────────────── */}
            <section className="relative pt-48 pb-20 px-10 overflow-hidden hero-grid">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="relative z-10 space-y-10"
                    >
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-[#00D1FF] animate-pulse" />
                            <span className="surgical-label !text-[#00D1FF]">Brand Intelligence Operating System</span>
                        </div>
                        <h1 className="text-7xl xl:text-8xl font-black font-display tracking-tighter leading-[0.85] text-white">
                            YOUR BRAND IS BEING <span className="text-gradient-blue">JUDGED IN 3 SECONDS.</span>
                        </h1>
                        <p className="text-xl text-white/40 font-medium max-w-xl leading-relaxed">
                            BrandOS™ measures what they see. We analyze performance, security, narrative clarity, and search authority to compute your <span className="text-[#00D1FF]">Brand Toughness Score™</span>.
                        </p>

                        <div className="pt-4 max-w-lg">
                            <form onSubmit={handleAudit} className="relative group">
                                <div className="absolute inset-x-0 -bottom-2 bg-[#00D1FF]/20 blur-xl h-10 opacity-0 group-focus-within:opacity-100 transition-all" />
                                <div className="relative flex flex-col sm:flex-row gap-4 p-2 bg-white/5 border border-white/10 rounded-[24px] focus-within:border-[#00D1FF]/40 transition-all backdrop-blur-3xl">
                                    <input
                                        type="text"
                                        placeholder="ENTER BRAND DOMAIN (E.G. NIKE.COM)"
                                        value={url}
                                        onChange={(e) => setUrl(e.target.value)}
                                        className="flex-1 bg-transparent px-6 py-4 outline-none text-[10px] font-black tracking-widest uppercase placeholder:text-white/20 text-white"
                                        disabled={loading}
                                    />
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="apple-button-primary !py-4 !px-8 flex items-center justify-center gap-3"
                                    >
                                        {loading ? <Loader2 className="animate-spin" size={18} /> : <Activity size={18} />}
                                        <span className="whitespace-nowrap">START SCAN</span>
                                    </button>
                                </div>
                            </form>
                            
                            {loading && (
                                <div className="mt-6 px-2">
                                    <LoadingBar progress={progress} message="Initializing Diagnostic Orbit..." />
                                </div>
                            )}

                            {error && (
                                <div className="mt-4 flex items-center gap-2 text-[#FF3D57] px-4 py-2 bg-[#FF3D57]/10 border border-[#FF3D57]/20 rounded-xl">
                                    <AlertCircle size={14} />
                                    <span className="text-[10px] font-bold uppercase tracking-tight">{error}</span>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-5 pt-4">
                            <button
                                onClick={login}
                                className="apple-button-primary flex items-center justify-center gap-3 border-[#00D1FF] bg-[#00D1FF] text-black"
                            >
                                Get Your Brand Score <ArrowRight size={20} />
                            </button>
                            <button onClick={login} className="apple-button-outline inline-flex items-center justify-center">
                                View Sample Report
                            </button>
                        </div>
                        <p className="surgical-label text-white/20 uppercase">TRUSTED BY MODERN BRAND TEAMS & FOUNDERS</p>
                    </motion.div>

                    {/* Floating Dashboard Mockup */}
                    <div className="relative hidden lg:block">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, rotateY: 15 }}
                            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                            transition={{ duration: 1.2, ease: "easeOut" }}
                            className="apple-card p-1 glow-blue rounded-[40px]"
                        >
                            <div className="bg-[#0B0F14] rounded-[38px] overflow-hidden border border-white/10 aspect-[4/3] p-10 space-y-8 relative">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-[#00D1FF]/5 blur-[100px]" />

                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <div className="surgical-label text-[#00D1FF]">Integrity Index</div>
                                        <h4 className="text-5xl font-black font-display tracking-tighter">74.2</h4>
                                    </div>
                                    <div className="px-4 py-2 bg-[#00D1FF]/10 rounded-full border border-[#00D1FF]/20 text-[10px] font-black text-[#00D1FF]">
                                        BRAND TOUGHNESS™
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { l: 'Performance', v: 82, c: '#00D1FF' },
                                        { l: 'Security', v: 91, c: '#7B5CFF' },
                                        { l: 'SEO Signals', v: 76, c: '#00E28A' },
                                        { l: 'Messaging', v: 64, c: '#FF3D57' },
                                    ].map((s, i) => (
                                        <div key={i} className="bg-white/5 border border-white/5 p-6 rounded-2xl flex flex-col justify-between h-28">
                                            <div className="surgical-label text-[8px] opacity-40">{s.l}</div>
                                            <div className="flex justify-between items-end">
                                                <span className="text-2xl font-black font-display">{s.v}</span>
                                                <div className="w-12 h-1 bg-white/10 rounded-full overflow-hidden">
                                                    <div className="h-full" style={{ width: `${s.v}%`, backgroundColor: s.c }} />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="p-6 bg-[#00D1FF]/5 rounded-2xl border border-[#00D1FF]/10">
                                    <div className="flex gap-4 items-center">
                                        <TrendingUp size={20} className="text-[#00D1FF]" />
                                        <div>
                                            <div className="text-xs font-bold text-[#00D1FF]">Strategic Growth Pathway</div>
                                            <div className="text-[10px] text-white/40 mt-1">Optimize messaging clarity to unlock +12% trust factor.</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ── Pain Section ─────────────────────────────────────────────────── */}
            <section className="py-40 px-10 relative">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">
                    <div className="space-y-8">
                        <div className="surgical-label !text-[#FF3D57]">The Invisible Leak</div>
                        <h2 className="text-5xl font-black font-display tracking-tight leading-tight">
                            MOST BRANDS THINK<br />THEY’RE DOING FINE.
                        </h2>
                        <p className="text-lg text-white/40 font-medium">
                            But in the digital age, trust is constructed before it is earned. BrandOS measures the architecture of that trust.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 gap-6">
                        {[
                            { t: 'Latent Load Times', d: 'Slow performance quietly kills conversion before you even know it.', i: Activity },
                            { t: 'Messaging Friction', d: 'Inconsistent copy confuses buyers and dilutes your authority.', i: Zap },
                            { t: 'Security Gaps', d: 'Missing technical headers signal amateurism to enterprise clients.', i: Shield },
                            { t: 'Discovery Decay', d: 'Weak SEO signals bury your brand under high-noise competitors.', i: Search },
                        ].map((p, i) => (
                            <div key={i} className="flex gap-6 p-6 rounded-3xl bg-white/[0.02] border border-white/5 border-l-2 border-l-[#FF3D57]">
                                <p.i size={24} className="text-[#FF3D57] shrink-0" />
                                <div>
                                    <div className="font-bold text-white mb-1">{p.t}</div>
                                    <div className="text-sm text-white/30 font-medium">{p.d}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Revenue Leakage Section ────────────────────────────────────────── */}
            <section className="py-20 px-10 relative overflow-hidden bg-[#FF3D57]/[0.02]">
                <div className="max-w-7xl mx-auto border border-[#FF3D57]/10 rounded-[40px] p-12 lg:p-20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#FF3D57]/5 blur-[120px] -z-10" />
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="space-y-8">
                            <div className="surgical-label !text-[#FF3D57]">Economic Impact Analysis</div>
                            <h2 className="text-5xl font-black font-display tracking-tight leading-none uppercase">
                                Revenue Leakage<br />Detection.
                            </h2>
                            <p className="text-lg text-white/40 font-medium leading-relaxed">
                                Weak brands don't just lose trust; they lose money. Our simulator estimates the annual revenue lost to invisible conversion friction and trust gaps.
                            </p>
                            <div className="flex gap-4">
                                <div className="p-6 bg-white/5 border border-white/5 rounded-2xl flex-1">
                                    <div className="text-[10px] font-black uppercase text-[#FF3D57] mb-2">Estimated Leakage</div>
                                    <div className="text-3xl font-black font-display text-white">$12k — $85k</div>
                                    <div className="text-[8px] text-white/20 mt-2 font-bold uppercase">Per $1M Revenue</div>
                                </div>
                                <div className="p-6 bg-white/5 border border-white/5 rounded-2xl flex-1">
                                    <div className="text-[10px] font-black uppercase text-[#00D1FF] mb-2">Recovery Potential</div>
                                    <div className="text-3xl font-black font-display text-white">18.4%</div>
                                    <div className="text-[8px] text-white/20 mt-2 font-bold uppercase">Optimized Growth</div>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-6">
                            {[
                                { t: 'High Bounce Risk', d: 'Poor performance integrity quietly kills conversion before you even know it.', v: '-$14k' },
                                { t: 'Trust Leakage', d: 'Inconsistent brand signals confuse buyers and dilute your authority.', v: '-$24k' },
                                { t: 'Conversion Friction', d: 'Technical friction and unclear CTAs reduce lead quality by 22%.', v: '-$18k' },
                                { t: 'Search Visibility Risk', d: 'Missing discovery signals bury you under noisier, lower-quality rivals.', v: '-$42k' },
                            ].map((item, i) => (
                                <div key={i} className="flex justify-between items-center p-6 bg-[#0B0F14] border border-white/5 rounded-2xl group hover:border-[#FF3D57]/30 transition-all">
                                    <div className="flex gap-4">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#FF3D57] mt-1.5 shrink-0" />
                                        <div>
                                            <div className="text-sm font-bold text-white mb-1 uppercase tracking-tight">{item.t}</div>
                                            <div className="text-[10px] text-white/30 font-medium max-w-[250px] leading-relaxed">{item.d}</div>
                                        </div>
                                    </div>
                                    <div className="text-xl font-black font-display text-[#FF3D57] tabular-nums">{item.v}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Signals Section ─────────────────────────────────────────────── */}
            <section id="signals" className="py-32 px-10 relative bg-white/[0.01]">
                <div className="max-w-7xl mx-auto space-y-20">
                    <div className="text-center space-y-4">
                        <h2 className="surgical-label text-[#00E28A]">Telemetric Foundation</h2>
                        <h3 className="text-5xl font-black font-display tracking-tight uppercase">Brand Signals We Measure</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            { t: 'Performance Integrity Score', d: 'LCP, CLS, and TBT metrics monitored for technical stability.', i: Activity, c: '#00D1FF' },
                            { t: 'Trust & Authority Index', d: 'Security headers, SSL integrity, and trust-signal saturation.', i: Shield, c: '#7B5CFF' },
                            { t: 'Brand Clarity Score', d: 'AI-powered narrative analysis for value-prop resonance.', i: Zap, c: '#FF3D57' },
                            { t: 'Discovery Score', d: 'Semantic weight, backlink integrity, and keyword cluster strength.', i: Globe, c: '#00E28A' },
                            { t: 'Technical Hygiene', d: 'Robots.txt, Sitemap logic, and overall crawler accessibility.', i: FileDown, c: '#00D1FF' },
                            { t: 'Market Position Index', d: 'Competitive benchmark analysis across 150 diagnostic nodes.', i: BarChart3, c: '#7B5CFF' },
                        ].map((p, i) => (
                            <motion.div
                                key={i}
                                whileHover={{ y: -5 }}
                                className="apple-card p-10 group border-white/5 hover:border-white/10"
                            >
                                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-10 group-hover:bg-white/10 transition-colors">
                                    <p.i size={24} style={{ color: p.c }} />
                                </div>
                                <h4 className="text-xl font-bold tracking-tight text-white mb-4">{p.t}</h4>
                                <p className="text-white/30 text-sm font-medium leading-relaxed mb-6">{p.d}</p>
                                <button className="text-[10px] font-black uppercase tracking-widest text-[#00D1FF] flex items-center gap-2 group/btn">
                                    Read Methodology <ArrowRight size={10} className="group-hover/btn:translate-x-1 transition-transform" />
                                </button>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Tracking Section ────────────────────────────────────────────── */}
            <section className="py-40 px-10 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
                <div className="max-w-7xl mx-auto flex flex-col items-center text-center space-y-12 relative z-10">
                    <div className="surgical-label">Continuous Intelligence</div>
                    <h2 className="text-6xl font-black font-display tracking-tighter uppercase leading-none">
                        YOUR BRAND CHANGES.<br />WE TRACK IT.
                    </h2>
                    <p className="max-w-2xl text-lg text-white/40 font-medium">
                        Brands aren't static. BrandOS monitors your digital signal continuously, alerting you to trust drops, performance degradation, and competitive shifts.
                    </p>
                    <div className="flex gap-10 pt-10">
                        {[
                            { l: 'Weekly Monitoring', i: RefreshCcw },
                            { l: 'Drift Alerts', i: AlertCircle },
                            { l: 'Trend Reports', i: BarChart3 }
                        ].map((f, i) => (
                            <div key={i} className="flex flex-col items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                                    <f.i size={24} className="text-[#00D1FF]" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-white/60">{f.l}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Segment Section ─────────────────────────────────────────────── */}
            <section className="py-32 px-10 border-t border-white/5">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
                    {[
                        { t: 'For Founders', d: 'Know if your website builds investor & customer trust.', l: 'Understand Your Signal' },
                        { t: 'For Agencies', d: 'Deliver white-labeled intelligence reports to your clients.', l: 'Acquire Intelligence' },
                        { t: 'For Marketing Teams', d: 'Monitor brand health and campaign integrity over time.', l: 'Deploy Monitoring' },
                    ].map((s, i) => (
                        <div key={i} className="apple-card p-10 flex flex-col space-y-6">
                            <h4 className="text-2xl font-black font-display tracking-tight text-[#00D1FF]">{s.t}</h4>
                            <p className="text-white/40 font-medium text-sm flex-1">{s.d}</p>
                            <button className="text-[10px] font-black uppercase tracking-widest text-[#00D1FF] flex items-center gap-2 group">
                                {s.l} <ArrowRight size={10} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Comparison Section ──────────────────────────────────────────── */}
            <section id="comparison" className="py-40 px-10 relative bg-[#00D1FF]/[0.02]">
                <div className="max-w-5xl mx-auto space-y-20">
                    <div className="text-center space-y-4">
                        <h2 className="surgical-label">Category Design</h2>
                        <h3 className="text-4xl font-black font-display tracking-tight uppercase">Traditional SEO vs BrandOS</h3>
                    </div>

                    <div className="apple-glass rounded-3xl overflow-hidden shadow-2xl">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/10 bg-white/5">
                                    <th className="p-8 surgical-label">Dimension</th>
                                    <th className="p-8 surgical-label text-white/30">Lighthouse / SEO Tools</th>
                                    <th className="p-8 surgical-label !text-[#00D1FF]">BrandOS Intelligence</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {[
                                    { d: 'Primary Focus', s: 'Technical Metrics', b: 'Brand Intelligence' },
                                    { d: 'Core Value', s: 'Page Speed / Serp Rank', b: 'Trust + Integrity + Clarity' },
                                    { d: 'Scanning Model', s: 'One-time Audits', b: 'Continuous Monitoring' },
                                    { d: 'Analysis Type', s: 'Search Crawler Focused', b: 'Human Connection & Trust Focused' },
                                    { d: 'Strategy Engine', s: 'Keyword Checklists', b: 'AI-Powered Narrative Scan' },
                                ].map((row, i) => (
                                    <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="p-8 text-sm font-bold text-white/60">{row.d}</td>
                                        <td className="p-8 text-sm text-white/30 font-medium italic">{row.s}</td>
                                        <td className="p-8 text-sm text-white font-bold">{row.b}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* ── Pricing ──────────────────────────────────────────────────────── */}
            <section id="pricing" className="py-32 px-10">
                <div className="max-w-7xl mx-auto space-y-24">
                    <div className="text-center space-y-4">
                        <h2 className="surgical-label">Strategic Acquisition</h2>
                        <h3 className="text-5xl font-black font-display tracking-tight uppercase">Acquire Dominance</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { n: 'Starter', p: '29', d: '3 Domains · Monthly Scan', f: ['Unlimited Scans', 'PDF Reports', 'Basic AI Fixes'] },
                            { n: 'Growth', p: '79', d: '10 Domains · Weekly Scan', f: ['Score Timeline', 'Competitor Intel', 'Priority AI'] },
                            { n: 'Agency', p: '199', d: '50 Domains · Daily Scan', f: ['White-label Reports', 'Client Portal', 'API Access'], highlight: true },
                            { n: 'Enterprise', p: '499', d: 'Unlimited Scaling', f: ['Dedicated Support', 'Custom Dashboard', 'API Automation'] },
                        ].map((plan, i) => (
                            <div
                                key={i}
                                className={`apple-card p-10 flex flex-col border-[#00D1FF]/10 hover:border-[#00D1FF]/30 transition-all ${plan.highlight ? 'glow-blue' : ''}`}
                            >
                                <div className="surgical-label mb-2">{plan.n}</div>
                                <div className="flex items-end gap-1 mb-8">
                                    <span className="text-4xl font-black font-display text-white">${plan.p}</span>
                                    <span className="text-white/20 text-xs font-black uppercase mb-1">/ mo</span>
                                </div>
                                <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-12">{plan.d}</p>
                                <ul className="flex-1 space-y-6 mb-12">
                                    {plan.f.map((feat, fi) => (
                                        <li key={fi} className="flex gap-4 text-sm text-white/50 font-medium">
                                            <CheckCircle size={14} className="text-[#00D1FF] shrink-0" /> {feat}
                                        </li>
                                    ))}
                                </ul>
                                <button
                                    onClick={() => handleDeploy(plan.p)}
                                    className="w-full py-5 rounded-2xl font-black uppercase tracking-widest bg-[#00D1FF] text-black hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(0,209,255,0.2)]"
                                >
                                    Deploy OS
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="text-center">
                        <p className="text-white/20 text-sm font-medium">No credit card required to initial scan. Cancel protocol anytime.</p>
                    </div>
                </div>
            </section>

            {/* ── Final Footer ─────────────────────────────────────────────────── */}
            <footer className="py-20 px-10 border-t border-white/5">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center font-black text-[#00D1FF]">OS</div>
                        <span className="font-display font-bold tracking-tighter text-2xl uppercase">Brand Intelligence</span>
                    </div>
                    <p className="surgical-label">© 2026 BRANDOS. System status: NOMINAL.</p>
                    <div className="flex gap-6">
                        <button className="surgical-label hover:text-white transition-colors">Terminal</button>
                        <Link href="/faq" className="surgical-label hover:text-white transition-colors">Documentation</Link>
                        <button className="surgical-label hover:text-white transition-colors">Security</button>
                    </div>
                </div>
            </footer>
        </div>
    );
}
