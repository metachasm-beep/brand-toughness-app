'use client';
import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';
import { GuestAuditProvider } from '@/context/GuestAuditContext';

export default function Providers({ children }: { children: ReactNode }) {
    return (
        <SessionProvider>
            <GuestAuditProvider>
                {children}
            </GuestAuditProvider>
        </SessionProvider>
    );
}
