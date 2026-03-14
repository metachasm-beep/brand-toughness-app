'use client';
// src/app/history/page.tsx – User history page

import { useSession, signIn } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardShell from '@/components/DashboardShell';
import { Shield, LogIn, Clock, CheckCircle, AlertTriangle, ArrowRight, BarChart2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useGuestAudit } from '@/context/GuestAuditContext';

interface HistoryRow {
    id: string;
    url: string;
    uid: string;
    status: string;
    score: number;
    date: string;
    findingCount: number;
    categories: Record<string, { score?: number; confidence?: number }>;
    meta: Record<string, any>;
    findings: any[];
}

export default function HistoryPage() {
    const { data: session, status } = useSession();
    const [rows, setRows] = useState<HistoryRow[]>([]);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { setGuestAuditResult } = useGuestAudit();

    useEffect(() => {
        if (!session) return;
        setLoading(true);
        fetch('/api/user-history')
            .then(r => r.json())
            .then(data => {
                if (data.audits) setRows(data.audits);
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [session]);

    const openAudit = (row: HistoryRow) => {
        // Reconstruct the same shape that Dashboard/Telemetrics/Pillars expect
        const scores = {
            marketPresence: Number(row.categories?.SEO?.score || 0),
            technicalHealth: Number(row.categories?.Performance?.score || 0),
            security: Number(row.categories?.Security?.score || 0),
            innovation: Number(row.categories?.UX?.score || 0),
            customerExperience: Number(row.categories?.Accessibility?.score || 0),
            contentQuality: 8.5,
        };

        const reconstructed = {
            url: row.url,
            uid: row.uid,
            scores,
            aggregate: row.score,
            findings: row.findings,
            rawData: row.meta,
            aiSummary: row.meta?.aiSummary || null,
            rawMetrics: Array.isArray(row.meta?.rawMetrics) ? row.meta.rawMetrics : [],
            debug: { source: 'history', historyId: row.id },
        };

        // Push into the global context so Dashboard + sub-pages pick it up
        setGuestAuditResult(reconstructed);
        router.push('/');
    };

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-white/20 animate-pulse font-bold tracking-widest text-sm uppercase">Loading…</div>
            </div>
        );
    }

    if (!session) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-8 text-center">
                <Shield size={64} className="text-white/20" />
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tighter mb-3">Authentication Required</h1>
                    <p className="text-white/40 font-medium max-w-md mx-auto">
                        Sign in with your Google account to view your brand intelligence history.
                    </p>
                </div>
                <button
                    onClick={() => signIn('google', { callbackUrl: '/history' })}
                    className="apple-button-primary flex items-center gap-3 text-lg px-8 py-4 rounded-2xl"
                >
                    <LogIn size={22} /> Sign in with Google
                </button>
            </div>
        );
    }

    return (
        <DashboardShell>
            <div className="max-w-5xl mx-auto pt-10 space-y-12 pb-24">
                {/* Header */}
                <div className="flex justify-between items-end">
                    <div>
                        <div className="text-[11px] font-black uppercase tracking-[0.32em] text-[#00D1FF]/70 mb-3">
                            Intelligence Archive
                        </div>
                        <h1 className="text-5xl font-extrabold tracking-tighter">Your History</h1>
                        <p className="text-white/40 font-medium mt-2">Click any audit row to load it on the Dashboard</p>
                    </div>
                    <div className="apple-card px-6 py-4 text-right">
                        <div className="text-[10px] text-white/30 uppercase font-black tracking-[0.3em] mb-1">Account</div>
                        <div className="font-bold">{session.user?.name}</div>
                        <div className="text-xs text-white/30">{session.user?.email}</div>
                    </div>
                </div>

                {/* History Table */}
                <div className="apple-card overflow-hidden">
                    <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center">
                        <h3 className="text-xl font-bold">Audit Log</h3>
                        <span className="text-white/30 text-sm font-bold">{rows.length} record{rows.length !== 1 ? 's' : ''}</span>
                    </div>

                    {loading ? (
                        <div className="p-12 text-center text-white/20 animate-pulse font-bold uppercase tracking-widest">
                            Fetching your data…
                        </div>
                    ) : rows.length === 0 ? (
                        <div className="p-12 text-center space-y-4">
                            <Clock size={40} className="mx-auto text-white/10" />
                            <p className="text-white/30 font-medium">No audits found for {session.user?.email}</p>
                            <p className="text-white/20 text-sm">Run your first scan from the Dashboard.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-white/5">
                            {rows.map((row, i) => (
                                <motion.button
                                    key={row.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    onClick={() => openAudit(row)}
                                    className="w-full text-left px-8 py-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-white/[0.04] transition-all group cursor-pointer"
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-1.5">
                                            <span className="text-[10px] font-black text-white/20 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded-full">
                                                {row.id.substring(0, 8)}...
                                            </span>
                                            <span className="text-xs font-bold text-blue-400">{row.findingCount} Findings</span>
                                        </div>
                                        <div className="font-bold text-white truncate flex items-center gap-2">
                                            <BarChart2 size={14} className="text-white/20 shrink-0" />
                                            {row.url}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-5 shrink-0">
                                        {/* Category mini-bars */}
                                        <div className="hidden md:flex gap-3">
                                            {Object.entries(row.categories || {}).map(([cat, val]: [string, any]) => (
                                                <div key={cat} className="flex flex-col items-center gap-1" title={`${cat}: ${val?.score || 0}`}>
                                                    <div className="text-[8px] text-white/20 font-bold uppercase">{cat.substring(0,3)}</div>
                                                    <div className="w-1 h-8 bg-white/10 rounded-full overflow-hidden">
                                                        <div
                                                            className="w-full bg-[#00D1FF] rounded-full"
                                                            style={{ height: `${Math.min(100, val?.score || 0)}%`, marginTop: `${100 - Math.min(100, val?.score || 0)}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="text-right mr-2">
                                            <div className="text-lg font-black text-white">{row.score.toFixed(1)}</div>
                                            <div className="text-[10px] text-white/30 uppercase font-bold">Score</div>
                                        </div>

                                        <div className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full ${row.status === 'COMPLETED' ? 'bg-[#30D158]/10 text-[#30D158]' : 'bg-[#FF453A]/10 text-[#FF453A]'}`}>
                                            {row.status === 'COMPLETED' ? <CheckCircle size={12} /> : <AlertTriangle size={12} />}
                                            {row.status}
                                        </div>
                                        <span className="text-white/20 text-xs font-medium w-20 text-right">{new Date(row.date).toLocaleDateString()}</span>
                                        <ArrowRight size={16} className="text-white/10 group-hover:text-[#00D1FF] transition-colors" />
                                    </div>
                                </motion.button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </DashboardShell>
    );
}
