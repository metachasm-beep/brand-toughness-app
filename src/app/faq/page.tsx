'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, MessageSquare, ShieldCheck, Database, Zap, HelpCircle } from 'lucide-react';

const faqs = [
    {
        q: "What is WEB OS?",
        a: "WEB OS is a diagnostic intelligence unit designed to analyze the technical and strategic integrity of a website. It scans over 150 metrics in 60 seconds to provide a comprehensive 'Toughness Score'."
    },
    {
        q: "How does the 'Revenue Leakage' calculation work?",
        a: "Our core engine simulates user conversion friction against industry benchmarks for latency, trust signals, and brand clarity. It calculates the probability of bounce rates and aborted checkouts to estimate financial loss."
    },
    {
        q: "Is my data secure?",
        a: "Yes. WEB OS uses end-to-end encryption for all diagnostic data. We only scan publicly accessible infrastructure and do not require administrative access to your servers."
    },
    {
        q: "What is Google L3 Authorization?",
        a: "This refers to the secure Google OAuth handshake required to create a unique commander profile and unlock persistent storage for your audit history."
    },
    {
        q: "Can I use reports for clients?",
        a: "The Agency and Enterprise tiers include white-label reporting capabilities, allowing you to export surgical PDF diagnostics with your own branding."
    },
    {
        q: "What payment methods are supported?",
        a: "We currently integrate primarily with PhonePe for secure, high-speed transaction processing across global markets."
    }
];

export default function FAQPage() {
    return (
        <div className="bg-[#0B0F14] min-h-screen text-white font-sans p-10 lg:p-20 overflow-x-hidden">
            <nav className="max-w-3xl mx-auto mb-20 flex justify-between items-center">
                <Link href="/" className="flex items-center gap-2 text-white/50 hover:text-white transition-colors group">
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="surgical-label">Back to Base</span>
                </Link>
                <HelpCircle size={24} className="text-[#00D1FF]" />
            </nav>

            <header className="max-w-3xl mx-auto text-center space-y-6 mb-20">
                <div className="surgical-label !text-[#00D1FF]">Support Terminal</div>
                <h1 className="text-5xl font-black font-display tracking-tight uppercase">Frequently Asked Questions</h1>
            </header>

            <main className="max-w-3xl mx-auto space-y-6 pb-32">
                {faqs.map((f, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="apple-card p-10 border-white/5"
                    >
                        <h3 className="text-xl font-bold mb-4 text-[#00D1FF]">{f.q}</h3>
                        <p className="text-white/50 leading-relaxed font-medium">
                            {f.a}
                        </p>
                    </motion.div>
                ))}
            </main>

            <footer className="max-w-3xl mx-auto text-center py-20 border-t border-white/5">
                <p className="surgical-label text-white/20 mb-8">System support available 24/7 for Enterprise Tier commanders</p>
                <Link href="/" className="bg-[#00D1FF] text-black px-8 py-4 rounded-xl font-black uppercase tracking-widest hover:scale-105 transition-all inline-block">
                    Return to Mission
                </Link>
            </footer>
        </div>
    );
}
