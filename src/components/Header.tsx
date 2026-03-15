'use client';

import { Search, Bell, Command } from 'lucide-react';
import AuthBar from '@/components/AuthBar';

export default function Header() {
    return (
        <header className="h-[80px] px-10 flex items-center justify-between sticky top-0 z-[100] bg-[#0B0F14]/80 backdrop-blur-2xl border-b border-white/[0.05] shrink-0">
            {/* Search */}
            {/* Left side empty or logo placeholder */}
            <div className="flex-1" />

            {/* Right controls */}
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-3 border-r border-white/[0.05] pr-6">
                    <button className="relative p-2.5 bg-white/[0.02] border border-white/[0.05] rounded-xl hover:bg-white/5 transition-all text-white/40 hover:text-white">
                        <Bell size={16} />
                        <div className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-[#FF3D57] rounded-full ring-2 ring-[#0B0F14]" />
                    </button>
                    <div className="hidden lg:flex flex-col items-end">
                        <span className="surgical-label !text-[8px] !text-[#00E28A]">Encrypted Link</span>
                        <span className="text-[10px] font-black text-white/40 tracking-widest uppercase">AES-256 Active</span>
                    </div>
                </div>

                <AuthBar />
            </div>
        </header>
    );
}
