'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
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

type Workspace = {
  id: string;
  name: string;
  initials: string;
  accent: string;
};

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/', icon: BarChart3, shortcut: 'G D' },
  { label: 'Pillars', href: '/pillars', icon: Sparkles, shortcut: 'G P' },
  { label: 'Telemetrics', href: '/telemetrics', icon: Activity, shortcut: 'G T' },
  { label: 'Leaderboard', href: '/leaderboard', icon: Trophy, shortcut: 'G L', badge: '10k' },
  { label: 'History', href: '/history', icon: Clock3, shortcut: 'G H' },
  { label: 'Pricing', href: '/pricing', icon: CreditCard, shortcut: 'G $', badge: 'New' },
];

const workspaces: Workspace[] = [
  { id: 'turtle-labs', name: 'Turtle Labs', initials: 'TL', accent: 'from-[#00D1FF] to-[#7B5CFF]' },
  { id: 'brand-os', name: 'Brand OS', initials: 'BO', accent: 'from-[#7B5CFF] to-[#00E28A]' },
  { id: 'global-rank', name: 'Global Rank', initials: 'GR', accent: 'from-[#FFB84D] to-[#FF3D57]' },
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

  const [collapsed, setCollapsed] = useState(false);
  const [iconOnly, setIconOnly] = useState(false);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [commandPaletteHint, setCommandPaletteHint] = useState(false);
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace>(workspaces[0]);
  const [scanLive, setScanLive] = useState(true);
  const [scanPulseCount, setScanPulseCount] = useState(0);

  const compact = collapsed || iconOnly;

  const leaderboardPreview = useMemo(
    () => getLeaderboardPreview(pathname),
    [pathname]
  );

  useEffect(() => {
    const storedCollapsed = window.localStorage.getItem('brandos.sidebar.collapsed');
    const storedIconOnly = window.localStorage.getItem('brandos.sidebar.iconOnly');
    const storedWorkspace = window.localStorage.getItem('brandos.sidebar.workspace');

    if (storedCollapsed === 'true') setCollapsed(true);
    if (storedIconOnly === 'true') setIconOnly(true);

    if (storedWorkspace) {
      const found = workspaces.find((w) => w.id === storedWorkspace);
      if (found) setActiveWorkspace(found);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem('brandos.sidebar.collapsed', String(collapsed));
  }, [collapsed]);

  useEffect(() => {
    window.localStorage.setItem('brandos.sidebar.iconOnly', String(iconOnly));
  }, [iconOnly]);

  useEffect(() => {
    window.localStorage.setItem('brandos.sidebar.workspace', activeWorkspace.id);
  }, [activeWorkspace]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setScanPulseCount((v) => v + 1);
      setScanLive((prev) => !prev);
    }, 5000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let pendingG = false;
    let timer: number | null = null;

    const navigateTo = (href: string) => {
      window.location.href = href;
    };

    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      const isTyping =
        tag === 'input' || tag === 'textarea' || target?.getAttribute('contenteditable') === 'true';

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setCollapsed((prev) => !prev);
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'i') {
        e.preventDefault();
        setIconOnly((prev) => !prev);
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteHint(true);
        window.setTimeout(() => setCommandPaletteHint(false), 1600);
        return;
      }

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
      {commandPaletteHint && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[300] px-4 py-3 rounded-2xl border border-[#00D1FF]/20 bg-[#0B0F14]/90 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <Command size={15} className="text-[#00D1FF]" />
            Command palette shortcut detected
          </div>
          <div className="text-xs text-white/45 mt-1">Connect your actual command modal here.</div>
        </div>
      )}

      <aside
        className={`min-h-screen border-r border-white/10 bg-[#0B0F14] flex flex-col transition-all duration-300 ${
          compact ? 'w-[92px]' : 'w-[300px]'
        }`}
      >
        <div className="px-4 py-4 border-b border-white/10">
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={() => setWorkspaceOpen((v) => !v)}
              className={`w-full rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.05] transition-all ${
                compact ? 'p-3' : 'px-4 py-3'
              }`}
              title={compact ? activeWorkspace.name : undefined}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`shrink-0 w-10 h-10 rounded-2xl bg-gradient-to-br ${activeWorkspace.accent} flex items-center justify-center text-black font-black text-sm`}
                >
                  {activeWorkspace.initials}
                </div>

                {!compact && (
                  <>
                    <div className="min-w-0 text-left flex-1">
                      <div className="text-xs uppercase tracking-[0.24em] text-white/35 font-black">
                        Workspace
                      </div>
                      <div className="text-white font-extrabold truncate mt-1">
                        {activeWorkspace.name}
                      </div>
                    </div>
                    <ChevronDown
                      size={16}
                      className={`text-white/35 transition-transform ${workspaceOpen ? 'rotate-180' : ''}`}
                    />
                  </>
                )}
              </div>
            </button>

            {!compact && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIconOnly((v) => !v)}
                  className="w-10 h-10 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.05] text-white/65 hover:text-white transition-all flex items-center justify-center"
                  title="Toggle icons-only mode (Ctrl/Cmd + I)"
                >
                  <PanelLeft size={16} />
                </button>
                <button
                  onClick={() => setCollapsed((v) => !v)}
                  className="w-10 h-10 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.05] text-white/65 hover:text-white transition-all flex items-center justify-center"
                  title="Collapse sidebar (Ctrl/Cmd + B)"
                >
                  <ChevronLeft size={16} />
                </button>
              </div>
            )}

            {compact && (
              <button
                onClick={() => {
                  if (iconOnly) setIconOnly(false);
                  else setCollapsed(false);
                }}
                className="w-10 h-10 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.05] text-white/65 hover:text-white transition-all flex items-center justify-center shrink-0"
                title="Expand sidebar"
              >
                <ChevronRight size={16} />
              </button>
            )}
          </div>

          {workspaceOpen && !compact && (
            <div className="mt-3 space-y-2">
              {workspaces.map((workspace) => (
                <button
                  key={workspace.id}
                  onClick={() => {
                    setActiveWorkspace(workspace);
                    setWorkspaceOpen(false);
                  }}
                  className={`w-full rounded-2xl border text-left px-4 py-3 transition-all ${
                    activeWorkspace.id === workspace.id
                      ? 'border-[#00D1FF]/20 bg-[#00D1FF]/10'
                      : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.05]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl bg-gradient-to-br ${workspace.accent} flex items-center justify-center text-black font-black text-xs`}
                    >
                      {workspace.initials}
                    </div>
                    <div>
                      <div className="text-white font-bold">{workspace.name}</div>
                      <div className="text-[11px] text-white/35 mt-0.5">Live workspace context</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <nav className="flex-1 px-3 py-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                title={compact ? item.label : undefined}
                className={`group flex items-center ${
                  compact ? 'justify-center px-0 py-3' : 'justify-between px-4 py-3.5'
                } rounded-2xl border transition-all ${
                  active
                    ? 'border-[#00D1FF]/20 bg-[#00D1FF]/10 text-[#00D1FF]'
                    : 'border-transparent text-white/60 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                      active ? 'bg-[#00D1FF]/10' : 'bg-white/[0.03] group-hover:bg-white/[0.06]'
                    }`}
                  >
                    <Icon size={18} />
                  </div>

                  {!compact && (
                    <div>
                      <div className="font-semibold">{item.label}</div>
                      <div className="text-[10px] uppercase tracking-[0.18em] text-white/28 mt-1">
                        {item.shortcut}
                      </div>
                    </div>
                  )}
                </div>

                {!compact && (
                  <div className="flex items-center gap-2">
                    {item.badge && (
                      <span className="px-2 py-1 rounded-lg bg-white/[0.05] text-[10px] font-black uppercase tracking-[0.14em] text-white/45">
                        {item.badge}
                      </span>
                    )}
                    <ChevronRight
                      size={14}
                      className={`transition-transform ${active ? 'text-[#00D1FF]' : 'text-white/20 group-hover:translate-x-0.5'}`}
                    />
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="px-4 py-4 border-t border-white/10 space-y-3">
          <div
            className={`rounded-2xl border border-[#7B5CFF]/20 bg-[#7B5CFF]/10 ${
              compact ? 'p-3' : 'p-4'
            }`}
            title={compact ? 'Live leaderboard rank preview' : undefined}
          >
            <div className={`flex items-start gap-3 ${compact ? 'justify-center' : ''}`}>
              <div className="w-10 h-10 rounded-2xl bg-[#7B5CFF]/15 border border-[#7B5CFF]/20 flex items-center justify-center shrink-0">
                <Trophy size={18} className="text-[#7B5CFF]" />
              </div>

              {!compact && (
                <div className="min-w-0">
                  <div className="text-[10px] uppercase tracking-[0.22em] text-[#C9BEFF]/70 font-black">
                    Leaderboard Preview
                  </div>
                  <div className="flex items-end gap-2 mt-1">
                    <div className="text-2xl font-black font-display text-white">
                      {leaderboardPreview.rank}
                    </div>
                    <div className="text-sm font-black text-[#00E28A]">
                      {leaderboardPreview.movement}
                    </div>
                  </div>
                  <div className="text-[11px] text-white/45 mt-1">
                    {leaderboardPreview.label}
                  </div>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => setCommandPaletteHint(true)}
            className={`w-full rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.05] transition-all ${
              compact ? 'p-3 flex justify-center' : 'px-4 py-3'
            }`}
            title={compact ? 'Search / shortcuts' : undefined}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center">
                <Search size={16} className="text-white/60" />
              </div>

              {!compact && (
                <>
                  <div className="text-left flex-1">
                    <div className="text-white font-semibold">Quick search</div>
                    <div className="text-[11px] text-white/35 mt-1">
                      Use keyboard shortcuts and navigation commands
                    </div>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 rounded-lg border border-white/10 bg-black/20 text-[10px] font-black text-white/45">
                    <Command size={11} />
                    K
                  </div>
                </>
              )}
            </div>
          </button>

          {!compact && (
            <div className="px-1 pt-1">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-white/28 font-black">
                <Globe2 size={12} />
                Enterprise navigation layer
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
