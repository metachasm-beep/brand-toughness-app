'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Globe,
  Loader2,
  Play,
  Activity,
  Users,
  Heart,
  Zap,
  Truck,
  Lock,
  ChevronRight,
  Share,
  Layers
} from 'lucide-react';
import dynamic from 'next/dynamic';
import MetricCard from '@/components/MetricCard';
import { generatePDF } from '@/utils/pdf';

const RadarChart = dynamic(() => import('@/components/RadarChart'), { ssr: false });

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    setLoading(true);
    setError('');
    try {
      const resp = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error);
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const aggregateScore = result
    ? (result.scores.reduce((a: number, b: number) => a + b, 0) / result.scores.length).toFixed(1)
    : '8.4';

  return (
    <div className="space-y-16 max-w-[1400px] mx-auto pt-10">
      {/* Intro Section */}
      <section className="flex flex-col lg:flex-row justify-between items-end gap-10 page-transition">
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-3 text-white/40 text-sm font-bold uppercase tracking-[0.4em]">
            <Activity size={14} /> Telemetry Link Active
          </div>
          <h1 className="text-7xl font-extrabold tracking-tighter text-white">System Overview</h1>
          <p className="text-xl text-white/40 font-medium max-w-2xl">
            Autonomous diagnostic protocols are scanning brand dimensional integrity.
            Connect a resonance point to begin deep initialization.
          </p>
        </div>

        <form onSubmit={handleAudit} className="w-full lg:w-fit flex bg-white/[0.03] border border-white/10 rounded-[32px] p-2 hover:bg-white/[0.05] focus-within:bg-white/[0.08] focus-within:border-white/20 transition-all p-3 pl-8 shadow-2xl">
          <input
            type="url"
            required
            placeholder="brand-target.io"
            className="bg-transparent border-none outline-none w-80 text-lg font-semibold selection:bg-white selection:text-black"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <button
            type="submit"
            disabled={loading}
            className="apple-button-primary flex items-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Play size={20} fill="currentColor" />}
            <span className="text-lg">Initialize</span>
          </button>
        </form>
      </section>

      {/* Main Spatial Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-10">

        {/* Metric Layer 1 */}
        <div className="xl:col-span-1 space-y-10">
          <MetricCard title="Market Presence" value={result ? (result.scores[0] * 10).toFixed(0) : 88} trend="+4.2%" trendDirection="up" status="optimal" icon={Activity} />
          <MetricCard title="Internal Alignment" value={result ? (result.scores[1] * 10).toFixed(0) : 72} trend="+1.5%" trendDirection="up" status="stable" icon={Users} />
        </div>

        {/* Aggregate Spatial View */}
        <div className="xl:col-span-2 flex flex-col items-center justify-center relative apple-card !bg-transparent !border-none">
          <div className="absolute inset-0 bg-radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%) pointer-events-none" />
          <div className="w-full h-full min-h-[500px] relative z-20">
            <RadarChart scores={result ? result.scores : [8.8, 7.2, 9.4, 6.5, 8.1, 8.9]} />

            {/* Overlay HUD */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <div className="text-[12px] font-black uppercase tracking-[0.5em] text-white/30 mb-4">Total Integrity</div>
              <div className="text-[140px] font-black leading-none text-white tracking-tighter drop-shadow-[0_0_40px_rgba(255,255,255,0.3)]">{aggregateScore}</div>
              <div className="flex gap-4 mt-8 pointer-events-auto">
                <button className="apple-button flex items-center gap-2 group">
                  <Share size={16} /> <span>Distribute Intelligence</span>
                </button>
                <button className="apple-button flex items-center gap-2 group">
                  <Layers size={16} /> <span>Topology View</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Metric Layer 2 */}
        <div className="xl:col-span-1 space-y-10">
          <MetricCard title="Customer Loyalty" value={result ? (result.scores[2] * 10).toFixed(0) : 94} trend="+0.8%" trendDirection="up" status="optimal" icon={Heart} />
          <MetricCard title="Supply Resilience" value={result ? (result.scores[4] * 10).toFixed(0) : 81} trend="+5.4%" trendDirection="up" status="optimal" icon={Truck} />
        </div>
      </div>

      {/* Structural Intelligence Deep Scan */}
      {result && (
        <section className="apple-card p-16 space-y-12">
          <div className="flex justify-between items-end">
            <div className="space-y-2">
              <h3 className="text-4xl font-extrabold tracking-tighter">Structural Integrity v4.2</h3>
              <p className="text-white/40 font-semibold uppercase tracking-widest text-sm">Deep Scan Sub-System Active</p>
            </div>
            <div className="apple-button flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-[#30D158]" />
              <span className="font-bold">Operational: Nominal</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
            <div className="space-y-10">
              <h5 className="text-white/20 font-black uppercase tracking-[0.3em] text-xs">Technical Modalities</h5>
              {[
                { label: 'Content Coherence', val: result.details.metaDescription ? '84.2%' : '12.4%', c: '#0A84FF' },
                { label: 'Semantic Geometry', val: result.details.h1Count === 1 ? '92.4%' : '44.1%', c: '#FFFFFF' },
                { label: 'Accessibility Modulus', val: (result.details.totalImages > 0 ? ((result.details.totalImages - result.details.imagesMissingAlt) / result.details.totalImages * 100).toFixed(1) : '100') + '%', c: '#30D158' },
              ].map(spec => (
                <div key={spec.label} className="group cursor-default">
                  <div className="flex justify-between items-end mb-4">
                    <span className="text-lg font-bold text-white group-hover:translate-x-1 transition-transform">{spec.label}</span>
                    <span className="text-2xl font-black text-white/60">{spec.val}</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full transition-all duration-1000 ease-out" style={{ width: spec.val, backgroundColor: spec.c }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-8">
              <h5 className="text-white/20 font-black uppercase tracking-[0.3em] text-xs">Pillar Health Trajectory</h5>
              <div className="space-y-4">
                {[
                  { name: 'Core Infrastructure', desc: 'Resonance point stable across all regions.' },
                  { name: 'Governing Protocol', desc: 'L4 clearance confirmed for all sub-systems.' },
                ].map((item, i) => (
                  <div key={item.name} className="flex gap-6 p-8 bg-white/5 border border-white/10 rounded-[32px] items-center hover:bg-white/10 transition-all cursor-pointer group">
                    <div className="w-12 h-12 bg-white text-black rounded-2xl flex items-center justify-center font-black text-xl">{i + 1}</div>
                    <div className="flex-1">
                      <h6 className="text-xl font-extrabold">{item.name}</h6>
                      <p className="text-white/40 font-medium">{item.desc}</p>
                    </div>
                    <ChevronRight className="text-white/20 group-hover:text-white transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
