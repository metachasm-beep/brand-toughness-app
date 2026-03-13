'use client';

import { motion } from 'framer-motion';
import {
  Search,
  Gauge,
  Shield,
  Sparkles,
  Users,
  FileText,
  Lock,
  ArrowRight,
} from 'lucide-react';

type Scores = {
  marketPresence?: number;
  technicalHealth?: number;
  security?: number;
  innovation?: number;
  customerExperience?: number;
  contentQuality?: number;
};

type PillarsCTAProps = {
  scores?: Scores;
  onUnlock?: () => void;
};

const pillars = [
  {
    key: 'marketPresence',
    title: 'Discovery',
    subtitle: 'Search visibility, indexability, and market findability',
    icon: Search,
    color: 'text-[#00D1FF]',
    glow: 'bg-[#00D1FF]/10 border-[#00D1FF]/20',
  },
  {
    key: 'technicalHealth',
    title: 'Performance Integrity',
    subtitle: 'Speed, technical stability, and delivery efficiency',
    icon: Gauge,
    color: 'text-[#7B5CFF]',
    glow: 'bg-[#7B5CFF]/10 border-[#7B5CFF]/20',
  },
  {
    key: 'security',
    title: 'Trust & Authority',
    subtitle: 'Security posture, trust signals, and platform confidence',
    icon: Shield,
    color: 'text-[#00E28A]',
    glow: 'bg-[#00E28A]/10 border-[#00E28A]/20',
  },
  {
    key: 'innovation',
    title: 'Brand Clarity',
    subtitle: 'Differentiation, positioning, and strategic sharpness',
    icon: Sparkles,
    color: 'text-[#FFB84D]',
    glow: 'bg-[#FFB84D]/10 border-[#FFB84D]/20',
  },
  {
    key: 'customerExperience',
    title: 'Customer Experience',
    subtitle: 'Usability, accessibility, and journey coherence',
    icon: Users,
    color: 'text-[#FF3D57]',
    glow: 'bg-[#FF3D57]/10 border-[#FF3D57]/20',
  },
  {
    key: 'contentQuality',
    title: 'Narrative Weight',
    subtitle: 'Message clarity, content depth, and persuasion quality',
    icon: FileText,
    color: 'text-white',
    glow: 'bg-white/5 border-white/10',
  },
] as const;

function getScoreTone(score: number) {
  if (score >= 80) return 'text-[#00E28A]';
  if (score >= 60) return 'text-[#00D1FF]';
  return 'text-[#FF3D57]';
}

function clampPercent(score: number) {
  return Math.max(0, Math.min(100, score));
}

export default function PillarsCTA({ scores, onUnlock }: PillarsCTAProps) {
  return (
    <section className="apple-card p-8 md:p-10 space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="surgical-label mb-2">Strategic Upgrade Layer</div>
          <h3 className="text-3xl md:text-4xl font-extrabold font-display tracking-tighter text-white">
            Unlock Full Pillar Intelligence
          </h3>
          <p className="text-white/45 text-sm md:text-base font-medium max-w-2xl mt-2">
            Move from surface diagnostics to pillar-level action plans, recovery priorities,
            competitor benchmarks, and executive recommendations.
          </p>
        </div>

        <button
          onClick={onUnlock}
          className="apple-button-primary flex items-center justify-center gap-2 px-6 py-4 rounded-2xl whitespace-nowrap"
        >
          <Lock size={16} />
          <span>Unlock All 6 Pillars</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {pillars.map((pillar, i) => {
          const raw = Number(scores?.[pillar.key as keyof Scores] ?? 0);
          const score = Number.isFinite(raw) ? raw : 0;
          const Icon = pillar.icon;

          return (
            <motion.div
              key={pillar.key}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025] p-6 hover:bg-white/[0.04] hover:border-white/20 transition-all"
            >
              <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_45%)]" />

              <div className="relative z-10 space-y-5">
                <div className="flex items-start justify-between gap-4">
                  <div className={`inline-flex p-3 rounded-2xl border ${pillar.glow}`}>
                    <Icon size={18} className={pillar.color} />
                  </div>

                  <div className="text-right">
                    <div className="text-[10px] font-black uppercase tracking-[0.24em] text-white/30">
                      Current Score
                    </div>
                    <div className={`text-2xl font-black font-display ${getScoreTone(score)}`}>
                      {score.toFixed(1)}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-extrabold font-display tracking-tight text-white">
                    {pillar.title}
                  </h4>
                  <p className="text-sm text-white/45 leading-relaxed mt-2 min-h-[44px]">
                    {pillar.subtitle}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="w-full h-2 rounded-full bg-white/8 overflow-hidden">
                    <div
                      className="h-full bg-white/80"
                      style={{ width: `${clampPercent(score)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.2em] font-black text-white/25">
                    <span>Signal Strength</span>
                    <span>Premium Breakdown Locked</span>
                  </div>
                </div>

                <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-4">
                  <div className="text-[11px] font-black uppercase tracking-[0.18em] text-white/30 mb-2">
                    Includes when unlocked
                  </div>
                  <ul className="space-y-1.5 text-sm text-white/55">
                    <li>• pillar-specific issues and fixes</li>
                    <li>• competitor benchmark comparison</li>
                    <li>• executive summary for this pillar</li>
                    <li>• 7-day quick wins + long-term actions</li>
                  </ul>
                </div>

                <button
                  onClick={onUnlock}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] py-3 text-sm font-black uppercase tracking-[0.16em] text-white/75 hover:bg-white/[0.06] hover:text-white transition-all"
                >
                  <Lock size={14} />
                  Unlock {pillar.title}
                  <ArrowRight size={14} />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
