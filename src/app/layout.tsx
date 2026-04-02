import './globals.css';
import { ReactNode } from 'react';
import Providers from '@/components/Providers';

export const metadata = {
  title: 'BrandOS AI | Strategic Intelligence System',
  description: 'The Operating System for Modern Brands. Strategic Brand Communication & Clarity Intelligence.',
  icons: {
    icon: '/branding/brand-icon.png',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="theme-space scroll-smooth" suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&display=swap" />
      </head>
      <body className="min-h-screen bg-[#0B0F14] text-white selection:bg-[#FF3D57] selection:text-white antialiased font-sans overflow-x-hidden" suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
