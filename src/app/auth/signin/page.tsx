'use client';
// src/app/auth/signin/page.tsx
import { signIn, getProviders, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogIn, Mail, Lock, Shield } from 'lucide-react';

export default function SignInPage() {
    const [providers, setProviders] = useState<any>(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === 'authenticated') {
            router.push('/');
        }
    }, [status, router]);

    useEffect(() => {
        getProviders().then(setProviders);
    }, []);

    const handleCredentials = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        const res = await signIn('credentials', {
            email, password,
            callbackUrl: '/',
            redirect: false,
        });
        if (res?.error) setError('Invalid credentials. Try any email in demo mode.');
        else if (res?.url) window.location.href = res.url;
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-black p-8">
            <div className="w-full max-w-md space-y-8">
                {/* Logo */}
                <div className="text-center space-y-4">
                    <div className="inline-flex w-16 h-16 bg-white rounded-[28px] items-center justify-center mb-2 shadow-2xl">
                        <Shield className="text-black" size={34} strokeWidth={2.5} />
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tighter">Sign In</h1>
                    <p className="text-white/40 text-sm font-medium">Access your Brand Intelligence account</p>
                </div>

                {/* Google OAuth – shown when configured */}
                {providers?.google && (
                    <button
                        onClick={() => signIn('google', { callbackUrl: '/' })}
                        className="w-full flex items-center justify-center gap-3 bg-white text-black font-bold py-4 rounded-2xl hover:bg-white/90 transition-all shadow-lg text-sm"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Continue with Google
                    </button>
                )}

                {/* Divider */}
                {providers?.google && providers?.credentials && (
                    <div className="flex items-center gap-4">
                        <div className="flex-1 h-px bg-white/10" />
                        <span className="text-white/20 text-xs font-bold uppercase tracking-widest">or</span>
                        <div className="flex-1 h-px bg-white/10" />
                    </div>
                )}

                {/* Demo / Credentials login */}
                {providers?.credentials && (
                    <form onSubmit={handleCredentials} className="space-y-4">
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                            <input
                                type="email" required
                                placeholder="your@email.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full bg-white/[0.04] border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-white/30 transition-all text-sm font-medium"
                            />
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                            <input
                                type="password"
                                placeholder="Password (any value in demo mode)"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full bg-white/[0.04] border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-white/30 transition-all text-sm font-medium"
                            />
                        </div>
                        {error && <p className="text-red-400 text-xs font-bold">{error}</p>}
                        <button
                            type="submit" disabled={loading}
                            className="w-full apple-button-primary py-4 rounded-2xl font-bold flex items-center justify-center gap-2"
                        >
                            <LogIn size={18} />
                            {loading ? 'Signing in…' : 'Sign In'}
                        </button>
                        <p className="text-center text-white/20 text-xs font-medium">
                            Demo mode: enter any email to sign in without Google OAuth
                        </p>
                    </form>
                )}
            </div>
        </div>
    );
}
