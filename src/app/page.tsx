'use client';
// page.tsx (Home)
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import LandingPage from '@/components/LandingPage';
import Dashboard from '@/components/Dashboard';
import DashboardShell from '@/components/DashboardShell';

export default function Home() {
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);
  const [bypassAuth, setBypassAuth] = useState(false);
  const [diagnosticStep, setDiagnosticStep] = useState(0);

  const diagnosticStages = [
    "Initializing Neural Link...",
    "Syncing Brand Identity...",
    "Stabilizing Telemetry Nodes..."
  ];

  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => {
      if (status === 'loading') {
        console.warn('[AUTH] Session check timed out (3s). Bypassing.');
        setBypassAuth(true);
      }
    }, 4000); 

    // Diagnostic text rotation
    const interval = setInterval(() => {
      setDiagnosticStep(prev => (prev + 1) % diagnosticStages.length);
    }, 1200);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [status]);

  if (!mounted || (status === 'loading' && !bypassAuth && !session)) {
    return (
      <div className="min-h-screen bg-[#0B0F14] flex flex-col items-center justify-center relative overflow-hidden">
        {/* Background Atmosphere */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,209,255,0.03)_0%,transparent_70%)]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#00D1FF]/5 blur-[120px] rounded-full" />
        
        <motion.div 
          className="relative z-10 flex flex-col items-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          {/* Main Logo/Pulse */}
          <div className="w-24 h-24 relative mb-12">
            <motion.div 
               className="absolute inset-0 border-2 border-[#00D1FF]/20 rounded-2xl"
               animate={{ rotate: 360 }}
               transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            />
            <motion.div 
               className="absolute inset-2 border border-[#00D1FF]/40 rounded-xl"
               animate={{ rotate: -180 }}
               transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-[#00D1FF] shadow-[0_0_25px_#00D1FF] animate-pulse" />
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={diagnosticStep}
              className="surgical-label !text-[10px] !text-[#00D1FF]/60 text-center min-w-[200px]"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.4 }}
            >
              {diagnosticStages[diagnosticStep]}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    );
  }

  if (session) {
    return (
      <DashboardShell>
        <Dashboard />
      </DashboardShell>
    );
  }

  return <LandingPage />;
}
