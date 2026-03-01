'use client';

import { useSession } from 'next-auth/react';
import LandingPage from '@/components/LandingPage';
import Dashboard from '@/components/Dashboard';

export default function Home() {
  const { data: session, status } = useSession();

  // Show nothing while checking session to prevent flickers
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#0B0F14] flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-[#00D1FF]/20 border-t-[#00D1FF] rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return <LandingPage />;
  }

  return <Dashboard />;
}
