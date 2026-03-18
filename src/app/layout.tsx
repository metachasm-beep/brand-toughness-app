import './globals.css';
import { ReactNode } from 'react';
import Providers from '@/components/Providers';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const metadata = {
  title: 'BRAND OS | Diagnostic Intelligence',
  description: 'Brand Perception & Performance Intelligence System',
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  let session = null;

  try {
    // 10-second server-side timeout for session fetching
    session = await Promise.race([
      getServerSession(authOptions),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Session Timeout')), 10000))
    ]) as any;
  } catch (error: any) {
    console.warn("[AUTH] Server-side session fetch failed or timed out:", error.message);
  }

  return (
    <html lang="en" className="theme-space scroll-smooth">
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&display=swap" />
      </head>
      <body className="min-h-screen bg-[#0B0F14] text-white selection:bg-[#00D1FF] selection:text-black antialiased font-sans">
        <Providers>
          {!session ? (
            <main className="w-full">
              {children}
            </main>
          ) : (
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
          )}
        </Providers>
      </body>
    </html>
  );
}
