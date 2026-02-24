'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe, Loader2, Play, Activity, Users, Heart,
  Zap, Truck, Lock, Share, Layers, FileDown, Eye, EyeOff, CheckCircle
} from 'lucide-react';
import dynamic from 'next/dynamic';
import MetricCard from '@/components/MetricCard';
import LoadingBar from '@/components/LoadingBar';

const RadarChart = dynamic(() => import('@/components/RadarChart'), { ssr: false });

// ─── Paywall modal ───────────────────────────────────────────────────────────
function PaywallModal({ onClose, onPay }: { onClose: () => void; onPay: () => void }) {
  const [email, setEmail] = useState('');
  const [paid, setPaid] = useState(false);

  const handlePay = () => {
    if (!email) return alert('Please enter your email.');
    // TODO: replace with real Stripe/Razorpay checkout
    setPaid(true);
    setTimeout(() => { onPay(); onClose(); }, 1500);
  };

  return (
    <motion.div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-xl"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      <motion.div
        className="relative w-full max-w-md bg-white/5 border border-white/10 rounded-[40px] p-12"
        initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }}
      >
        <div className="text-center space-y-4 mb-10">
          <div className="text-5xl">📊</div>
          <h2 className="text-3xl font-extrabold tracking-tighter">Unlock Full Report</h2>
          <p className="text-white/40 font-medium text-sm leading-relaxed">
            Your detailed Brand Intelligence PDF includes 6 pillar scores, key findings,
            and a full strategic action plan.
          </p>
          <div className="text-4xl font-black text-white mt-4">₹299 <span className="text-base font-normal text-white/30">/ report</span></div>
        </div>

        {!paid ? (
          <div className="space-y-4">
            <input
              type="email"
              placeholder="Email to receive report"
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-white/30 text-sm font-medium transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button
              onClick={handlePay}
              className="w-full apple-button-primary py-4 text-lg font-bold rounded-2xl flex items-center justify-center gap-3"
            >
              <Lock size={20} /> Pay ₹299 & Download PDF
            </button>
            <button
              onClick={onClose}
              className="w-full text-white/30 text-sm font-semibold mt-2 hover:text-white transition-colors"
            >
              Maybe later
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 text-[#30D158]">
            <CheckCircle size={60} />
            <p className="text-xl font-bold">Payment confirmed! Preparing your PDF…</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────
export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [showPaywall, setShowPaywall] = useState(false);
  const [pdfUnlocked, setPdfUnlocked] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (generating) {
      setProgress(2);
      intervalRef.current = setInterval(() => {
        setProgress(p => p < 95 ? p + (93 / 90) : p);   // ~1% per second, reaches 95 in 90s
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [generating]);

  const handleAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    setLoading(true);
    setGenerating(true);
    setError('');
    setResult(null);
    setPdfUnlocked(false);
    try {
      const response = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Audit failed');
      setResult(data);
      setProgress(100);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setGenerating(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!pdfUnlocked) { setShowPaywall(true); return; }
    const { generatePDF } = await import('@/utils/pdf');
    try {
      const pdf = await generatePDF(result.scores, url, result.rawData, result.aggregate);
      pdf.save(`BrandIntelligence_${new URL(url).hostname}.pdf`);
    } catch {
      alert('PDF generation failed. Please try again.');
    }
  };

  const scoreValues = result ? [
    result.scores.marketPresence,
    result.scores.technicalHealth,
    result.scores.security,
    result.scores.innovation,
    result.scores.customerExperience,
    result.scores.contentQuality,
  ] : [8.8, 7.2, 9.4, 6.5, 8.1, 8.9];

  const aggregateScore = result ? result.aggregate.toFixed(1) : '8.4';

  return (
    <div className="space-y-16 max-w-[1400px] mx-auto pt-10 pb-24">
      {/* ── Hero / Input section ─────────────────────────────────────────── */}
      <section className="flex flex-col lg:flex-row justify-between items-end gap-10 page-transition">
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-3 text-white/40 text-sm font-bold uppercase tracking-[0.4em]">
            <Activity size={14} /> Telemetry Link Active
          </div>
          <h1 className="text-6xl xl:text-7xl font-extrabold tracking-tighter text-white leading-[0.9]">
            System<br />Overview
          </h1>
          <p className="text-lg text-white/40 font-medium max-w-xl">
            Enter any website URL to receive a complete brand intelligence deep-scan powered by live telemetry.
          </p>
        </div>

        <div className="w-full lg:w-auto flex flex-col items-end gap-5">
          <form
            onSubmit={handleAudit}
            className="flex bg-white/[0.04] border border-white/10 rounded-[32px] p-3 pl-7 hover:bg-white/[0.06] focus-within:bg-white/[0.08] focus-within:border-white/20 transition-all shadow-2xl w-full lg:w-auto"
          >
            <Globe className="my-auto mr-3 text-white/30 shrink-0" size={20} />
            <input
              type="url" required
              placeholder="https://brand-target.io"
              className="bg-transparent border-none outline-none flex-1 min-w-[260px] text-lg font-semibold"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={loading}
            />
            <button
              type="submit" disabled={loading}
              className="apple-button-primary ml-2 flex items-center gap-2 shrink-0"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Play size={20} fill="currentColor" />}
              <span>Initialize</span>
            </button>
          </form>

          <AnimatePresence>
            {generating && (
              <motion.div className="w-full" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <LoadingBar progress={progress} message="Deep scan in progress — processing telemetry…" />
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <p className="text-red-400 text-sm font-bold">{error}</p>
          )}
        </div>
      </section>

      {/* ── Pillar grid + Radar ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-10">
        {/* Left pillars */}
        <div className="xl:col-span-1 space-y-8">
          <MetricCard title="Market Presence" value={result ? result.scores.marketPresence.toFixed(1) : '8.8'} trend="+4.2%" trendDirection="up" status="optimal" icon={Activity} />
          <MetricCard title="Technical Health" value={result ? result.scores.technicalHealth.toFixed(1) : '7.2'} trend="+1.5%" trendDirection="up" status="stable" icon={Users} />
          <MetricCard title="Security" value={result ? result.scores.security.toFixed(1) : '9.4'} trend="+0.8%" trendDirection="up" status="optimal" icon={Heart} />
        </div>

        {/* Central 3-D Aggregate View */}
        <div className="xl:col-span-2 apple-card !bg-white/[0.02] relative flex flex-col items-center justify-center min-h-[520px]">
          <div className="absolute inset-0">
            <RadarChart scores={scoreValues} />
          </div>
          <div className="relative z-10 text-center pointer-events-none">
            <div className="text-[11px] font-black uppercase tracking-[0.5em] text-white/30 mb-3">Total Integrity</div>
            <div className="text-[100px] xl:text-[130px] font-black leading-none tracking-tighter text-white drop-shadow-[0_0_40px_rgba(255,255,255,0.25)]">
              {aggregateScore}
            </div>
            <div className="text-white/20 text-sm font-bold uppercase tracking-widest mt-2">/ 10</div>
          </div>
          <div className="relative z-10 flex gap-4 mt-10 pointer-events-auto">
            <button onClick={handleDownloadPDF} disabled={!result} className="apple-button flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed">
              {pdfUnlocked ? <><FileDown size={16} /><span>Download PDF</span></> : <><Lock size={16} /><span>Get Full Report</span></>}
            </button>
            <button className="apple-button flex items-center gap-2">
              <Share size={16} /><span>Share</span>
            </button>
          </div>
        </div>

        {/* Right pillars */}
        <div className="xl:col-span-1 space-y-8">
          <MetricCard title="Innovation" value={result ? result.scores.innovation.toFixed(1) : '6.5'} trend="-2.1%" trendDirection="down" status="critical" icon={Zap} />
          <MetricCard title="Customer Exp." value={result ? result.scores.customerExperience.toFixed(1) : '8.1'} trend="+5.4%" trendDirection="up" status="optimal" icon={Truck} />
          <MetricCard title="Content Quality" value={result ? result.scores.contentQuality.toFixed(1) : '8.9'} trend="+2.0%" trendDirection="up" status="optimal" icon={Lock} />
        </div>
      </div>

      {/* ── Structural Integrity Deep Scan ─────────────────────────────── */}
      <AnimatePresence>
        {result && (
          <motion.section
            className="apple-card p-12 space-y-10"
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          >
            <div className="flex justify-between items-end">
              <div>
                <h3 className="text-4xl font-extrabold tracking-tighter">Structural Integrity v4.2</h3>
                <p className="text-white/30 uppercase tracking-widest text-xs font-bold mt-1">Deep Scan Active · Pillar Inspection Bay</p>
              </div>
              <div className="apple-button flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#30D158]" />
                <span>Nominal</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              {/* Bar metrics */}
              <div className="space-y-8">
                <h5 className="text-xs font-black text-white/20 uppercase tracking-[0.3em]">Pillar Scores</h5>
                {[
                  { label: 'Market Presence', val: result.scores.marketPresence },
                  { label: 'Technical Health', val: result.scores.technicalHealth },
                  { label: 'Security', val: result.scores.security },
                  { label: 'Innovation', val: result.scores.innovation },
                  { label: 'Customer Exp.', val: result.scores.customerExperience },
                  { label: 'Content Quality', val: result.scores.contentQuality },
                ].map(({ label, val }) => (
                  <div key={label} className="group">
                    <div className="flex justify-between text-sm font-bold mb-2">
                      <span className="text-white/70">{label}</span>
                      <span className="text-white">{val.toFixed(1)}/10</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-white"
                        initial={{ width: 0 }}
                        animate={{ width: `${val * 10}%` }}
                        transition={{ duration: 1.2, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Raw findings blurred if not paid */}
              <div className="relative space-y-6">
                <h5 className="text-xs font-black text-white/20 uppercase tracking-[0.3em]">Raw Telemetry</h5>
                <div className={`space-y-3 transition-all duration-500 ${!pdfUnlocked ? 'blur-sm select-none pointer-events-none' : ''}`}>
                  {[
                    ['Status Code', result.rawData['Status Code']],
                    ['Load Time', result.rawData['Load Time (ms)'] + ' ms'],
                    ['Page Size', result.rawData['Page Size (KB)'] + ' KB'],
                    ['SSL', result.rawData['Has SSL']],
                    ['Mobile Friendly', result.rawData['Mobile Friendly']],
                    ['H1 Tag', result.rawData['H1 Tag'] || 'None'],
                    ['Meta Description', result.rawData['Meta Description'] ? '✔ Present' : '✗ Missing'],
                    ['Broken Links', result.rawData['Broken Links'] || '0'],
                    ['Security Headers', result.rawData['Security Headers']],
                    ['CMS', result.rawData['CMS Detected'] || 'Unknown'],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between text-sm py-2 border-b border-white/5">
                      <span className="text-white/40 font-medium">{k}</span>
                      <span className="text-white font-bold">{v}</span>
                    </div>
                  ))}
                </div>

                {!pdfUnlocked && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                    <EyeOff size={28} className="text-white/30" />
                    <p className="text-white/50 text-sm font-bold text-center">
                      Unlock the full report to view raw telemetry
                    </p>
                    <button onClick={() => setShowPaywall(true)} className="apple-button-primary flex items-center gap-2 text-sm">
                      <Lock size={14} /> Unlock Full Access
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* ── Paywall modal ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showPaywall && (
          <PaywallModal
            onClose={() => setShowPaywall(false)}
            onPay={() => { setPdfUnlocked(true); handleDownloadPDF(); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
