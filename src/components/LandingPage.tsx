'use client';

import { motion } from 'framer-motion';
import { signIn } from 'next-auth/react';
import {
    Activity, Shield, Zap, Globe, ArrowRight, CheckCircle,
    TrendingUp, BarChart3, Lock, Users, MousePointer2
} from 'lucide-react';

export default function LandingPage() {
    const login = () => signIn('google');

    return (
        <div className="bg-[#0B0F14] min-h-screen selection:bg-[#00D1FF] selection:text-black">
            {/* ── Navbar ────────────────────────────────────────────────────────── */}
            <nav className="fixed top-0 w-full z-[100] border-b border-white/5 bg-[#0B0F14]/80 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-10 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#00D1FF] rounded-lg flex items-center justify-center font-black text-black">OS</div>
                        <span className="font-display font-bold tracking-tighter text-xl">BRAND OS</span>
                    </div>
                    <div className="flex items-center gap-8">
                        <a href="#features" className="surgical-label hover:text-white transition-colors">Intelligence</a>
                        <a href="#pricing" className="surgical-label hover:text-white transition-colors">Acquisition</a>
                        <button
                            onClick={login}
                            className="bg-white/5 border border-white/10 px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                        >
                            Command Auth
                        </button>
                    </div>
                </div>
            </nav>

            {/* ── Hero Section ──────────────────────────────────────────────────── */}
            <section className="relative pt-40 pb-20 px-10 overflow-hidden hero-grid">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="space-y-8"
                    >
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-[#00D1FF] animate-pulse" />
                            <span className="surgical-label !text-[#00D1FF]">Signal Status: Active</span>
                        </div>
                        <h1 className="text-7xl xl:text-8xl font-black font-display tracking-tighter leading-[0.9] text-white">
                            YOUR BRAND<br />HAS A <span className="text-[#00D1FF]">SCORE.</span>
                        </h1>
                        <p className="text-xl text-white/40 font-medium max-w-lg leading-relaxed">
                            BRAND OS analyzes your digital infrastructure in 60 seconds to reveal hidden performance leaks, trust gaps, and revenue risks.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-5 pt-4">
                            <button
                                onClick={login}
                                className="apple-button-primary flex items-center justify-center gap-3"
                            >
                                Scan My Brand Now <ArrowRight size={20} />
                            </button>
                            <button className="apple-button-outline">
                                Intelligence Preview
                            </button>
                        </div>
                        <p className="surgical-label text-white/20">Requires Google L3 Authorization</p>
                    </motion.div>

                    {/* Floating Dashboard Mockup */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, rotateY: 20 }}
                        animate={{ opacity: 1, scale: 1, rotateY: 5 }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        className="relative hidden lg:block"
                    >
                        <div className="apple-card p-4 rotate-[-2deg] glow-blue">
                            <div className="bg-[#0B0F14] rounded-2xl overflow-hidden border border-white/5 aspect-video relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-[#00D1FF]/10 to-transparent" />
                                <div className="p-8 space-y-6">
                                    <div className="flex justify-between items-end">
                                        <div className="space-y-1">
                                            <div className="surgical-label">Integrity Core</div>
                                            <div className="text-4xl font-black font-display tracking-tighter text-[#00D1FF]/40 animate-pulse">---</div>
                                        </div>
                                        <div className="w-32 h-12 flex items-end gap-1">
                                            {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
                                                <div key={i} className="flex-1 bg-[#00D1FF]/40 rounded-t-sm" style={{ height: `${h}%` }} />
                                            ))}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="h-20 bg-white/5 rounded-xl border border-white/5 p-4 flex flex-col justify-between">
                                            <div className="surgical-label text-[8px]">Latency</div>
                                            <div className="text-lg font-bold text-white/20 uppercase tracking-widest">Awaiting</div>
                                        </div>
                                        <div className="h-20 bg-white/5 rounded-xl border border-white/5 p-4 text-[#00E28A]">
                                            <div className="surgical-label text-[8px] text-[#00E28A]/40">Security</div>
                                            <div className="text-lg font-bold">Optimal</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ── Intelligence Pillars ─────────────────────────────────────────── */}
            <section id="features" className="py-32 px-10 relative">
                <div className="max-w-7xl mx-auto space-y-20">
                    <div className="text-center space-y-4">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-[#7B5CFF]">Strategic Diagnostics</h2>
                        <h3 className="text-5xl font-black font-display tracking-tight">The 4 Pillars of Brand Intelligence</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
                        {[
                            { t: 'Performance Integrity', d: 'Critical technical stability, speed, and core vitals monitoring.', i: Activity, c: '#00D1FF', s: '--' },
                            { t: 'Trust & Authority', d: 'Perceived stability through security headers and trust signals.', i: Shield, c: '#7B5CFF', s: '--' },
                            { t: 'Brand Clarity', d: 'The mathematical strength of your messaging and value prop.', i: Zap, c: '#FF3D57', s: '--' },
                            { t: 'Discovery Power', d: 'Indexability and semantic weight across the digital landscape.', i: Globe, c: '#00E28A', s: '--' },
                        ].map((p, i) => (
                            <motion.div
                                key={i}
                                whileHover={{ y: -10 }}
                                className="apple-card p-8 group cursor-crosshair border-white/5 hover:border-white/10"
                            >
                                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:bg-white/10 transition-colors">
                                    <p.i size={24} style={{ color: p.c }} />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <h4 className="text-white font-bold tracking-tight">{p.t}</h4>
                                        <span className="text-xs font-black" style={{ color: p.c }}>{p.s}%</span>
                                    </div>
                                    <p className="text-white/30 text-sm font-medium leading-relaxed">{p.d}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Revenue Impact ───────────────────────────────────────────────── */}
            <section className="py-32 px-10 bg-white/[0.02] border-y border-white/5">
                <div className="max-w-4xl mx-auto text-center space-y-12">
                    <div className="surgical-label">Economic Loss Detection</div>
                    <div className="space-y-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            whileInView={{ scale: 1, opacity: 1 }}
                            className="text-7xl md:text-8xl font-black font-display text-white"
                        >
                            $---,---
                        </motion.div>
                        <div className="text-2xl font-bold text-[#FF3D57]">Estimated Monthly Revenue Leakage</div>
                    </div>
                    <p className="text-white/30 font-medium max-w-xl mx-auto">
                        Our diagnostic core simulates conversion friction across your technical stack to reveal exactly where revenue is being lost.
                    </p>
                </div>
            </section>

            {/* ── Pricing ──────────────────────────────────────────────────────── */}
            <section id="pricing" className="py-32 px-10">
                <div className="max-w-7xl mx-auto space-y-20">
                    <div className="text-center space-y-4">
                        <h2 className="surgical-label">Monetization protocol</h2>
                        <h3 className="text-5xl font-black font-display tracking-tight">Acquire Dominance</h3>
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
                                className={`apple-card p-10 flex flex-col ${plan.highlight ? 'border-[#00D1FF]/30 glow-blue' : 'border-white/5'}`}
                            >
                                <div className="surgical-label mb-2">{plan.n}</div>
                                <div className="flex items-end gap-1 mb-6">
                                    <span className="text-4xl font-black font-display text-white">${plan.p}</span>
                                    <span className="text-white/20 text-xs font-black uppercase mb-1">/ mo</span>
                                </div>
                                <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-10">{plan.d}</p>
                                <ul className="flex-1 space-y-4 mb-10">
                                    {plan.f.map((feat, fi) => (
                                        <li key={fi} className="flex gap-3 text-sm text-white/50 font-medium">
                                            <CheckCircle size={14} className="text-[#00D1FF] shrink-0" /> {feat}
                                        </li>
                                    ))}
                                </ul>
                                <button
                                    onClick={login}
                                    className={`w-full py-4 rounded-xl font-bold transition-all ${plan.highlight ? 'bg-[#00D1FF] text-black' : 'bg-white/5 hover:bg-white/10 text-white'}`}
                                >
                                    Deploy Command
                                </button>
                            </div>
                        ))}
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
                    <p className="surgical-label">© 2026 BRAND OS diagnostic unit. All logic systems nominal.</p>
                    <div className="flex gap-6">
                        <button className="surgical-label hover:text-white transition-colors">Terminal</button>
                        <button className="surgical-label hover:text-white transition-colors">Documentation</button>
                        <button className="surgical-label hover:text-white transition-colors">Security</button>
                    </div>
                </div>
            </footer>
        </div>
    );
}
