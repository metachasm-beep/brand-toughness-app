'use client';

import { Activity, LayoutGrid, BarChart3, Shield, Settings, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const menuItems = [
    { name: 'Home', icon: Activity, href: '/' },
    { name: 'Pillars', icon: BarChart3, href: '/pillars' },
    { name: 'Telemetrics', icon: LayoutGrid, href: '/telemetrics' },
];

const secondaryItems = [
    { name: 'Settings', icon: Settings, href: '/settings' },
    { name: 'Support', icon: HelpCircle, href: '/support' },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-full h-screen bg-transparent flex flex-col p-8 select-none">
            <div className="flex items-center gap-4 mb-16">
                <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-2xl">
                    <Shield className="text-black" size={24} strokeWidth={2.5} />
                </div>
                <span className="font-extrabold text-2xl tracking-tight text-white">Resilience</span>
            </div>

            <nav className="flex-1 space-y-4">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center gap-5 px-6 py-4 rounded-3xl transition-all duration-300 ${isActive
                                    ? 'bg-white/10 ring-1 ring-white/20 text-white shadow-xl backdrop-blur-md'
                                    : 'text-white/40 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                            <span className="font-semibold text-lg">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="mt-auto space-y-2">
                {secondaryItems.map((item) => (
                    <Link
                        key={item.name}
                        href={item.href}
                        className="flex items-center gap-5 px-6 py-4 rounded-2xl text-white/30 hover:text-white transition-all duration-300"
                    >
                        <item.icon size={18} />
                        <span className="text-sm font-medium">{item.name}</span>
                    </Link>
                ))}

                <div className="mt-8 p-6 rounded-[32px] bg-white/5 border border-white/10 backdrop-blur-xl">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Core Link</span>
                        <div className="w-2 h-2 rounded-full bg-[#30D158] shadow-[0_0_10px_#30D158]" />
                    </div>
                    <div className="text-lg font-bold leading-none mb-1">System Active</div>
                    <div className="text-[10px] text-white/40 font-medium">Uptime: 2,482 hrs</div>
                </div>
            </div>
        </aside>
    );
}
