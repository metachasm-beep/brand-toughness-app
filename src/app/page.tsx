'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import LandingPage from '@/components/LandingPage';
import Dashboard from '@/components/Dashboard';

export default function Home() {
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);
  const [bypassAuth, setBypassAuth] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => {
      if (status === 'loading') {
        console.warn('[AUTH] Session check timed out (3s). Bypassing to Landing Page.');
        setBypassAuth(true);
      }
    }, 3000); 

    return () => clearTimeout(timer);
  }, [status]);

  // Prevent hydration mismatch
  if (!mounted) return null;

  // Show loading spinner ONLY if status is 'loading' AND we haven't timed out yet
  if (status === 'loading' && !bypassAuth && !session) {
    return (
      <div className="min-h-screen bg-[#0B0F14] flex items-center justify-center">
        <div className="relative group">
          <div className="w-20 h-20 border-2 border-[#00D1FF]/5 border-t-[#00D1FF] rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-2 h-2 bg-[#00D1FF] rounded-full animate-pulse shadow-[0_0_15px_#00D1FF]" />
          </div>
          <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-black uppercase tracking-[0.3em] text-[#00D1FF]/30">
            Stabilizing Diagnostics
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return <LandingPage />;
  }

  return <Dashboard />;
}
