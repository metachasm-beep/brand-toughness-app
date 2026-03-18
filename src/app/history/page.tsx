'use client';
// src/app/history/page.tsx – User history page

import { useSession, signIn } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Shield, LogIn, ExternalLink, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

interface HistoryRow {
    id: string;
    url: string;
    status: string;
    score: number;
    date: string;
    findingCount: number;
}

export default function HistoryPage() {
    const { data: session, status } = useSession();
    const [rows, setRows] = useState<HistoryRow[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!session) return;
        setLoading(true);
        fetch('/api/user-history')
            .then(r => r.json())
            .then(data => {
                if (data.audits) {
                    setRows(data.audits);
                }
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [session]);

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
                        Sign in with your Google account to view your brand intelligence history and retrieve your UID.
                    </p>
                </div>
                <button
                    onClick={() => signIn('google')}
                    className="apple-button-primary flex items-center gap-3 text-lg px-8 py-4 rounded-2xl"
                >
                    <LogIn size={22} /> Sign in with Google
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto pt-10 space-y-12">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-5xl font-extrabold tracking-tighter">Your Intelligence</h1>
                    <p className="text-white/40 font-medium mt-2">Personal brand audit history linked to your account</p>
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
                            <motion.div
                                key={row.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="px-8 py-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-white/[0.02] transition-all"
                            >
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className="text-[10px] font-black text-white/20 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded-full">
                                            {row.id.substring(0, 8)}...
                                        </span>
                                        <span className="text-xs font-bold text-blue-400">{row.findingCount} Findings</span>
                                    </div>
                                    <a
                                        href={row.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="font-bold text-white hover:text-white/70 flex items-center gap-1 transition-colors truncate"
                                    >
                                        {row.url} <ExternalLink size={12} className="shrink-0" />
                                    </a>
                                </div>

                                <div className="flex items-center gap-4 shrink-0">
                                    <div className="text-right mr-4">
                                        <div className="text-lg font-black text-white">{row.score.toFixed(1)}</div>
                                        <div className="text-[10px] text-white/30 uppercase font-bold">Integrity</div>
                                    </div>
                                    <div className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full ${row.status === 'COMPLETED' ? 'bg-[#30D158]/10 text-[#30D158]' : 'bg-[#FF453A]/10 text-[#FF453A]'
                                        }`}>
                                        {row.status === 'COMPLETED' ? <CheckCircle size={12} /> : <AlertTriangle size={12} />}
                                        {row.status}
                                    </div>
                                    <span className="text-white/20 text-xs font-medium">{new Date(row.date).toLocaleDateString()}</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
