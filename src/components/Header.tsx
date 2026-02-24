'use client';

import { Search, Bell, Command, Sun, Moon } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Header() {
    const [theme, setTheme] = useState<'silver' | 'space'>('space');

    useEffect(() => {
        const saved = localStorage.getItem('tt-theme') as 'silver' | 'space' | null;
        if (saved) setTheme(saved);
    }, []);

    const toggleTheme = () => {
        const next = theme === 'silver' ? 'space' : 'silver';
        setTheme(next);
        localStorage.setItem('tt-theme', next);
        document.documentElement.className = `theme-${next}`;
    };

    return (
        <header className="h-[90px] px-10 flex items-center justify-between sticky top-0 z-[100] transition-all duration-500">
            <div className="flex items-center flex-1 max-w-lg">
                <div className="relative w-full group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-white transition-all" size={20} />
                    <input
                        type="text"
                        placeholder="Search Intelligence"
                        className="w-full bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 rounded-2xl py-3 pl-14 pr-4 outline-none focus:bg-white/[0.08] focus:border-white/20 transition-all text-base font-medium placeholder:text-white/20"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-1 opacity-20 pointer-events-none">
                        <Command size={14} />
                        <span className="text-sm font-bold">K</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-8 pl-10">
                <div className="flex items-center gap-3">
                    <button onClick={toggleTheme} className="p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all text-white/60 hover:text-white">
                        {theme === 'space' ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                    <button className="p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all text-white/60 hover:text-white relative">
                        <Bell size={20} />
                        <div className="absolute top-3 right-3 w-2 h-2 bg-[#FF453A] rounded-full ring-2 ring-black" />
                    </button>
                </div>

                <div className="flex items-center gap-4 cursor-pointer hover:bg-white/5 p-1 rounded-2xl transition-all group">
                    <div className="text-right hidden sm:block">
                        <div className="text-sm font-bold text-white tracking-tight">Admin</div>
                        <div className="text-[10px] text-white/30 font-black uppercase tracking-widest mt-0.5">Telemetry L4</div>
                    </div>
                    <div className="w-12 h-12 rounded-[20px] bg-gradient-to-br from-white/20 to-transparent p-[1px]">
                        <div className="w-full h-full rounded-[19px] bg-black flex items-center justify-center overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-500">
                            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="avatar" />
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
