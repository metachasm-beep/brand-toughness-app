'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import LandingPage from '@/components/LandingPage';
import Dashboard from '@/components/Dashboard';
import { useGuestAudit } from '@/context/GuestAuditContext';
import DashboardShell from '@/components/DashboardShell';

export default function Home() {
  const { data: session, status } = useSession();
  const { guestAuditResult } = useGuestAudit();
  const [sessionStuck, setSessionStuck] = useState(false);

  // Safety timeout for cold-booting auth services or proxy hangs
  useEffect(() => {
    console.log('[DEBUG] Home state:', { status, hasSession: !!session, hasGuest: !!guestAuditResult });
    
    // Safety: if status is stuck too long, unblock the UI
    const timer = setTimeout(() => {
      if (status === 'loading') {
        console.warn('[AUTH] Session check timed out (5s). Unblocking UI.');
        setSessionStuck(true);
      }
    }, 5000); 

    return () => clearTimeout(timer);
  }, [status, session, guestAuditResult]);

  // Show loading spinner ONLY if status is 'loading' AND we haven't timed out yet
  if (status === 'loading' && !sessionStuck) {
    return (
      <div className="min-h-screen bg-[#0B0F14] flex items-center justify-center">
        <div className="relative group cursor-wait">
          {/* External ring */}
          <div className="w-20 h-20 border-2 border-[#00D1FF]/5 border-t-[#00D1FF] rounded-full animate-spin transition-all" />
          {/* Internal core */}
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-2 h-2 bg-[#00D1FF] rounded-full animate-pulse shadow-[0_0_15px_#00D1FF]" />
          </div>
          <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-black uppercase tracking-[0.3em] text-[#00D1FF]/30">
            Initializing Intelligence Node
          </div>
        </div>
      </div>
    );
  }

  // If user is logged in OR has a guest audit result, show dashboard
  if (session || guestAuditResult) {
    return (
      <DashboardShell>
        <Dashboard />
      </DashboardShell>
    );
  }

  return <LandingPage />;
}
