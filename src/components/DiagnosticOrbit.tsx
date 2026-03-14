'use client';

import { motion } from 'framer-motion';
import {
  Activity,
  Shield,
  Search,
  Sparkles,
  Users,
  FileText,
} from 'lucide-react';

type DiagnosticOrbitProps = {
  scores?: number[];
  overallScore?: number;
};

type OrbitNode = {
  label: string;
  short: string;
  value: number;
  angle: number;
  radius: number;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  glow: string;
};

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function tone(score: number) {
  if (score >= 85) {
    return {
      ring: 'border-[#00E28A]/40',
      bg: 'bg-[#00E28A]/10',
      text: 'text-[#00E28A]',
      dot: 'bg-[#00E28A]',
    };
  }

  if (score >= 65) {
    return {
      ring: 'border-[#00D1FF]/40',
      bg: 'bg-[#00D1FF]/10',
      text: 'text-[#00D1FF]',
      dot: 'bg-[#00D1FF]',
    };
  }

  return {
    ring: 'border-[#FF3D57]/40',
    bg: 'bg-[#FF3D57]/10',
    text: 'text-[#FF3D57]',
    dot: 'bg-[#FF3D57]',
  };
}

function polarToCartesian(center: number, angle: number, radius: number) {
  const rad = (angle * Math.PI) / 180;
  return {
    x: center + Math.cos(rad) * radius,
    y: center + Math.sin(rad) * radius,
  };
}

