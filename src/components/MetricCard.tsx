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
        <div className="apple-card p-10 group selection:bg-[#00D1FF] selection:text-black hover:border-white/10">
            <div className="flex justify-between items-start mb-10">
                <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                    <Icon size={24} className="text-white/40 group-hover:text-[#00D1FF] transition-colors" />
                </div>
                <div className={`text-[10px] font-black uppercase tracking-[0.2em] py-1.5 px-3 rounded-full border ${status === 'optimal' ? 'bg-[#00E28A]/10 text-[#00E28A] border-[#00E28A]/20' :
                        status === 'critical' ? 'bg-[#FF3D57]/10 text-[#FF3D57] border-[#FF3D57]/20' :
                            'bg-[#00D1FF]/10 text-[#00D1FF] border-[#00D1FF]/20'
                    }`}>
                    {status}
                </div>
            </div>

            <div className="space-y-4">
                <h4 className="surgical-label">{title}</h4>
                <div className="flex items-end gap-3 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                    <span className="text-5xl font-extrabold font-display tracking-tighter text-white">{value}</span>
                    <div className={`flex items-center text-xs font-bold mb-2 pb-1 ${trendDirection === 'up' ? 'text-[#00E28A]' : 'text-[#FF3D57]'}`}>
                        {trendDirection === 'up' ? <TrendingUp size={12} className="mr-1" /> : <TrendingDown size={12} className="mr-1" />}
                        {trend}
                    </div>
                </div>
            </div>
        </div>
    );
}
