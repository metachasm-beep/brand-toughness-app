'use client';

import { Activity, BarChart3, LayoutGrid, History, Settings, HelpCircle, Shield } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const menuItems = [
    { name: 'Dashboard', icon: Activity, href: '/' },
    { name: 'Pillars', icon: BarChart3, href: '/pillars' },
    { name: 'Telemetrics', icon: LayoutGrid, href: '/telemetrics' },
    { name: 'My History', icon: History, href: '/history' },
];

const secondaryItems = [
    { name: 'Settings', icon: Settings, href: '/settings' },
    { name: 'Support', icon: HelpCircle, href: '/support' },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-full h-screen flex flex-col p-8 border-r border-white/[0.05] select-none bg-black/40 backdrop-blur-2xl">
            {/* Brand logo */}
            <div className="flex items-center gap-4 mb-14">
                <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-2xl shadow-white/10">
                    <Shield className="text-black" size={24} strokeWidth={2.5} />
                </div>
                <span className="font-extrabold text-2xl tracking-tight text-white">Resilience</span>
            </div>

            {/* Primary nav */}
            <nav className="flex-1 space-y-2">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 ${isActive
                                    ? 'bg-white/10 ring-1 ring-white/20 text-white shadow-xl'
                                    : 'text-white/40 hover:text-white hover:bg-white/[0.04]'
                                }`}
                        >
                            <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                            <span className="font-semibold">{item.name}</span>
                            {isActive && (
                                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_white]" />
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
                        className="flex items-center gap-4 px-5 py-3 rounded-2xl text-white/25 hover:text-white transition-all"
                    >
                        <item.icon size={18} />
                        <span className="text-sm font-medium">{item.name}</span>
                    </Link>
                ))}

                {/* Status chip */}
                <div className="mt-6 p-5 rounded-[28px] bg-white/[0.03] border border-white/[0.06]">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[9px] font-black text-white/25 uppercase tracking-[0.3em]">Core Link</span>
                        <div className="w-2 h-2 rounded-full bg-[#30D158] shadow-[0_0_8px_#30D158]" />
                    </div>
                    <div className="text-sm font-bold">System Active</div>
                    <div className="text-[10px] text-white/25 font-medium">Telemetry nominal</div>
                </div>
            </div>
        </aside>
    );
}
