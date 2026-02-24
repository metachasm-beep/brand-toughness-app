'use client';

import { TrendingUp, TrendingDown, LucideIcon } from 'lucide-react';

interface MetricCardProps {
    title: string;
    value: string | number;
    trend: string;
    trendDirection: 'up' | 'down';
    status: 'optimal' | 'critical' | 'stable';
    icon: LucideIcon;
}

export default function MetricCard({ title, value, trend, trendDirection, status, icon: Icon }: MetricCardProps) {
    return (
        <div className="apple-card p-10 group selection:bg-white selection:text-black">
            <div className="flex justify-between items-start mb-10">
                <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                    <Icon size={24} className="text-white/60 group-hover:text-white transition-colors" />
                </div>
                <div className={`text-[10px] font-black uppercase tracking-[0.2em] py-1.5 px-3 rounded-full border ${status === 'optimal' ? 'bg-[#30D158]/10 text-[#30D158] border-[#30D158]/20' :
                        status === 'critical' ? 'bg-[#FF453A]/10 text-[#FF453A] border-[#FF453A]/20' :
                            'bg-[#0A84FF]/10 text-[#0A84FF] border-[#0A84FF]/20'
                    }`}>
                    {status}
                </div>
            </div>

            <div className="space-y-4">
                <h4 className="text-xs font-bold text-white/30 uppercase tracking-[0.3em]">{title}</h4>
                <div className="flex items-end gap-3 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                    <span className="text-5xl font-extrabold tracking-tighter text-white">{value}</span>
                    <div className={`flex items-center text-xs font-bold mb-2 pb-1 ${trendDirection === 'up' ? 'text-[#30D158]' : 'text-[#FF453A]'}`}>
                        {trendDirection === 'up' ? <TrendingUp size={12} className="mr-1" /> : <TrendingDown size={12} className="mr-1" />}
                        {trend}
                    </div>
                </div>
            </div>
        </div>
    );
}
