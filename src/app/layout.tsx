export const dynamic = 'force-dynamic';

import './globals.css';
import { ReactNode } from 'react';
import Providers from '@/components/Providers';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Force-dynamic build optimization
export const metadata = {
  title: 'BRAND OS | Diagnostic Intelligence',
  description: 'Brand Perception & Performance Intelligence System',
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  let session = null;

  try {
    session = await getServerSession(authOptions);
  } catch (error: any) {
    console.error("NextAuth Initialization Error:", error);
  }

  return (
    <html lang="en" className="theme-space scroll-smooth">
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&display=swap" />
      </head>
      <body className="min-h-screen bg-[#0B0F14] text-white selection:bg-[#00D1FF] selection:text-black antialiased font-sans">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
