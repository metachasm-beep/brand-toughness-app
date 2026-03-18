'use client';

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
        <aside className="w-full h-screen flex flex-col p-8 border-r border-white/[0.05] select-none bg-[#0B0F14] relative z-40">
            {/* Brand logo */}
            <div className="flex items-center gap-4 mb-14 px-2">
                <div className="w-10 h-10 bg-[#00D1FF] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(0,209,255,0.3)]">
                    <Command className="text-black" size={22} strokeWidth={3} />
                </div>
                <div className="flex flex-col">
                    <span className="font-display font-black text-xl tracking-tighter text-white leading-none">BRAND OS</span>
                    <span className="surgical-label !text-[7px] mt-1">Intelligence Unit</span>
                </div>
            </div>

            {/* Primary nav */}
            <nav className="flex-1 space-y-2">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 ${isActive
                                ? 'bg-white/5 border border-white/10 text-[#00D1FF]'
                                : 'text-white/30 hover:text-white hover:bg-white/[0.03]'
                                }`}
                        >
                            <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                            <span className={`text-xs font-black uppercase tracking-[0.2em] ${isActive ? 'text-white' : ''}`}>{item.name}</span>
                            {isActive && (
                                <div className="ml-auto w-1 h-1 rounded-full bg-[#00D1FF] shadow-[0_0_8px_#00D1FF]" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Secondary nav */}
            <div className="mt-auto pt-8 border-t border-white/[0.05] space-y-1">
                {secondaryItems.map((item) => (
                    <Link
                        key={item.name}
                        href={item.href}
                        className="flex items-center gap-4 px-5 py-3 rounded-2xl text-white/20 hover:text-white transition-all"
                    >
                        <item.icon size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest">{item.name}</span>
                    </Link>
                ))}

                {/* Status chip */}
                <div className="mt-6 p-6 rounded-3xl bg-white/[0.02] border border-white/[0.05]">
                    <div className="flex items-center justify-between mb-4">
                        <span className="surgical-label !text-[8px]">Secure Link</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-[#00E28A] animate-pulse glow-blue" />
                    </div>
                    <div className="text-sm font-black font-display text-white mb-1">NODE ACTIVE</div>
                    <div className="surgical-label !text-[7px]">Telemetry Nominal</div>
                </div>
            </div>
        </aside>
    );
}
