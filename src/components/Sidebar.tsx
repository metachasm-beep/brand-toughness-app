'use client';

import { motion } from 'framer-motion';
import { Activity, BarChart3, LayoutGrid, History, Settings, HelpCircle, Shield, Command } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const menuItems = [
    { name: 'Dashboard', icon: Activity, href: '/' },
    { name: 'Pillars', icon: BarChart3, href: '/pillars' },
    { name: 'Telemetrics', icon: LayoutGrid, href: '/telemetrics' },
    { name: 'History', icon: History, href: '/history' },
];

const secondaryItems = [
    { name: 'Settings', icon: Settings, href: '/settings' },
    { name: 'Support', icon: HelpCircle, href: '/support' },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-full h-screen flex flex-col p-8 border-r border-white/5 select-none bg-[#0B0F14]/50 backdrop-blur-3xl relative z-40">
            {/* Brand logo */}
            <div className="flex items-center gap-4 mb-14 px-3">
                <div className="w-12 h-12 bg-gradient-to-br from-[#00D1FF] to-[#7B5CFF] rounded-[14px] flex items-center justify-center shadow-neon">
                    <Command className="text-black" size={24} strokeWidth={3} />
                </div>
                <div className="flex flex-col">
                    <span className="font-display font-black text-2xl tracking-tighter text-white leading-none">WEB OS</span>
                    <span className="surgical-label !text-[8px] mt-1.5 !text-[#00D1FF]">INTEL UNIT v4.2</span>
                </div>
            </div>

            {/* Primary nav */}
            <nav className="flex-1 space-y-3">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center gap-5 px-6 py-4.5 rounded-[20px] transition-all duration-300 group ${isActive
                                ? 'bg-[#00D1FF]/10 border border-[#00D1FF]/20 text-[#00D1FF] shadow-[0_10px_30px_rgba(0,209,255,0.1)]'
                                : 'text-white/30 hover:text-white hover:bg-white/[0.04]'
                                }`}
                        >
                            <item.icon size={20} className={`${isActive ? 'text-[#00D1FF]' : 'group-hover:text-white'} transition-colors`} strokeWidth={isActive ? 2.5 : 2} />
                            <span className={`text-[11px] font-black uppercase tracking-[0.25em] ${isActive ? 'text-white' : ''}`}>{item.name}</span>
                            {isActive && (
                                <motion.div layoutId="sidebar-active" className="ml-auto w-1.5 h-1.5 rounded-full bg-[#00D1FF] shadow-[0_0_12px_#00D1FF]" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Secondary nav */}
            <div className="mt-auto pt-8 border-t border-white/5 space-y-2">
                {secondaryItems.map((item) => (
                    <Link
                        key={item.name}
                        href={item.href}
                        className="flex items-center gap-5 px-6 py-3.5 rounded-[18px] text-white/20 hover:text-white transition-all hover:bg-white/[0.02]"
                    >
                        <item.icon size={18} />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">{item.name}</span>
                    </Link>
                ))}

                {/* Status chip */}
                <div className="mt-8 p-7 rounded-[28px] apple-glass border-white/5 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#00D1FF]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex items-center justify-between mb-5 relative z-10">
                        <span className="surgical-label !text-[9px]">Neural Link</span>
                        <div className="w-2 h-2 rounded-full bg-[#00E28A] animate-pulse shadow-[0_0_10px_#00E28A]" />
                    </div>
                    <div className="text-base font-black font-display text-white mb-1.5 relative z-10 tracking-tight">NODE ACTIVE</div>
                    <div className="surgical-label !text-[8px] !opacity-40 relative z-10">Telemetry Logic Nominal</div>
                </div>
            </div>
        </aside>
    );
}
