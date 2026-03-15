'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  BarChart3,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Command,
  CreditCard,
  Globe2,
  PanelLeft,
  Search,
  Shield,
  Sparkles,
  Trophy,
  Wifi,
  WifiOff,
} from 'lucide-react';

type NavItem = {
  label: string;
  href: string;
  icon: any;
  shortcut: string;
  badge?: string;
};

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/', icon: BarChart3, shortcut: '' },
  { label: 'Pillars', href: '/pillars', icon: Sparkles, shortcut: '' },
  { label: 'Telemetrics', href: '/telemetrics', icon: Activity, shortcut: '' },
  { label: 'Leaderboard', href: '/leaderboard', icon: Trophy, shortcut: '', badge: '10k' },
  { label: 'History', href: '/history', icon: Clock3, shortcut: '' },
  { label: 'Pricing', href: '/pricing', icon: CreditCard, shortcut: '', badge: 'New' },
];

function getLeaderboardPreview(pathname: string) {
  if (pathname === '/leaderboard') {
    return { rank: '#128', movement: '+7', label: 'Live rank snapshot' };
  }
  if (pathname === '/pillars') {
    return { rank: '#412', movement: '+18', label: 'Pillar-based momentum' };
  }
  if (pathname === '/telemetrics') {
    return { rank: '#263', movement: '+11', label: 'Telemetry rank estimate' };
  }
  return { rank: '#305', movement: '+9', label: 'Brand OS position signal' };
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const [isRetracted, setIsRetracted] = useState(true);
  const [scanLive, setScanLive] = useState(true);

  const leaderboardPreview = useMemo(
    () => getLeaderboardPreview(pathname),
    [pathname]
  );

  useEffect(() => {
    const timer = window.setInterval(() => {
      setScanLive((prev) => !prev);
    }, 5000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let pendingG = false;
    let timer: number | null = null;

    const navigateTo = (href: string) => {
      router.push(href);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      const isTyping =
        tag === 'input' || tag === 'textarea' || target?.getAttribute('contenteditable') === 'true';

      if (isTyping) return;

      if (pendingG) {
        const key = e.key.toLowerCase();
        pendingG = false;
        if (timer) window.clearTimeout(timer);

        if (key === 'd') navigateTo('/');
        if (key === 'p') navigateTo('/pillars');
        if (key === 't') navigateTo('/telemetrics');
        if (key === 'l') navigateTo('/leaderboard');
        if (key === 'h') navigateTo('/history');
        return;
      }

      if (e.key.toLowerCase() === 'g') {
        pendingG = true;
        timer = window.setTimeout(() => {
          pendingG = false;
        }, 1200);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <>
      {/* Futuristic Shining Toggle Button */}
      <button
        onClick={() => setIsRetracted(!isRetracted)}
        className="fixed top-8 left-8 z-[180] w-14 h-14 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-xl flex items-center justify-center group overflow-hidden transition-all duration-500 hover:border-[#00D1FF]/40"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-[#00D1FF]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute -inset-[100%] group-hover:animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/15 to-transparent skew-x-12 opacity-0 group-hover:opacity-100" />
        <PanelLeft
          size={24}
          className={`text-white transition-all duration-500 ${isRetracted ? 'opacity-100' : 'opacity-0 scale-50 rotate-90'}`}
        />
        <ChevronLeft
          size={24}
          className={`text-[#00D1FF] absolute transition-all duration-500 ${isRetracted ? 'opacity-0 scale-50 -rotate-90' : 'opacity-100 rotate-0'}`}
        />
      </button>

      {/* Retractable Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen z-[140] w-80 bg-[#0B0F14]/95 backdrop-blur-3xl border-r border-white/5 flex flex-col shadow-2xl transition-all duration-700 ease-apple ${
          isRetracted ? '-translate-x-full' : 'translate-x-0'
        }`}
      >
        <div className="p-8 pt-24 space-y-8 flex-1 overflow-y-auto scrollbar-hide">
          {/* Logo Section */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-[18px] bg-gradient-to-br from-[#00D1FF] to-[#7B5CFF] flex items-center justify-center text-black shadow-[0_0_20px_rgba(0,209,255,0.3)]">
              <Command size={24} />
            </div>
            <div>
              <div className="text-xl font-black font-display tracking-tighter text-white">BRAND OS</div>
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#00D1FF]/70">Intelligence</div>
            </div>
          </div>

          <nav className="px-5 py-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center justify-between px-6 py-4 rounded-2xl border transition-all ${
                    active
                      ? 'border-[#00D1FF]/30 bg-[#00D1FF]/10 text-[#00D1FF]'
                      : 'border-transparent text-white/50 hover:text-white hover:bg-white/[0.04]'
                  }`}
                  onClick={() => setIsRetracted(true)}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                        active ? 'bg-[#00D1FF]/10' : 'bg-white/[0.03] group-hover:bg-white/[0.06]'
                      }`}
                    >
                      <Icon size={20} />
                    </div>
                    <div className="font-bold text-sm tracking-tight">{item.label}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.badge && (
                      <span className="px-2.5 py-1 rounded-lg bg-[#00D1FF]/10 text-[9px] font-black uppercase tracking-widest text-[#00D1FF]">
                        {item.badge}
                      </span>
                    )}
                    <ChevronRight
                      size={14}
                      className={`transition-all duration-300 ${active ? 'text-[#00D1FF] opacity-100' : 'text-white/10 opacity-0 group-hover:opacity-100 group-hover:translate-x-1'}`}
                    />
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-8 border-t border-white/5 space-y-6">
          <div className="rounded-3xl border border-[#7B5CFF]/20 bg-[#7B5CFF]/5 p-6 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-[#7B5CFF]/10 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#7B5CFF]/20 flex items-center justify-center shrink-0">
                  <Trophy size={20} className="text-[#7B5CFF]" />
                </div>
                <div className="text-[10px] uppercase font-black tracking-[0.2em] text-[#C9BEFF]/70">Leaderboard</div>
              </div>
              <div className="flex items-end gap-2">
                <div className="text-3xl font-black font-display text-white">{leaderboardPreview.rank}</div>
                <div className="text-sm font-black text-[#30D158] mb-1">{leaderboardPreview.movement}</div>
              </div>
              <p className="text-[11px] text-white/40 mt-2 font-medium leading-relaxed">{leaderboardPreview.label}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 px-2">
            <div className="w-4 h-4 rounded-full bg-blue-500/20 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            </div>
            <div className="text-[10px] font-black uppercase tracking-[0.24em] text-white/30">
              BrandOS AI | Turtle Labs
            </div>
          </div>
        </div>
      </aside>

      {/* Backdrop */}
      {!isRetracted && (
        <div
          className="fixed inset-0 z-[130] bg-black/20 transition-opacity duration-500"
          onClick={() => setIsRetracted(true)}
        />
      )}
    </>
  );
}
