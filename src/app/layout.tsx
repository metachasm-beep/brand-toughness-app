import './globals.css';
import { ReactNode } from 'react';
import Providers from '@/components/Providers';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getCloudflareContext } from '@opennextjs/cloudflare';

export const metadata = {
  title: 'BRAND OS | Diagnostic Intelligence',
  description: 'Brand Perception & Performance Intelligence System',
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  let session = null;
  let authError = null;
  let cfEnvKeys: string[] = [];

  try {
    const { env } = await getCloudflareContext();
    cfEnvKeys = Object.keys(env);

    // Manually shim process.env if OpenNext failed to do so
    if (env && typeof env === 'object') {
      Object.entries(env).forEach(([k, v]) => {
        if (v && typeof v === 'string' && !process.env[k]) {
          process.env[k] = v;
        }
      });
    }

    session = await getServerSession(authOptions);
  } catch (error: any) {
    console.error("NextAuth Initialization Error:", error);
    authError = error.message;
  }

  return (
    <html lang="en" className="theme-space scroll-smooth">
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&display=swap" />
      </head>
      <body className="min-h-screen bg-[#0B0F14] text-white selection:bg-[#00D1FF] selection:text-black antialiased font-sans">
        <Providers>
          {authError ? (
            <main className="w-full flex items-center justify-center min-h-screen text-center p-10 flex-col">
              <h1 className="text-3xl text-red-500 font-bold mb-4">Configuration Error</h1>
              <p className="text-white/70 max-w-lg mb-6">{authError}</p>
              <div className="bg-white/5 border border-white/10 p-6 rounded-xl text-left text-sm text-white/50 max-w-lg mb-6">
                <p className="mb-2"><strong>Likely causes:</strong></p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Missing <code className="text-white">NEXTAUTH_SECRET</code> in Cloudflare variables.</li>
                  <li>Missing <code className="text-white">NEXTAUTH_URL</code> in Cloudflare variables.</li>
                  <li>Incompatible deployment environment (e.g., missing nodejs_compat).</li>
                </ul>
              </div>
              <div className="bg-black/50 p-4 rounded-lg border border-red-500/30 text-left text-xs text-red-400 font-mono w-full max-w-lg overflow-hidden">
                <p className="font-bold text-white mb-2">LIVE ENVIRONMENT DIAGNOSTICS:</p>
                <p>NEXTAUTH_SECRET: {process.env.NEXTAUTH_SECRET ? '✅ Set (Hidden)' : '❌ MISSING'}</p>
                <p>NEXTAUTH_URL: {process.env.NEXTAUTH_URL ? `✅ ${process.env.NEXTAUTH_URL}` : '❌ MISSING'}</p>
                <p>NODE_ENV: {process.env.NODE_ENV}</p>
                <p className="mt-2 text-white/30 truncate">Process Keys: {Object.keys(process.env).join(', ')}</p>
                <p className="mt-1 text-white/30 truncate">Cloudflare Keys: {cfEnvKeys.join(', ')}</p>
              </div>
            </main>
          ) : !session ? (
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
