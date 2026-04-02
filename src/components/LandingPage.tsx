'use client';

import { motion } from 'framer-motion';
import { signIn } from 'next-auth/react';
import { ArrowRight, CheckCircle, Brain, Target, Layers, Zap, Command, Info } from 'lucide-react';
import TextPressure from './react-bits/TextPressure';
import SpotlightCard from './react-bits/SpotlightCard';
import Magnet from './react-bits/Magnet';

export default function LandingPage() {
    const login = () => signIn('google');

    const fadeIn = {
        initial: { opacity: 0, y: 20 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0.8, ease: [0.33, 1, 0.68, 1] as any }
    };

    return (
        <div className="bg-[#000000] min-h-screen text-white font-sans selection:bg-[#B05CFF] selection:text-white overflow-x-hidden">
            {/* ── Grid Overlay ────────────────────────────────────────────────── */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0" 
                 style={{ backgroundImage: 'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

            {/* ── Header / Nav ────────────────────────────────────────────────── */}
            <nav className="fixed top-0 left-0 w-full z-[100] border-b border-white/10 bg-black/80 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4 group cursor-pointer" onClick={login}>
                        <div className="relative w-10 h-10 flex items-center justify-center">
                            <img src="/branding/brand-icon.png" alt="BrandOS Icon" className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]" />
                        </div>
                        <img src="/branding/brand-logo.png" alt="BrandOS AI" className="h-7 object-contain" />
                    </div>
                    
                    <div className="hidden md:flex items-center gap-10">
                        <a href="#system" className="surgical-label hover:text-white transition-colors">The System</a>
                        <a href="#process" className="surgical-label hover:text-white transition-colors">Process</a>
                        <a href="#tiers" className="surgical-label hover:text-white transition-colors">Tiers</a>
                    </div>

                    <Magnet padding={50} magnetStrength={3}>
                        <button 
                            onClick={login}
                            className="bg-white text-black px-6 py-2.5 rounded text-[10px] font-black uppercase tracking-widest hover:bg-[#B05CFF] hover:text-white transition-all active:scale-95"
                        >
                            Command Center
                        </button>
                    </Magnet>
                </div>
            </nav>

            {/* ── Hero Section ────────────────────────────────────────────────── */}
            <section className="relative pt-48 pb-32 px-6 border-b border-white/10 overflow-hidden">
                <div className="max-w-7xl mx-auto text-center space-y-12 relative z-10">
                    <motion.div {...fadeIn} className="space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 surgical-label !text-white/60">
                            Structure before scale. Intelligence before execution.
                        </div>
                        
                        <div className="h-[200px] md:h-[300px] w-full flex items-center justify-center">
                            <TextPressure 
                                text="BrandOS AI" 
                                flex={true} 
                                scale={true} 
                                textColor="#FFFFFF" 
                                minFontSize={80}
                                className="font-black font-display italic tracking-tighter leading-[0.85] uppercase"
                            />
                        </div>

                        <h2 className="text-3xl md:text-5xl font-black font-display tracking-tighter uppercase italic text-white/20 -mt-10">
                            The Operating System for Modern Brands.
                        </h2>
                        
                        <p className="text-lg md:text-xl text-white/50 font-medium max-w-3xl mx-auto leading-relaxed pt-8">
                            BrandOS AI™ is a technology-driven brand intelligence system curated by advertising professionals and technology experts to streamline branding, advertising, and marketing into one structured framework.
                        </p>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4, duration: 1 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4"
                    >
                        <Magnet padding={80} magnetStrength={5}>
                            <button onClick={login} className="w-full sm:w-auto bg-white text-black px-10 py-5 font-black uppercase text-xs tracking-widest hover:bg-[#B05CFF] hover:text-white transition-all flex items-center justify-center gap-3">
                                Get Free Brand Snapshot <ArrowRight size={16} />
                            </button>
                        </Magnet>
                        
                        <Magnet padding={80} magnetStrength={5}>
                            <button className="w-full sm:w-auto border border-white/20 px-10 py-5 font-black uppercase text-xs tracking-widest hover:bg-white/5 transition-all">
                                Explore BrandOS AI
                            </button>
                        </Magnet>
                    </motion.div>
                </div>
            </section>

            {/* ── Problem Section ─────────────────────────────────────────────── */}
            <section className="py-32 px-6 border-b border-white/10 bg-[#0A0A0A]">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                    <motion.div {...fadeIn} className="space-y-8">
                        <h2 className="text-5xl md:text-6xl font-black font-display tracking-tight uppercase leading-none">
                            Most Brands Don’t Fail <br />
                            <span className="text-[#B05CFF]">Because of Design.</span>
                        </h2>
                        <div className="h-1 w-20 bg-[#B05CFF]" />
                        <p className="text-3xl font-bold tracking-tight text-white/80">They Fail Because of Misalignment.</p>
                    </motion.div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {[
                            { t: 'Vision Gap', d: 'Vision doesn’t translate into external communication.' },
                            { t: 'Strategic Drift', d: 'Strategy doesn’t align with tactical execution.' },
                            { t: 'Blind Advertising', d: 'Advertising runs without positioning clarity.' },
                            { t: 'Structural Void', d: 'Marketing lacks long-term structural direction.' },
                        ].map((item, i) => (
                            <SpotlightCard key={i} className="p-8 border border-white/5 bg-white/[0.02] space-y-4 rounded-none h-full">
                                <div className="w-2 h-2 rounded-full bg-[#B05CFF]" />
                                <p className="text-sm font-bold text-white/90 leading-relaxed">{item.d}</p>
                            </SpotlightCard>
                        ))}
                    </div>
                </div>
                <div className="max-w-7xl mx-auto mt-20 text-center">
                    <p className="text-xl font-black uppercase tracking-[0.2em] text-[#B05CFF]">BrandOS AI fixes that.</p>
                </div>
            </section>

            {/* ── What is BrandOS AI ───────────────────────────────────────────── */}
            <section id="system" className="py-32 px-6 border-b border-white/10">
                <div className="max-w-7xl mx-auto space-y-20">
                    <div className="text-center space-y-4">
                        <div className="surgical-label">Product Philosophy</div>
                        <h2 className="text-5xl font-black font-display italic uppercase tracking-tighter">
                            Not Another AI Tool. <br />
                            <span className="text-white/30">A Brand Intelligence System.</span>
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/10 border border-white/10">
                        <SpotlightCard className="bg-black p-12 space-y-8 rounded-none border-none">
                            <p className="text-xl text-white/60 leading-relaxed">
                                BrandOS AI™ is built on 15+ years of structured brand consultancy experience, translated into a scalable AI-driven operating system.
                            </p>
                            <div className="space-y-4">
                                {[
                                    'Interprets your vision and mission',
                                    'Identifies positioning gaps',
                                    'Builds structured project requirements',
                                    'Compiles brand guidelines',
                                    'Aligns marketing and advertising activities',
                                    'Prepares brands for scale'
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-4 text-sm font-bold text-white/40">
                                        <CheckCircle size={14} className="text-[#B05CFF]" />
                                        <span>{item}</span>
                                    </div>
                                ))}
                            </div>
                        </SpotlightCard>
                        <SpotlightCard className="bg-black p-12 flex flex-col justify-center items-center text-center space-y-8 relative overflow-hidden rounded-none border-none">
                            <div className="absolute inset-0 bg-[#B05CFF]/5 pointer-events-none" />
                            <h3 className="text-4xl font-black italic uppercase leading-none z-10">It doesn’t generate noise. <br /> It builds architecture.</h3>
                            <Brain size={80} className="text-white/10 absolute -bottom-10 -right-10 transform rotate-12" />
                        </SpotlightCard>
                    </div>
                </div>
            </section>

            {/* ── How It Works (3-Step) ────────────────────────────────────────── */}
            <section id="process" className="py-32 px-6 border-b border-white/10 bg-[#050505]">
                <div className="max-w-7xl mx-auto space-y-24">
                    <div className="text-center space-y-4">
                        <div className="surgical-label">Operational Logic</div>
                        <h2 className="text-5xl font-black font-display uppercase tracking-tight">Structured Strategic Flow</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                        {/* Connecting Line */}
                        <div className="hidden md:block absolute top-[60px] left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                        
                        {[
                            { s: '01', t: 'Strategic Input', d: 'You provide structured brand inputs: Vision, mission, audience, market, challenges, and goals.', i: Target },
                            { s: '02', t: 'Intelligence Processing', d: 'BrandOS AI analyzes positioning, differentiation, messaging, competitive moat, and growth alignment.', i: Brain },
                            { s: '03', t: 'Structured Output', d: 'You receive a Project Requirement Document, Brand Guideline Framework, and Execution Roadmap.', i: Layers },
                        ].map((step, i) => (
                            <motion.div 
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.2 }}
                                className="relative space-y-8 pt-8"
                            >
                                <SpotlightCard className="w-24 h-24 bg-black border border-white/10 flex items-center justify-center mx-auto relative z-10 transition-colors hover:border-[#B05CFF] rounded-none p-0">
                                    <step.i size={32} className="text-[#B05CFF]" />
                                    <div className="absolute -top-3 -right-3 text-[10px] font-black text-white/20">{step.s}</div>
                                </SpotlightCard>
                                <div className="text-center space-y-4">
                                    <h4 className="text-xl font-black uppercase tracking-tight">{step.t}</h4>
                                    <p className="text-sm text-white/40 leading-relaxed max-w-xs mx-auto font-medium">{step.d}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Product Tiers ────────────────────────────────────────────────── */}
            <section id="tiers" className="py-32 px-6 border-b border-white/10">
                <div className="max-w-7xl mx-auto space-y-24">
                    <div className="text-center space-y-4">
                        <div className="surgical-label">Access Tiers</div>
                        <h2 className="text-5xl font-black font-display uppercase tracking-tight italic">Scale with Intelligence</h2>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Snapshot Tier */}
                        <SpotlightCard className="border border-white/10 p-10 space-y-12 hover:bg-white/[0.02] transition-colors relative rounded-none backdrop-blur-none bg-black">
                            <div className="space-y-2">
                                <div className="surgical-label !text-white/40 uppercase">Essential</div>
                                <h3 className="text-3xl font-black font-display uppercase italic text-white/60">BrandOS Snapshot™</h3>
                                <div className="text-5xl font-black font-display tracking-tighter">FREE</div>
                            </div>
                            <ul className="space-y-4 border-t border-white/10 pt-8">
                                {['Brand clarity audit', 'Positioning gap analysis', 'Brand OS AI Score', 'Opportunity insights', 'Summary report (PDF)'].map((f, i) => (
                                    <li key={i} className="flex gap-4 text-xs font-bold text-white/40"><CheckCircle size={12} className="text-[#B05CFF] shrink-0" /> {f}</li>
                                ))}
                            </ul>
                            <Magnet padding={40} magnetStrength={3} wrapperClassName="w-full">
                                <button onClick={login} className="w-full border border-white/20 py-4 font-black uppercase text-[10px] tracking-widest hover:bg-white hover:text-black transition-all">Get Free Snapshot</button>
                            </Magnet>
                        </SpotlightCard>

                        {/* Advanced Tier */}
                        <SpotlightCard className="border-[3px] border-[#B05CFF] p-10 space-y-12 bg-white/[0.04] relative rounded-none spotlight-purple">
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#B05CFF] text-white px-4 py-1 text-[8px] font-black uppercase tracking-widest">Most Popular</div>
                            <div className="space-y-2">
                                <div className="surgical-label !text-[#B05CFF] uppercase">Advanced</div>
                                <h3 className="text-3xl font-black font-display uppercase italic">BrandOS AI Advanced</h3>
                                <div className="text-5xl font-black font-display tracking-tighter">$297 <span className="text-xs text-white/20 uppercase font-black tracking-widest ml-2">One-Time</span></div>
                            </div>
                            <ul className="space-y-4 border-t border-white/10 pt-8">
                                {['Brand positioning framework', 'Messaging architecture', 'Tone calibration', 'Persona mapping', 'Differentiation logic', 'Visual direction blueprint', '90-day marketing roadmap'].map((f, i) => (
                                    <li key={i} className="flex gap-4 text-xs font-bold text-white/80"><CheckCircle size={12} className="text-[#B05CFF] shrink-0" /> {f}</li>
                                ))}
                            </ul>
                            <Magnet padding={40} magnetStrength={3} wrapperClassName="w-full">
                                <button onClick={login} className="w-full bg-[#B05CFF] text-white py-4 font-black uppercase text-[10px] tracking-widest hover:bg-white hover:text-black transition-all">Upgrade to Advanced</button>
                            </Magnet>
                        </SpotlightCard>

                        {/* Professional Tier */}
                        <SpotlightCard className="border border-white/10 p-10 space-y-12 hover:bg-white/[0.02] transition-colors rounded-none backdrop-blur-none bg-black">
                            <div className="space-y-2">
                                <div className="surgical-label !text-white/40 uppercase">Strategic Depth</div>
                                <h3 className="text-3xl font-black font-display uppercase italic text-white/60">BrandOS AI Professional</h3>
                                <div className="text-5xl font-black font-display tracking-tighter">$897 <span className="text-xs text-white/20 uppercase font-black tracking-widest ml-2">One-Time</span></div>
                            </div>
                            <ul className="space-y-4 border-t border-white/10 pt-8">
                                {['Everything in Advanced', 'Competitive moat strategy', 'Authority positioning', 'Campaign theme development', 'Funnel messaging framework', 'Investor-ready summary deck'].map((f, i) => (
                                    <li key={i} className="flex gap-4 text-xs font-bold text-white/40"><CheckCircle size={12} className="text-[#B05CFF] shrink-0" /> {f}</li>
                                ))}
                            </ul>
                            <Magnet padding={40} magnetStrength={3} wrapperClassName="w-full">
                                <button onClick={login} className="w-full border border-white/20 py-4 font-black uppercase text-[10px] tracking-widest hover:bg-white hover:text-black transition-all">Go Professional</button>
                            </Magnet>
                        </SpotlightCard>
                    </div>
                </div>
            </section>


            {/* ── Activation (Turtle Labs) ─────────────────────────────────────── */}
            <section className="py-32 px-6 border-b border-white/10 bg-[#0A0A0A]">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                    <div className="space-y-8">
                        <div className="surgical-label">Human-Led Strategic Partnerships</div>
                        <h2 className="text-6xl font-black font-display tracking-tight uppercase leading-[0.9]">
                            Structure is Built. <br />
                            <span className="text-[#B05CFF]">Now We Activate.</span>
                        </h2>
                        <p className="text-xl text-white/40 leading-relaxed max-w-lg">
                            Once your brand architecture is defined, you can move into human-led strategic partnerships with Turtle Labs. BrandOS AI prepares the groundwork. Our team executes with precision.
                        </p>
                    </div>
                </div>

                {/* Retainer Services Grid */}
                <div className="max-w-7xl mx-auto mt-32 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-white/10 border border-white/10">
                    {[
                        { t: 'Brand Governance', p: '$1,500 – $3,000', d: 'Protect and refine consistency with monthly compliance audits and visual refinement.' },
                        { t: 'Advertising Strategy', p: '$2,500 – $6,000', d: 'Scale visibility with campaign development, ad messaging, and performance oversight.' },
                        { t: 'Marketing Alignment', p: '$1,800 – $4,500', d: 'Align all channels with content strategy, social messaging, and website refinement.' },
                        { t: 'Growth Partnership', p: '$5,000 – $12,000+', d: 'Complete brand and growth partnership. Brand. Advertising. Marketing. Unified.' },
                    ].map((svc, i) => (
                        <div key={i} className="bg-black p-10 space-y-6 hover:bg-white/[0.02] transition-colors group">
                            <div className="space-y-2">
                                <h4 className="text-lg font-black uppercase tracking-tight group-hover:text-[#B05CFF] transition-colors">{svc.t}</h4>
                                <div className="text-xl font-bold tracking-tighter text-white/40">{svc.p} <span className="text-[8px] uppercase tracking-widest font-black ml-1">/ Month</span></div>
                            </div>
                            <p className="text-xs text-white/30 leading-relaxed font-medium">{svc.d}</p>
                        </div>
                    ))}
                </div>
                <div className="max-w-7xl mx-auto mt-16 text-center">
                    <button className="bg-white text-black px-12 py-5 font-black uppercase text-xs tracking-widest hover:bg-[#B05CFF] hover:text-white transition-all">
                        Request Strategic Consultation
                    </button>
                </div>
            </section>

            {/* ── Why Different ───────────────────────────────────────────────── */}
            <section className="py-40 px-6 border-b border-white/10 overflow-hidden relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] border border-white/[0.03] rounded-full pointer-events-none" />
                <div className="max-w-5xl mx-auto space-y-24 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-20">
                        {[
                            { o: 'Most AI tools generate assets.', b: 'BrandOS AI generates structure.' },
                            { o: 'Most agencies start with discovery.', b: 'We start with alignment.' },
                            { o: 'Most brands execute randomly.', b: 'We operate with systems.' },
                        ].map((item, i) => (
                            <div key={i} className="space-y-4">
                                <p className="text-xs font-black uppercase tracking-widest text-white/20 italic">{item.o}</p>
                                <div className="h-0.5 w-8 bg-white/10" />
                                <p className="text-2xl font-black uppercase tracking-tight italic">{item.b}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Final CTA ───────────────────────────────────────────────────── */}
            <section className="py-48 px-6 text-center relative overflow-hidden">
                {/* Visual Accent */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-24 bg-gradient-to-b from-[#B05CFF] to-transparent" />
                
                <div className="max-w-4xl mx-auto space-y-12 relative z-10">
                    <motion.div {...fadeIn} className="space-y-6">
                        <h2 className="text-6xl md:text-8xl font-black font-display tracking-tighter uppercase leading-[0.85] italic">
                            Ready to Structure <br />
                            <span className="text-[#B05CFF]">Your Brand?</span>
                        </h2>
                        <p className="text-2xl font-bold text-white/40 tracking-tight">Start with clarity. Scale with intelligence.</p>
                    </motion.div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                        <button onClick={login} className="w-full sm:w-auto bg-[#B05CFF] text-white px-12 py-6 font-black uppercase text-xs tracking-widest hover:bg-white hover:text-black transition-all">
                            Get Free Brand Snapshot
                        </button>
                        <button className="w-full sm:w-auto border border-white/20 px-12 py-6 font-black uppercase text-xs tracking-widest hover:bg-white/5 transition-all">
                            Talk to Strategy Team
                        </button>
                    </div>
                </div>
            </section>

            {/* ── Footer ──────────────────────────────────────────────────────── */}
            <footer className="py-20 px-6 border-t border-white/10 bg-black">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
                    <div className="space-y-6">
                        <img src="/branding/brand-full.png" alt="BrandOS AI Powered by Turtle Labs" className="h-10 object-contain opacity-80 hover:opacity-100 transition-opacity" />
                        <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] leading-relaxed">
                            © 2026 BrandOS AI • A Turtle Labs Intelligence System <br />
                            OPERATING STATUS: NOMINAL • SYSTEM VERSION: 5.0.1
                        </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-12 sm:gap-24">
                        {[
                            { t: 'Terminal', l: ['Dashboard', 'Telemetry', 'Pillars'] },
                            { t: 'Secure', l: ['Privacy', 'Protocol', 'Encryption'] },
                            { t: 'Connect', l: ['Turtle Labs', 'Strategy', 'Inquiry'] }
                        ].map((group, i) => (
                            <div key={i} className="space-y-6">
                                <div className="surgical-label !text-white/20">{group.t}</div>
                                <div className="flex flex-col gap-3">
                                    {group.l.map((link, li) => (
                                        <button key={li} className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors text-left">{link}</button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </footer>
        </div>
    );
}
