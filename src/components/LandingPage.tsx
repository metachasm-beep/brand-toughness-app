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
        <div className="bg-[#0B0F14] min-h-screen selection:bg-[#00D1FF] selection:text-black overflow-x-hidden relative">
            {/* ── Background Layers ────────────────────────────────────────────────── */}
            <div className="fixed inset-0 neural-grid opacity-40 pointer-events-none" />
            <div className="fixed inset-0 glow-mesh pointer-events-none" />

            {/* ── Navbar (UX PRO MAX Floating variant) ─────────────────────────────────── */}
            <nav className="fixed top-8 left-1/2 -translate-x-1/2 w-[calc(100%-48px)] max-w-7xl z-[100] transition-all duration-300">
                <div className="apple-glass rounded-[28px] px-8 h-20 flex items-center justify-between border-white/10">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#00D1FF] to-[#7B5CFF] rounded-xl flex items-center justify-center font-black text-black text-xs shadow-[0_0_25px_rgba(0,209,255,0.4)]">OS</div>
                        <span className="font-display font-black tracking-tighter text-2xl text-white">WEB OS</span>
                    </div>
                    <div className="flex items-center gap-10">
                        <div className="hidden lg:flex items-center gap-10">
                            <a href="#intelligence" className="surgical-label hover:text-[#00D1FF] transition-all hover:tracking-[0.45em]">Intelligence</a>
                            <a href="#nodes" className="surgical-label hover:text-[#00D1FF] transition-all hover:tracking-[0.45em]">Nodes</a>
                            <a href="#pricing" className="surgical-label hover:text-[#00D1FF] transition-all hover:tracking-[0.45em]">Access</a>
                        </div>
                        <button
                            onClick={login}
                            className="bg-white text-black px-7 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:scale-[1.05] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-all active:scale-[0.95]"
                        >
                            COMMAND CENTER
                        </button>
                    </div>
                </div>
            </nav>

            {/* ── Hero Section ──────────────────────────────────────────────────── */}
            <section className="relative pt-52 pb-32 px-10">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -40 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                        className="space-y-10"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-2.5 h-2.5 rounded-full bg-[#00D1FF] shadow-[0_0_15px_#00D1FF] animate-pulse" />
                            <span className="surgical-label !text-[#00D1FF] !opacity-100">Neural Status: Synchronized</span>
                        </div>
                        <h1 className="text-8xl xl:text-9xl font-black font-display tracking-tighter leading-[0.85] text-gradient-pro">
                            YOUR BRAND<br />HAS A <span className="text-[#00D1FF] neon-text-blue">SCORE.</span>
                        </h1>
                        <p className="text-xl text-white/50 font-medium max-w-lg leading-relaxed">
                            The first Autonomous Brand Diagnostic Engine. Analyze technical health, trust authority, and market sentiment in 60 seconds.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-6 pt-6">
                            <button
                                onClick={login}
                                className="apple-button-primary flex items-center justify-center gap-3 px-10 py-5 group"
                            >
                                START DIAGNOSTIC <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button className="apple-button-outline px-10 py-5 bg-white/5 border-white/5">
                                VIEW CAPABILITIES
                            </button>
                        </div>
                        <div className="flex items-center gap-4 py-2">
                             <div className="flex -space-x-3">
                                {[1,2,3,4].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-[#0B0F14] bg-white/10" />)}
                             </div>
                             <p className="surgical-label !text-white/20">Authorized by 4,200+ Intelligence Units</p>
                        </div>
                    </motion.div>

                    {/* Floating Dashboard Mockup */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                        className="relative hidden lg:block"
                    >
                        <div className="apple-card p-2 animate-float shadow-[0_40px_100px_rgba(0,0,0,0.6)]">
                            <div className="bg-[#0B0F14]/90 rounded-[28px] overflow-hidden border border-white/5 aspect-square xl:aspect-video relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-[#00D1FF]/10 via-transparent to-[#7B5CFF]/10" />
                                <div className="p-10 space-y-8 h-full flex flex-col justify-between">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-2">
                                            <div className="surgical-label !text-white/60">INTEGRITY CORE</div>
                                            <div className="text-6xl font-black font-display text-white">84.2</div>
                                        </div>
                                        <div className="bg-[#00E28A]/10 text-[#00E28A] px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-[#00E28A]/20">STABLE</div>
                                    </div>
                                    
                                    <div className="flex-1 flex items-end gap-1.5 pb-2">
                                        {[30, 60, 40, 80, 55, 95, 70, 50, 85, 45, 90, 65].map((h, i) => (
                                            <motion.div 
                                                key={i} 
                                                initial={{ height: 0 }}
                                                animate={{ height: `${h}%` }}
                                                transition={{ duration: 1.5, delay: 0.5 + (i * 0.05) }}
                                                className="flex-1 bg-gradient-to-t from-[#00D1FF]/20 to-[#00D1FF] rounded-t-lg" 
                                            />
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="apple-glass rounded-2xl p-5 border-white/5">
                                            <div className="surgical-label !text-white/20 mb-1">LATENCY</div>
                                            <div className="text-2xl font-black text-white">142ms</div>
                                        </div>
                                        <div className="apple-glass rounded-2xl p-5 border-white/5">
                                            <div className="surgical-label !text-white/20 mb-1">SECURITY</div>
                                            <div className="text-2xl font-black text-[#00D1FF]">L3 SECURE</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Decorative Glow */}
                        <div className="absolute -top-10 -right-10 w-64 h-64 bg-[#00D1FF]/10 blur-[100px] rounded-full pointer-events-none" />
                        <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-[#7B5CFF]/10 blur-[100px] rounded-full pointer-events-none" />
                    </motion.div>
                </div>
            </section>

            {/* ── Intelligence Pillars ─────────────────────────────────────────── */}
            <section id="intelligence" className="py-40 px-10 relative">
                <div className="max-w-7xl mx-auto space-y-20">
                    <div className="flex flex-col items-center text-center space-y-6">
                        <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 surgical-label !text-white/60">SYSTEM ARCHITECTURE</div>
                        <h2 className="text-6xl font-black font-display tracking-tight text-white max-w-3xl">The 4 Pillars of Brand Vitality</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
                        {[
                            { t: 'Performance Integrity', d: 'Core Web Vitals monitoring with sub-second resolution.', i: Activity, c: '#00D1FF', s: '84' },
                            { t: 'Trust & Authority', d: 'Cryptographic validation of SSL, DNS, and secure headers.', i: Shield, c: '#7B5CFF', s: '92' },
                            { t: 'Brand Clarity', d: 'Linguistic analysis of messaging weight and intent.', i: Zap, c: '#FF3D57', s: '62' },
                            { t: 'Discovery Power', d: 'Global indexing strength and semantic search authority.', i: Globe, c: '#00E28A', s: '78' },
                        ].map((p, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                whileHover={{ y: -10, border: `1px solid ${p.c}33` }}
                                className="apple-card p-10 group cursor-crosshair relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-8 border border-white/5 group-hover:border-white/10 group-hover:bg-white/10 transition-all">
                                    <p.i size={28} style={{ color: p.c }} />
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h4 className="text-white text-lg font-black tracking-tight">{p.t}</h4>
                                        <span className="text-xs font-black" style={{ color: p.c }}>{p.s}%</span>
                                    </div>
                                    <p className="text-white/30 text-sm font-medium leading-relaxed">{p.d}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Revenue Impact (Visual Heavy) ─────────────────────────────────── */}
            <section className="py-40 px-10 relative overflow-hidden">
                <div className="absolute inset-0 bg-white/[0.02]" />
                <div className="max-w-6xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                    <div className="space-y-8">
                        <div className="surgical-label !text-[#FF3D57]">FATAL LEAKAGE DETECTED</div>
                        <h3 className="text-6xl font-black font-display tracking-tight text-white">Stop losing revenue to invisible friction.</h3>
                        <p className="text-xl text-white/40 leading-relaxed">
                            Our proprietary Diagnostic Core simulates thousands of user journeys per second to find exactly where your brand is hemorrhaging trust and conversions.
                        </p>
                    </div>
                    <div className="apple-glass rounded-[40px] p-12 text-center border-[#FF3D57]/20 shadow-[0_0_50px_rgba(255,61,87,0.1)]">
                        <motion.div
                            initial={{ scale: 0.8 }}
                            whileInView={{ scale: 1 }}
                            className="text-8xl md:text-9xl font-black font-display text-white mb-4"
                        >
                            $18K<span className="text-[#FF3D57]">+</span>
                        </motion.div>
                        <div className="text-xl font-bold text-white/60 mb-8 uppercase tracking-widest">Monthly Estimated Leakage</div>
                        <button className="apple-button-primary !bg-[#FF3D57] !text-white w-full">PATCH REVENUE LEAK</button>
                    </div>
                </div>
            </section>

            {/* ── Pricing ──────────────────────────────────────────────────────── */}
            <section id="pricing" className="py-40 px-10">
                <div className="max-w-7xl mx-auto space-y-24">
                    <div className="flex flex-col items-center text-center space-y-6">
                        <div className="surgical-label">DEPLOYMENT LOGISTICS</div>
                        <h3 className="text-6xl font-black font-display tracking-tight text-white">Select Your Access Tier</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { n: 'Access', p: '29', d: '3 DOMAINS · AD-HOC SCANS', f: ['Deep Technical Analysis', 'PDF Export Module', 'Trust Validation'] },
                            { n: 'Intelligence', p: '79', d: '10 DOMAINS · CLOUD SYNC', f: ['Historical Telemetry', 'Competitor Intelligence', 'Priority Processing'] },
                            { n: 'Command', p: '199', d: '50 DOMAINS · FULL API', f: ['White-label Branding', 'Client Access Portal', 'Raw Data Webhooks'], highlight: true },
                            { n: 'Enterprise', p: '499', d: 'UNLIMITED SCALE', f: ['Custom Diagnostic Logic', 'SLA Guarantee', 'Dedicated Intel Unit'] },
                        ].map((plan, i) => (
                            <div
                                key={i}
                                className={`apple-card p-12 flex flex-col transition-transform hover:scale-[1.02] ${plan.highlight ? 'border-[#00D1FF]/40 bg-[#00D1FF]/5' : 'border-white/5'}`}
                            >
                                <div className="surgical-label mb-4 !text-white/60">{plan.n}</div>
                                <div className="flex items-end gap-1 mb-10">
                                    <span className="text-5xl font-black font-display text-white tracking-tighter">${plan.p}</span>
                                    <span className="text-white/20 text-xs font-black uppercase mb-1.5 ml-1">/ MONTH</span>
                                </div>
                                <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-12 border-b border-white/5 pb-4">{plan.d}</p>
                                <ul className="flex-1 space-y-5 mb-12">
                                    {plan.f.map((feat, fi) => (
                                        <li key={fi} className="flex gap-4 text-sm text-white/50 font-bold items-start">
                                            <CheckCircle size={16} className="text-[#00D1FF] shrink-0 mt-0.5" /> <span>{feat}</span>
                                        </li>
                                    ))}
                                </ul>
                                <button
                                    onClick={login}
                                    className={`w-full py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${plan.highlight ? 'bg-[#00D1FF] text-black shadow-neon' : 'bg-white/5 hover:bg-white/10 text-white border border-white/5'}`}
                                >
                                    INITIALIZE ACCESS
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Final Footer ─────────────────────────────────────────────────── */}
            <footer className="py-24 px-10 border-t border-white/5 relative bg-black/20">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center font-black text-[#00D1FF] shadow-neon">OS</div>
                        <span className="font-display font-black tracking-tighter text-3xl text-white">WEB OS</span>
                    </div>
                    <div className="flex flex-col items-center gap-4">
                         <p className="surgical-label">© 2026 WEB OS · DIAGNOSTIC INTELLIGENCE UNIT</p>
                         <p className="text-[9px] font-black text-white/10 uppercase tracking-[0.5em]">SYSTEM STATUS: NOMINAL</p>
                    </div>
                    <div className="flex gap-8">
                        {['Terminal', 'Protocol', 'Security'].map(item => (
                            <button key={item} className="surgical-label hover:text-[#00D1FF] transition-all hover:tracking-[0.5em]">{item}</button>
                        ))}
                    </div>
                </div>
            </footer>
        </div>
    );
}
