import './globals.css';
import { ReactNode } from 'react';
import Providers from '@/components/Providers';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

export const metadata = {
  title: 'Brand Intelligence | Resilience Platform',
  description: 'Spatial Diagnostic Platform for Brand Resilience by Turtle Labs',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="theme-space">
      <head />
      <body className="flex min-h-screen bg-black text-white selection:bg-white selection:text-black">
        <Providers>
          <div className="flex w-full h-screen overflow-hidden relative">
            {/* Background ambient glows */}
            <div className="pointer-events-none absolute top-0 left-1/3 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(10,132,255,0.06)_0%,transparent_70%)] z-0" />
            <div className="pointer-events-none absolute bottom-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(255,255,255,0.03)_0%,transparent_70%)] z-0" />

            {/* Sidebar */}
            <div className="w-[280px] h-full flex-shrink-0 z-40 relative">
              <Sidebar />
            </div>

            {/* Main scrollable area */}
            <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto relative z-10">
              <Header />
              <main className="flex-1 px-10 pb-20">
                {children}
              </main>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
