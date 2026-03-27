import './globals.css';
import { ReactNode } from 'react';
import Providers from '@/components/Providers';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const metadata = {
  title: 'WEB OS | Diagnostic Intelligence',
  description: 'Web Performance & Diagnostic Intelligence System',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="theme-space scroll-smooth" suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&display=swap" />
      </head>
      <body className="min-h-screen bg-[#0B0F14] text-white selection:bg-[#00D1FF] selection:text-black antialiased font-sans overflow-x-hidden" suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