export default function DiagnosticOrbit({
  scores = [0, 0, 0, 0, 0, 0],
  overallScore = 0,
}: DiagnosticOrbitProps) {
  const safeScores = [
    clamp(Number(scores[0] || 0)),
    clamp(Number(scores[1] || 0)),
    clamp(Number(scores[2] || 0)),
    clamp(Number(scores[3] || 0)),
    clamp(Number(scores[4] || 0)),
    clamp(Number(scores[5] || 0)),
  ];

  const overallPercent = clamp(Number(overallScore || 0) * 10);
  const center = 300;
  const radarMaxRadius = 185;
  const orbitCardRadius = 235;

  const nodes: OrbitNode[] = [
    {
      label: 'Discovery',
      short: 'SEO',
      value: safeScores[0],
      angle: -90,
      radius: orbitCardRadius,
      icon: Search,
      color: 'text-[#00D1FF]',
      glow: 'shadow-[0_0_30px_rgba(0,209,255,0.22)]',
    },
    {
      label: 'Performance',
      short: 'PERF',
      value: safeScores[1],
      angle: -30,
      radius: orbitCardRadius,
      icon: Activity,
      color: 'text-[#7B5CFF]',
      glow: 'shadow-[0_0_30px_rgba(123,92,255,0.22)]',
    },
    {
      label: 'Trust',
      short: 'TRUST',
      value: safeScores[2],
      angle: 30,
      radius: orbitCardRadius,
      icon: Shield,
      color: 'text-[#00E28A]',
      glow: 'shadow-[0_0_30px_rgba(0,226,138,0.22)]',
    },
    {
      label: 'Clarity',
      short: 'BRAND',
      value: safeScores[3],
      angle: 90,
      radius: orbitCardRadius,
      icon: Sparkles,
      color: 'text-[#FFB84D]',
      glow: 'shadow-[0_0_30px_rgba(255,184,77,0.22)]',
    },
    {
      label: 'Experience',
      short: 'CX',
      value: safeScores[4],
      angle: 150,
      radius: orbitCardRadius,
      icon: Users,
      color: 'text-[#FF3D57]',
      glow: 'shadow-[0_0_30px_rgba(255,61,87,0.22)]',
    },
    {
      label: 'Narrative',
      short: 'CONTENT',
      value: safeScores[5],
      angle: 210,
      radius: orbitCardRadius,
      icon: FileText,
      color: 'text-white',
      glow: 'shadow-[0_0_30px_rgba(255,255,255,0.12)]',
    },
  ];

  const dynamicRadarPoints = nodes.map((node) => {
    const dynamicRadius = Math.max(36, (node.value / 100) * radarMaxRadius);
    const point = polarToCartesian(center, node.angle, dynamicRadius);
    return {
      ...point,
      value: node.value,
      angle: node.angle,
    };
  });

  const radarPolygon = dynamicRadarPoints.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <div className="relative w-full flex items-center justify-center">
      <div className="relative w-[620px] h-[620px] max-w-full">
        <motion.div
          className="absolute inset-0 rounded-full opacity-60 blur-3xl bg-[radial-gradient(circle,rgba(0,209,255,0.12)_0%,rgba(123,92,255,0.08)_35%,transparent_68%)]"
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />

        <motion.div
          className="absolute inset-[8%] rounded-full border border-[#00D1FF]/10"
          animate={{ rotate: 360 }}
          transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute inset-[15%] rounded-full border border-white/5"
          animate={{ rotate: -360 }}
          transition={{ duration: 64, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute inset-[22%] rounded-full border border-[#7B5CFF]/10"
          animate={{ rotate: 360 }}
          transition={{ duration: 42, repeat: Infinity, ease: 'linear' }}
        />

        <div className="absolute inset-0 rounded-full border border-white/5" />
        <div className="absolute inset-[11%] rounded-full border border-white/[0.05]" />
        <div className="absolute inset-[22%] rounded-full border border-white/[0.05]" />
        <div className="absolute inset-[33%] rounded-full border border-white/[0.05]" />
        <div className="absolute inset-[44%] rounded-full border border-white/[0.06]" />

        <div className="absolute inset-0">
          <svg viewBox="0 0 600 600" className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id="radarFill" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="rgba(0,209,255,0.22)" />
                <stop offset="55%" stopColor="rgba(123,92,255,0.16)" />
                <stop offset="100%" stopColor="rgba(0,226,138,0.08)" />
              </linearGradient>

              <linearGradient id="radarStroke" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="rgba(0,209,255,0.95)" />
                <stop offset="50%" stopColor="rgba(123,92,255,0.88)" />
                <stop offset="100%" stopColor="rgba(0,226,138,0.9)" />
              </linearGradient>

              <filter id="radarGlow" x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur stdDeviation="8" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {[0, 60, 120, 180, 240, 300].map((angle) => {
              const outer = polarToCartesian(center, angle, 250);
              return (
                <line
                  key={angle}
                  x1={center}
                  y1={center}
                  x2={outer.x}
                  y2={outer.y}
                  stroke="rgba(255,255,255,0.07)"
                  strokeWidth="1"
                />
              );
            })}

            {[0.25, 0.5, 0.75, 1].map((ratio) => {
              const ringPoints = nodes
                .map((node) => {
                  const point = polarToCartesian(center, node.angle, radarMaxRadius * ratio);
                  return `${point.x},${point.y}`;
                })
                .join(' ');

              return (
                <polygon
                  key={ratio}
                  points={ringPoints}
                  fill="none"
                  stroke="rgba(255,255,255,0.06)"
                  strokeWidth="1"
                />
              );
            })}

            <motion.polygon
              points={radarPolygon}
              fill="url(#radarFill)"
              stroke="url(#radarStroke)"
              strokeWidth="2.2"
              filter="url(#radarGlow)"
              initial={{ opacity: 0.7, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />

            {dynamicRadarPoints.map((point, i) => (
              <g key={`${nodes[i].label}-point`}>
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="7"
                  fill="rgba(11,15,20,1)"
                  stroke="rgba(255,255,255,0.18)"
                  strokeWidth="2"
                />
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="3.6"
                  fill="rgba(0,209,255,1)"
                />
              </g>
            ))}
          </svg>
        </div>

        {nodes.map((node, i) => {
          const orbitPoint = polarToCartesian(0, node.angle, node.radius);
          const metricTone = tone(node.value);
          const Icon = node.icon;

          return (
            <motion.div
              key={node.label}
              className="absolute left-1/2 top-1/2"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{
                opacity: 1,
                scale: 1,
                x: orbitPoint.x,
                y: orbitPoint.y,
              }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              style={{
                transform: `translate(-50%, -50%) translate(${orbitPoint.x}px, ${orbitPoint.y}px)`,
              }}
            >
              <div className="relative -translate-x-1/2 -translate-y-1/2">
                <motion.div
                  className={`absolute inset-0 rounded-[28px] blur-xl opacity-60 ${node.glow}`}
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ duration: 4 + i * 0.4, repeat: Infinity, ease: 'easeInOut' }}
                />
                <div
                  className={`relative w-[126px] md:w-[136px] rounded-[28px] border backdrop-blur-xl p-4 ${metricTone.ring} ${metricTone.bg} bg-[#0B0F14]/70`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="text-[9px] font-black uppercase tracking-[0.22em] text-white/35">
                        {node.short}
                      </div>
                      <div className="text-sm font-extrabold text-white leading-none">
                        {node.label}
                      </div>
                    </div>

                    <div
                      className={`w-9 h-9 rounded-2xl border border-white/10 flex items-center justify-center ${node.color} bg-white/[0.03]`}
                    >
                      <Icon size={16} />
                    </div>
                  </div>

                  <div className={`mt-4 text-2xl font-black font-display ${metricTone.text}`}>
                    {node.value.toFixed(1)}
                  </div>

                  <div className="mt-3 h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                    <motion.div
                      className={`h-full ${metricTone.dot}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${node.value}%` }}
                      transition={{ duration: 1, delay: 0.2 + i * 0.07 }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}

        <div className="absolute inset-1/2 -translate-x-1/2 -translate-y-1/2">
          <motion.div
            className="relative w-[220px] h-[220px] rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          >
            <div className="absolute inset-0 rounded-full border border-[#00D1FF]/15" />
            <div className="absolute inset-[12px] rounded-full border border-[#7B5CFF]/15" />
            <div className="absolute inset-[24px] rounded-full border border-white/10" />
            <div className="absolute inset-[36px] rounded-full border border-[#00E28A]/10" />
          </motion.div>

          <motion.div
            className="absolute inset-1/2 -translate-x-1/2 -translate-y-1/2 w-[182px] h-[182px] rounded-full border border-white/10 bg-[radial-gradient(circle,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.02)_55%,rgba(0,0,0,0.2)_100%)] backdrop-blur-2xl shadow-[0_0_60px_rgba(0,209,255,0.14)]"
            animate={{ scale: [1, 1.015, 1] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className="absolute inset-[14px] rounded-full border border-white/[0.08]" />
            <div className="absolute inset-[30px] rounded-full border border-white/[0.06]" />

            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
              <div className="text-[10px] font-black uppercase tracking-[0.34em] text-white/35 mb-2">
                Brand Core
              </div>

              <motion.div
                className="text-5xl md:text-6xl font-black font-display text-white tracking-tighter leading-none"
                animate={{ opacity: [0.92, 1, 0.92] }}
                transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
              >
                {Number(overallScore || 0).toFixed(1)}
              </motion.div>

              <div className="mt-3 text-[11px] uppercase tracking-[0.22em] font-black text-[#00D1FF]/80">
                Composite Signal
              </div>

              <div className="mt-4 w-full h-2 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  className="h-full bg-[linear-gradient(90deg,#00D1FF_0%,#7B5CFF_55%,#00E28A_100%)]"
                  initial={{ width: 0 }}
                  animate={{ width: `${overallPercent}%` }}
                  transition={{ duration: 1.2, delay: 0.35 }}
                />
              </div>

              <div className="mt-3 text-[10px] font-black uppercase tracking-[0.24em] text-white/25">
                {overallPercent.toFixed(0)}% resonance
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          className="absolute left-1/2 top-1/2 w-[540px] h-[540px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-white/[0.05]"
          animate={{ rotate: -360 }}
          transition={{ duration: 80, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    </div>
  );
}
