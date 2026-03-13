'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  Sparkles,
  Activity,
  Trophy,
  Clock3,
  Shield,
} from 'lucide-react';

type NavItem = {
  label: string;
  href: string;
  icon: any;
};

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/', icon: BarChart3 },
  { label: 'Pillars', href: '/pillars', icon: Sparkles },
  { label: 'Telemetrics', href: '/telemetrics', icon: Activity },
  { label: 'Leaderboard', href: '/leaderboard', icon: Trophy },
  { label: 'History', href: '/history', icon: Clock3 },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[260px] min-h-screen border-r border-white/10 bg-[#0B0F14] flex flex-col">
      
      {/* Logo / Brand */}
      <div className="px-6 py-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <Shield className="text-[#00D1FF]" size={22} />
          <span className="font-extrabold text-white tracking-tight text-lg">
            BRAND OS
          </span>
        </div>

        <div className="text-[10px] mt-2 uppercase tracking-[0.25em] text-white/40">
          Brand Intelligence
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all
              
              ${
                active
                  ? 'bg-[#00D1FF]/10 text-[#00D1FF] border border-[#00D1FF]/20'
                  : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-5 border-t border-white/10">
        <div className="text-xs text-white/40">
          BrandOS Intelligence Engine
        </div>

        <div className="text-[11px] text-white/30 mt-1">
          v1.0 telemetry build
        </div>
      </div>
    </aside>
  );
}
