'use client';

import { motion } from 'framer-motion';

interface LoadingBarProps {
    progress: number;
    message?: string;
}

export default function LoadingBar({ progress, message }: LoadingBarProps) {
    return (
        <div className="w-full max-w-md mt-6 space-y-3">
            <div className="flex justify-between items-end text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                <span>{message || 'Generating Intelligence Report'}</span>
                <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                <motion.div
                    className="h-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                />
            </div>
            <p className="text-[10px] text-center text-white/20 font-bold uppercase tracking-widest animate-pulse">
                Polling sheet for processed telemetry...
            </p>
        </div>
    );
}
