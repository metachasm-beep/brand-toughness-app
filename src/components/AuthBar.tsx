'use client';
// src/components/AuthBar.tsx

import { useSession, signIn, signOut } from 'next-auth/react';
import { LogIn, LogOut, User } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AuthBar() {
    const { data: session, status } = useSession();
    const router = useRouter();

    if (status === 'loading') {
        return <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" />;
    }

    if (!session) {
        return (
            <button
                onClick={() => router.push('/auth/signin')}
                className="flex items-center gap-2 px-4 py-2 text-sm font-bold bg-white text-black rounded-full hover:bg-white/90 transition-all shadow-lg"
            >
                <LogIn size={16} />
                Sign In
            </button>
        );
    }

    return (
        <div className="flex items-center gap-3 group">
            {session.user?.image ? (
                <img
                    src={session.user.image}
                    alt="Avatar"
                    className="w-9 h-9 rounded-full ring-2 ring-white/20 group-hover:ring-white/40 transition-all"
                />
            ) : (
                <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
                    <User size={18} />
                </div>
            )}
            <div className="hidden sm:block text-right">
                <div className="text-sm font-bold leading-tight">{session.user?.name ?? session.user?.email}</div>
                <div className="text-[10px] text-white/30 font-black uppercase tracking-widest truncate max-w-[140px]">
                    {session.user?.email}
                </div>
            </div>
            <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="p-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-white/40 hover:text-white"
                title="Sign out"
            >
                <LogOut size={16} />
            </button>
        </div>
    );
}
