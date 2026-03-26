'use client';

import { ReactNode } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

export default function DashboardShell({ children }: { children: ReactNode }) {
    return (
        <div className="flex w-full h-screen overflow-hidden relative bg-[#0B0F14]">
            {/* Background Neural Overlay */}
            <div className="fixed inset-0 neural-grid opacity-30 pointer-events-none z-0" />
            <div className="fixed inset-0 glow-mesh opacity-40 pointer-events-none z-0" />

            {/* Sidebar */}
            <div className="w-80 h-full flex-shrink-0 z-40 relative">
                <Sidebar />
            </div>

            {/* Main scrollable area */}
            <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto relative z-10 glass-scrollbar">
                <Header />
                <main className="flex-1 px-10 pb-20 pt-10">
                    {children}
                </main>
            </div>
        </div>
    );
}
