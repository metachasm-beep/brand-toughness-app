'use client';

import { useSession } from 'next-auth/react';
import LandingPage from '@/components/LandingPage';
import Dashboard from '@/components/Dashboard';
import { useGuestAudit } from '@/context/GuestAuditContext';
import DashboardShell from '@/components/DashboardShell';

export default function Home() {
  const { data: session, status } = useSession();
  const { guestAuditResult } = useGuestAudit();

  // Show nothing while checking session to prevent flickers
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#0B0F14] flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-[#00D1FF]/20 border-t-[#00D1FF] rounded-full animate-spin" />
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
