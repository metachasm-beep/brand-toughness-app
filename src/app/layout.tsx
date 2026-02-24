'use client';

import './globals.css';
import { ReactNode, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

export default function RootLayout({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<'silver' | 'space'>('space');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('tt-theme') as 'silver' | 'space' | null;
    if (saved) {
      setTheme(saved);
      document.documentElement.className = `theme-${saved}`;
    } else {
      document.documentElement.className = `theme-space`;
    }
  }, []);

  return (
    <html lang="en" className={`theme-${theme}`}>
      <head>
        <title>Brand Intelligence | Resilience Platform</title>
        <meta name="description" content="Spatial Diagnostic Platform for Brand Resilience" />
      </head>
      <body className="flex min-h-screen bg-black text-white selection:bg-white selection:text-black">
        {!mounted ? (
          <div className="bg-black h-screen w-screen flex items-center justify-center">
            <div className="text-white/20 animate-pulse font-bold tracking-widest text-sm uppercase">Loading Spatial Data</div>
          </div>
        ) : (
          <div className="flex w-full h-screen overflow-hidden relative">
            {/* Background Mesh Glows */}
            <div className="glow-mesh top-0 left-1/4 opacity-40 translate-x-[-50%] translate-y-[-50%]" />
            <div className="glow-mesh bottom-0 right-0 opacity-20 translate-x-[30%] translate-y-[30%]" />

            {/* Sidebar with Apple Vision styling */}
            <div className="w-[300px] h-full flex-shrink-0 z-50">
              <Sidebar />
            </div>

            {/* Main scrollable canvas */}
            <div className="flex-1 flex flex-col min-w-0 h-full relative overflow-y-auto">
              <Header />

              <main className="flex-1 px-10 pb-20">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={theme}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {children}
                  </motion.div>
                </AnimatePresence>
              </main>
            </div>
          </div>
        )}
      </body>
    </html>
  );
}
