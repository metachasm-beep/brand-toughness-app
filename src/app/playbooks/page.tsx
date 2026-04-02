'use client';

import { motion } from 'framer-motion';
import { History, ArrowLeft, Zap } from 'lucide-react';
import Link from 'next/link';

export default function PlaybooksShard() {
    return (
        <div className="min-h-screen p-12 bg-[#0B0F14] text-white">
            <div className="max-w-6xl mx-auto">
                <Link href="/" className="flex items-center gap-3 text-white/40 hover:text-[#FF3D57] transition-all mb-12 group">
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Back to Dashboard</span>
                </Link>

                <div className="flex items-center gap-6 mb-16">
                    <div className="w-20 h-20 rounded-[32px] bg-[#FF3D57]/10 border border-[#FF3D57]/20 flex items-center justify-center shadow-neon">
                        <History size={32} className="text-[#FF3D57]" />
                    </div>
                    <div>
                        <h1 className="text-6xl font-black font-display tracking-tight uppercase leading-none">Strategic Playbooks</h1>
                        <p className="surgical-label mt-4 !text-[#FF3D57]">Diagnostic Shard · Execution Recovery & Growth</p>
                    </div>
                </div>

                <div className="apple-card p-12 bg-white/[0.02] border-white/5">
                    <div className="flex flex-col items-center justify-center py-32 space-y-8 text-center text-white/40">
                        <Zap size={48} className="animate-pulse" />
                        <div>
                            <h3 className="text-2xl font-black uppercase tracking-tighter mb-2">Executing Recovery Modules</h3>
                            <p className="text-sm font-medium uppercase tracking-widest">Playbook data streams require an active audit session.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
