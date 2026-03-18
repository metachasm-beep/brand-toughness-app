'use client';

import { Search, Bell, Command } from 'lucide-react';
import AuthBar from '@/components/AuthBar';

export default function Header() {
    return (
        <header className="h-[80px] px-10 flex items-center justify-between sticky top-0 z-[100] bg-[#0B0F14]/80 backdrop-blur-2xl border-b border-white/[0.05] shrink-0">
            {/* Search */}
            <div className="flex items-center flex-1 max-w-md">
                <div className="relative w-full group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#00D1FF] transition-colors" size={16} />
                    <input
                        type="text"
                        placeholder="SEARCH INTELLIGENCE"
                        className="w-full bg-white/[0.02] border border-white/[0.05] rounded-xl py-3 pl-12 pr-4 outline-none focus:bg-white/[0.04] focus:border-white/10 transition-all text-[10px] font-black tracking-widest uppercase placeholder:text-white/20"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-1 opacity-20 pointer-events-none">
                        <Command size={10} /><span className="text-[10px] font-black">K</span>
                    </div>
                </div>
            </div>

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
