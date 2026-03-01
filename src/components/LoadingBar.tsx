'use client';

import { motion } from 'framer-motion';

interface LoadingBarProps {
    progress: number;
    message?: string;
}

export default function LoadingBar({ progress, message }: LoadingBarProps) {
    return (
        <div className="w-full mt-6 space-y-4">
            <div className="flex justify-between items-end">
                <span className="surgical-label !text-white/40">{message || 'Generating Intelligence Report'}</span>
                <span className="font-display font-black text-xs text-[#00D1FF]">{Math.round(progress)}%</span>
            </div>
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-[1px]">
                <motion.div
                    className="h-full bg-gradient-to-r from-[#00D1FF] to-[#7B5CFF] rounded-full shadow-[0_0_20px_rgba(0,209,255,0.4)]"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                />
            </div>
            <div className="flex justify-center gap-1">
                {[...Array(5)].map((_, i) => (
                    <motion.div
                        key={i}
                        animate={{ opacity: [0.2, 1, 0.2] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                        className="w-1.5 h-1.5 rounded-full bg-[#00D1FF]/20"
                    />
                ))}
            </div>
        </div>
    );
}
