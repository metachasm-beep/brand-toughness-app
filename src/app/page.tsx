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
    const timer = setTimeout(() => {
      if (status === 'loading') {
        console.warn('[AUTH] Session check timed out. Proceeding as guest.');
        setSessionStuck(true);
      }
    }, 5000); // 5s timeout
    return () => clearTimeout(timer);
  }, [status]);

  // Show nothing while checking session to prevent flickers, unless it's stuck
  if (status === 'loading' && !sessionStuck) {
    return (
      <div className="min-h-screen bg-[#0B0F14] flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-2 border-[#00D1FF]/10 border-t-[#00D1FF] rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-2 h-2 bg-[#00D1FF] rounded-full animate-pulse" />
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
