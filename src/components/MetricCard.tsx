import { TrendingUp, TrendingDown, LucideIcon } from 'lucide-react';
import LiquidFrame from './LiquidFrame';

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
        <LiquidFrame className="p-10 flex-1 hover:border-white/10 group overflow-hidden">
            <div className="flex justify-between items-start mb-10 relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-pro">
                    <Icon size={28} className="text-white/30 group-hover:text-[#FF3D57] transition-colors" />
                </div>
                <div className={`text-[9px] font-black uppercase tracking-[0.3em] py-2 px-4 rounded-full border shadow-inner ${status === 'optimal' ? 'bg-[#00E28A]/10 text-[#00E28A] border-[#00E28A]/20 shadow-[#00E28A]/5' :
                        status === 'critical' ? 'bg-[#FF3D57]/10 text-[#FF3D57] border-[#FF3D57]/20 shadow-[#FF3D57]/5' :
                            'bg-[#FF3D57]/10 text-[#FF3D57] border-[#FF3D57]/20 shadow-[#FF3D57]/5'
                    }`}>
                    {status}
                </div>
            </div>

            <div className="space-y-6 relative z-10">
                <h4 className="surgical-label !text-white/20 group-hover:!text-white/40 transition-colors uppercase tracking-[0.3em]">{title}</h4>
                <div className="flex items-end gap-4 translate-y-3 group-hover:translate-y-0 transition-transform duration-700 ease-out">
                    <span className="text-6xl font-black font-display tracking-tighter text-white leading-none">{value}</span>
                    <div className={`flex items-center text-[10px] font-black mb-1.5 px-2 py-1 rounded-md bg-white/[0.03] ${trendDirection === 'up' ? 'text-[#00E28A]' : 'text-[#FF3D57]'}`}>
                        {trendDirection === 'up' ? <TrendingUp size={12} className="mr-1" /> : <TrendingDown size={12} className="mr-1" />}
                        {trend}
                    </div>
                </div>
            </div>
        </LiquidFrame>
    );
}
