'use client';

import { motion } from 'framer-motion';
import { LayoutGrid, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useAuditSession } from '@/lib/hooks/useAuditSession';

export default function MessagingShard() {
    const { auditData, loading } = useAuditSession();

    if (loading) {
        return <div className="min-h-screen bg-[#0B0F14] text-white flex items-center justify-center">Loading...</div>;
    }

    return (
        <div className="min-h-screen p-12 bg-[#0B0F14] text-white">
            <div className="max-w-6xl mx-auto">
                <Link href="/" className="flex items-center gap-3 text-white/40 hover:text-[#FF3D57] transition-all mb-12 group">
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Back to Dashboard</span>
                </Link>

                <div className="flex items-center gap-6 mb-16">
                    <div className="w-20 h-20 rounded-[32px] bg-[#FF3D57]/10 border border-[#FF3D57]/20 flex items-center justify-center shadow-neon">
                        <LayoutGrid size={32} className="text-[#FF3D57]" />
                    </div>
                    <div>
                        <h1 className="text-6xl font-black font-display tracking-tight uppercase leading-none">Messaging Audit</h1>
                        <p className="surgical-label mt-4 !text-[#FF3D57]">Diagnostic Shard · Strategic Communication & Tone</p>
                    </div>
                </div>

                <div className="apple-card p-12 bg-white/[0.02] border-white/5">
                    {auditData ? (
                        <div className="space-y-8">
                            <h3 className="text-2xl font-black uppercase tracking-tighter mb-4 text-[#FF3D57]">Clarity Score: {auditData?.scores?.clarity?.toFixed(1) || 'N/A'}</h3>
                            <p className="text-white/60">Tone of Voice: {auditData?.brandIntelligence?.toneOfVoice}</p>
                            <p className="text-white/60">Core Promise: {auditData?.extracted?.coreOffering}</p>
                            <div className="space-y-4 pt-4 border-t border-white/5">
                                <h4 className="text-xl font-bold">Communication Gaps</h4>
                                <ul className="list-disc pl-5 text-white/50 space-y-2">
                                    {(auditData?.brandIntelligence?.conversionGaps || []).map((gap: string, i: number) => (
                                        <li key={i}>{gap}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-32 space-y-8 text-center">
                            <div className="w-16 h-16 rounded-full border-2 border-dashed border-white/10 animate-spin" />
                            <div>
                                <h3 className="text-2xl font-black uppercase tracking-tighter mb-2">Analyzing Brand Intelligence</h3>
                                <p className="text-white/20 text-sm font-medium uppercase tracking-widest">No active messaging audit detected in current session.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
