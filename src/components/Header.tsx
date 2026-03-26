'use client';

import { Search, Bell, Command } from 'lucide-react';
import AuthBar from '@/components/AuthBar';

export default function Header() {
    return (
        <header className="h-[90px] px-10 flex items-center justify-between sticky top-0 z-[100] bg-[#0B0F14]/60 backdrop-blur-3xl border-b border-white/5 shrink-0">
            {/* Search */}
            <div className="flex items-center flex-1 max-w-lg">
                <div className="relative w-full group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#00D1FF] transition-all" size={18} />
                    <input
                        type="text"
                        placeholder="SEARCH DIAGNOSTICS"
                        className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-3.5 pl-14 pr-5 outline-none focus:bg-white/[0.06] focus:border-[#00D1FF]/30 transition-all text-[11px] font-black tracking-[0.3em] uppercase placeholder:text-white/10 text-white"
                    />
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-1.5 opacity-20 group-focus-within:opacity-40 transition-opacity pointer-events-none">
                        <Command size={12} /><span className="text-[11px] font-black">K</span>
                    </div>
                </div>
            </div>

            {/* Right controls */}
            <div className="flex items-center gap-10">
                <div className="flex items-center gap-4 border-r border-white/5 pr-10">
                    <button className="relative p-3 bg-white/[0.03] border border-white/5 rounded-xl hover:bg-white/5 transition-all text-white/40 hover:text-[#00D1FF] group">
                        <Bell size={18} />
                        <div className="absolute top-3 right-3 w-1.5 h-1.5 bg-[#FF3D57] rounded-full ring-2 ring-[#0B0F14] group-hover:scale-125 transition-transform" />
                    </button>
                    <div className="hidden lg:flex flex-col items-end">
                        <span className="surgical-label !text-[9px] !text-[#00E28A]">Encrypted Link</span>
                        <span className="text-[10px] font-black text-white/30 tracking-[0.2em] uppercase">AES-256 ACTIVE</span>
                    </div>
                </div>

                <AuthBar />
            </div>
        </header>
    );
}
