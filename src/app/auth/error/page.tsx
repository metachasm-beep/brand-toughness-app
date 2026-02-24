'use client';
// src/app/auth/error/page.tsx
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import { Suspense } from 'react';

const ERRORS: Record<string, string> = {
    Configuration: 'Server configuration is incomplete. Google OAuth credentials are not set up yet.',
    AccessDenied: 'Access was denied. Please try a different account.',
    Verification: 'The verification link is invalid or has expired.',
    Default: 'An unexpected authentication error occurred.',
};

function ErrorContent() {
    const params = useSearchParams();
    const error = params.get('error') ?? 'Default';
    const message = ERRORS[error] ?? ERRORS.Default;

    return (
        <div className="min-h-screen flex items-center justify-center bg-black p-8">
            <div className="max-w-md text-center space-y-6">
                <div className="inline-flex w-16 h-16 bg-red-500/10 rounded-3xl items-center justify-center">
                    <AlertTriangle className="text-red-400" size={32} />
                </div>
                <h1 className="text-3xl font-extrabold tracking-tighter">Authentication Error</h1>
                <p className="text-white/50 font-medium leading-relaxed">{message}</p>

                {error === 'Configuration' && (
                    <div className="text-left bg-white/[0.03] border border-white/10 rounded-2xl p-6 text-sm space-y-2">
                        <p className="font-bold text-white/70">To fix this:</p>
                        <ol className="list-decimal list-inside text-white/40 space-y-1">
                            <li>Go to <a href="https://console.cloud.google.com/apis/credentials" target="_blank" className="text-blue-400 underline">Google Console</a></li>
                            <li>Create OAuth 2.0 Web credentials</li>
                            <li>Add <code className="text-white/60">http://localhost:3001/api/auth/callback/google</code> as redirect URI</li>
                            <li>Add <code className="text-white/60">GOOGLE_CLIENT_ID</code> and <code className="text-white/60">GOOGLE_CLIENT_SECRET</code> to <code className="text-white/60">.env.local</code></li>
                            <li>Restart the dev server</li>
                        </ol>
                    </div>
                )}

                <Link href="/auth/signin" className="inline-flex items-center gap-2 apple-button">
                    <ArrowLeft size={16} /> Try Again
                </Link>
            </div>
        </div>
    );
}

export default function AuthErrorPage() {
    return (
        <Suspense>
            <ErrorContent />
        </Suspense>
    );
}
