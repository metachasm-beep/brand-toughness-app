'use client';

import { motion } from 'framer-motion';
import { Activity, BarChart3, LayoutGrid, History, Settings, HelpCircle, Shield, Command } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const menuItems = [
    { name: 'Dashboard', icon: Activity, href: '/' },
    { name: 'Brand Authority', icon: BarChart3, href: '/authority' },
    { name: 'Messaging Audit', icon: LayoutGrid, href: '/messaging' },
    { name: 'Playbooks', icon: History, href: '/playbooks' },
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
                <div className="w-12 h-12 bg-gradient-to-br from-[#FF3D57] to-[#E31B23] rounded-[14px] flex items-center justify-center shadow-neon">
                    <img src="/branding/brand-icon.png" alt="" className="w-7 h-7 object-contain filter invert brightness-[2] grayscale-0" />
                </div>
                <div className="flex flex-col">
                    <span className="text-sm font-black font-display tracking-tighter text-white">COMMAND</span>
                    <span className="surgical-label !text-[8px] mt-1.5 !text-[#FF3D57]">STRATEGIC INTEL v5.0</span>
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
                                ? 'bg-[#FF3D57]/10 border border-[#FF3D57]/20 text-[#FF3D57] shadow-[0_10px_30px_rgba(255,61,87,0.1)]'
                                : 'text-white/40 hover:bg-white/[0.03] hover:text-white'
                                }`}
                        >
                            <item.icon size={20} className={`${isActive ? 'text-[#FF3D57]' : 'group-hover:text-white'} transition-colors`} strokeWidth={isActive ? 2.5 : 2} />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">{item.name}</span>
                            {isActive && (
                                <motion.div layoutId="sidebar-active" className="ml-auto w-1.5 h-1.5 rounded-full bg-[#FF3D57] shadow-[0_0_12px_#FF3D57]" />
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
                    <div className="absolute inset-0 bg-gradient-to-br from-[#FF3D57]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative z-10 flex items-center gap-4">
                        <div className="w-2 h-2 rounded-full bg-[#FF3D57] animate-pulse shadow-[0_0_10px_#FF3D57]" />
                        <span className="surgical-label !text-[9px]">Strategy Link</span>
                    </div>
                    <div className="text-base font-black font-display text-white mb-1.5 relative z-10 tracking-tight mt-4">ACTIVE INTEL</div>
                    <div className="surgical-label !text-[8px] !opacity-40 relative z-10">Strategic Logic Nominal</div>
                </div>
            </div>
        </aside>
    );
}
