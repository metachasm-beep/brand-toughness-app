'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Check, ArrowLeft, Building2, Zap, Rocket, Shield } from 'lucide-react';
import DashboardShell from '@/components/DashboardShell';

const tiers = [
    {
        name: 'Essential Scan',
        price: 'Free',
        description: 'Basic diagnostic snapshot of your primary domain.',
        icon: Zap,
        color: 'text-[#00D1FF]',
        border: 'border-[#00D1FF]/20',
        bg: 'bg-[#00D1FF]/10',
        features: [
            'Basic Domain Scanning',
            'Overall Synthetic Score',
            'Top 5 Critical Findings',
            '24-hour Cache Limit'
        ],
        ctaText: 'Start Free Scan',
        popular: false
    },
    {
        name: 'Pro Diagnostic',
        price: '₹299',
        description: 'Deep structural scan with premium AI narrative positioning.',
        icon: Rocket,
        color: 'text-[#00E28A]',
        border: 'border-[#00E28A]/50 border-2',
        bg: 'bg-[#00E28A]/10',
        features: [
            'All Essential Features',
            'Full 6-Pillar Intelligence',
            'Executive PDF Report',
            'AI Strategic Positioning',
            'Unlimited Findings Stream'
        ],
        ctaText: 'Unlock Pro',
        popular: true
    },
    {
        name: 'Agency Hub',
        price: '₹999/mo',
        description: 'For teams managing multiple brands and client audits.',
        icon: Shield,
        color: 'text-[#7B5CFF]',
        border: 'border-[#7B5CFF]/20',
        bg: 'bg-[#7B5CFF]/10',
        features: [
            'Everything in Pro',
            'Save up to 10 Brands',
            'Competitor Radar Tracking',
            'White-labeled PDF Reports',
            'Live Status Monitoring'
        ],
        ctaText: 'Start Agency Trial',
        popular: false
    },
    {
        name: 'Enterprise Matrix',
        price: 'Custom',
        description: 'Full programmatic access to our diagnostic API engine.',
        icon: Building2,
        color: 'text-[#FFB84D]',
        border: 'border-[#FFB84D]/20',
        bg: 'bg-[#FFB84D]/10',
        features: [
            'Unlimited Brand Workspaces',
            'Direct API Access',
            'Dedicated Account Analyst',
            'Custom AI Training Data',
            'SLA Output Guarantees'
        ],
        ctaText: 'Contact Sales',
        popular: false
    }
];

export default function PricingPage() {
    return (
        <DashboardShell>
            <div className="max-w-[1400px] mx-auto pt-10 pb-24 space-y-16">
                <div className="space-y-4">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-sm font-bold text-white/40 hover:text-white transition-colors"
                    >
                        <ArrowLeft size={16} />
                        Back to Operations
                    </Link>
                    <div className="text-[11px] font-black uppercase tracking-[0.32em] text-[#00E28A]/70">
                        Acquisition Layer
                    </div>
                    <h1 className="text-5xl md:text-7xl font-extrabold font-display tracking-tighter text-white leading-[0.95] max-w-4xl">
                        DIAGNOSTIC TIERS
                    </h1>
                    <p className="text-white/45 text-base md:text-lg max-w-2xl font-medium">
                        Select an access tier that supports your brand requirements. 
                        Every tier operates securely on the distributed Brand OS intelligence matrix.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {tiers.map((tier, i) => {
                        const Icon = tier.icon;
                        return (
                            <motion.div
                                key={tier.name}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className={`relative flex flex-col rounded-[32px] p-8 apple-card ${tier.border} bg-white/[0.02] hover:bg-white/[0.04] transition-all overflow-hidden group`}
                            >
                                {tier.popular && (
                                    <div className="absolute top-0 inset-x-0 h-1 bg-[#00E28A]" />
                                )}
                                
                                <div className="space-y-6 flex-1">
                                    <div className="flex justify-between items-start">
                                        <div className={`p-3 rounded-2xl ${tier.bg}`}>
                                            <Icon size={24} className={tier.color} />
                                        </div>
                                        {tier.popular && (
                                            <div className="px-3 py-1 rounded-full bg-[#00E28A]/10 text-[#00E28A] text-[10px] font-black uppercase tracking-widest">
                                                Most Popular
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div>
                                        <h3 className="text-2xl font-extrabold text-white font-display mb-2">{tier.name}</h3>
                                        <div className="text-4xl font-black font-display text-white mb-3">
                                            {tier.price}
                                        </div>
                                        <p className="text-sm text-white/50 leading-relaxed h-10">
                                            {tier.description}
                                        </p>
                                    </div>

                                    <div className="space-y-4 pt-4 border-t border-white/10">
                                        {tier.features.map((feature, idx) => (
                                            <div key={idx} className="flex items-start gap-3">
                                                <div className={`mt-0.5 rounded-full p-0.5 ${tier.popular ? 'bg-[#00E28A]/20' : 'bg-white/10'}`}>
                                                    <Check size={10} className={tier.popular ? 'text-[#00E28A]' : 'text-white/60'} />
                                                </div>
                                                <span className={`text-sm tracking-tight ${tier.popular ? 'text-white/80' : 'text-white/60'}`}>
                                                    {feature}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-8 mt-auto">
                                    <button 
                                        className={`w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                                            tier.popular 
                                            ? 'bg-[#00E28A] text-black hover:bg-[#00C275]' 
                                            : 'border border-white/10 bg-white/5 text-white hover:bg-white/10'
                                        }`}
                                    >
                                        {tier.ctaText}
                                    </button>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </DashboardShell>
    );
}

