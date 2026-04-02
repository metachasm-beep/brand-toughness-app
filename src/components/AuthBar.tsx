'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { LogIn, LogOut, User } from 'lucide-react';

export default function AuthBar() {
    const { data: session, status } = useSession();

    if (status === 'loading') {
        return <div className="w-8 h-8 rounded-full bg-white/5 animate-pulse" />;
    }

    if (!session) {
        return (
            <button
                onClick={() => signIn('google')}
                className="flex items-center gap-3 px-5 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] bg-[#B05CFF] text-white rounded-xl hover:scale-[1.02] transition-all"
            >
                <LogIn size={14} />
                AUTHORIZE ACCESS
            </button>
        );
    }

    return (
        <div className="flex items-center gap-4 group">
            <div className="flex flex-col items-end">
                <div className="text-[11px] font-black uppercase tracking-widest text-white leading-none mb-1">
                    {session.user?.name ?? 'COMMANDER'}
                </div>
                <div className="surgical-label !text-[7px]">AUTH LEVEL: L3 EXECUTIVE</div>
            </div>

            {session.user?.image ? (
                <img
                    src={session.user.image}
                    alt="Avatar"
                    className="w-10 h-10 rounded-xl ring-1 ring-white/10 group-hover:ring-[#00D1FF]/40 transition-all object-cover"
                />
            ) : (
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                    <User size={18} className="text-white/40" />
                </div>
            )}

            <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="p-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-[#FF3D57]/20 hover:text-[#FF3D57] transition-all text-white/30"
                title="Disconnect protocol"
            >
                <LogOut size={16} />
            </button>
        </div>
    );
}
