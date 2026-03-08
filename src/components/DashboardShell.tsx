'use client';

import { ReactNode } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

export default function DashboardShell({ children }: { children: ReactNode }) {
    return (
        <div className="flex w-full h-screen overflow-hidden relative">
            {/* Background ambient glows */}
            <div className="pointer-events-none absolute top-0 left-1/3 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(0,209,255,0.05)_0%,transparent_70%)] z-0" />
            <div className="pointer-events-none absolute bottom-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(123,92,255,0.03)_0%,transparent_70%)] z-0" />

            {/* Sidebar */}
            <div className="w-[280px] h-full flex-shrink-0 z-40 relative">
                <Sidebar />
            </div>

            {/* Main scrollable area */}
            <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto relative z-10 glass-scrollbar">
                <Header />
                <main className="flex-1 px-10 pb-20">
                    {children}
                </main>
            </div>
        </div>
    );
}
