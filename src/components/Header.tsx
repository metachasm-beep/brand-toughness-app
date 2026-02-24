'use client';

import { Search, Bell, Command, Sun, Moon } from 'lucide-react';
import { useState, useEffect } from 'react';
import AuthBar from '@/components/AuthBar';

export default function Header() {
    const [theme, setTheme] = useState<'light' | 'dark'>('dark');

    useEffect(() => {
        const saved = localStorage.getItem('tt-theme') as 'light' | 'dark' | null;
        if (saved) setTheme(saved);
    }, []);

    const toggleTheme = () => {
        const next = theme === 'dark' ? 'light' : 'dark';
        setTheme(next);
        localStorage.setItem('tt-theme', next);
    };

    return (
        <header className="h-[80px] px-10 flex items-center justify-between sticky top-0 z-[100] bg-black/60 backdrop-blur-2xl border-b border-white/[0.05] shrink-0">
            {/* Search */}
            <div className="flex items-center flex-1 max-w-md">
                <div className="relative w-full group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-white transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Search Intelligence"
                        className="w-full bg-white/[0.03] border border-white/[0.06] rounded-2xl py-3 pl-12 pr-4 outline-none focus:bg-white/[0.06] focus:border-white/20 transition-all text-sm font-medium placeholder:text-white/20"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-1 opacity-20 pointer-events-none">
                        <Command size={12} /><span className="text-xs font-bold">K</span>
                    </div>
                </div>
            </div>

            {/* Right controls */}
            <div className="flex items-center gap-5">
                <div className="flex items-center gap-2 border-r border-white/[0.06] pr-5">
                    <button
                        onClick={toggleTheme}
                        className="p-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl hover:bg-white/10 transition-all text-white/40 hover:text-white"
                    >
                        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                    </button>
                    <button className="relative p-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl hover:bg-white/10 transition-all text-white/40 hover:text-white">
                        <Bell size={18} />
                        <div className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-[#FF453A] rounded-full ring-1 ring-black" />
                    </button>
                </div>

                {/* Auth: sign in button or user info */}
                <AuthBar />
            </div>
        </header>
    );
}
