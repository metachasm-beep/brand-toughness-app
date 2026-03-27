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
    "Initializing WEB OS...",
    "Syncing Web Identity...",
    "Stabilizing Telemetry Nodes..."
  ];

  // Run ONCE on mount — do NOT depend on [status] or the timer resets every auth change
  useEffect(() => {
    setMounted(true);

    // Hard timeout: after 4s, always bypass the loader regardless of auth state
    const timer = setTimeout(() => {
      console.warn('[AUTH] Session check timed out (4s). Bypassing loader.');
      setBypassAuth(true);
    }, 4000);

    // Diagnostic text rotation
    const interval = setInterval(() => {
      setDiagnosticStep(prev => (prev + 1) % diagnosticStages.length);
    }, 1200);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []); // ← EMPTY DEPS: runs once, timer is never reset

  if (!mounted || (status === 'loading' && !bypassAuth && !session)) {
    return (
      <div 
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: '#0B0F14',
          color: 'white',
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          fontFamily: 'system-ui, sans-serif'
        }}
      >
        {/* Background Atmosphere (Optional, keep if Tailwind works) */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,209,255,0.03)_0%,transparent_70%)]" />
        
        <motion.div 
          className="relative z-10 flex flex-col items-center"
          animate={{ scale: 1 }}
        >
          {/* Main Logo/Pulse */}
          <div style={{ width: '96px', height: '96px', position: 'relative', marginBottom: '48px' }}>
            <motion.div 
               style={{ position: 'absolute', inset: 0, border: '2px solid rgba(0,209,255,0.2)', borderRadius: '16px' }}
               animate={{ rotate: 360 }}
               transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            />
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#00D1FF', boxShadow: '0 0 25px #00D1FF' }} />
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={diagnosticStep}
              style={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.3em', color: 'rgba(0,209,255,0.6)', textAlign: 'center', minWidth: '200px' }}
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
