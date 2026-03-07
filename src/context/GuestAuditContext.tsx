'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface GuestAuditContextType {
    guestAuditResult: any;
    setGuestAuditResult: (result: any) => void;
}

const GuestAuditContext = createContext<GuestAuditContextType | undefined>(undefined);

export function GuestAuditProvider({ children }: { children: ReactNode }) {
    const [guestAuditResult, setGuestAuditResult] = useState<any>(null);

    return (
        <GuestAuditContext.Provider value={{ guestAuditResult, setGuestAuditResult }}>
            {children}
        </GuestAuditContext.Provider>
    );
}

export function useGuestAudit() {
    const context = useContext(GuestAuditContext);
    if (context === undefined) {
        throw new Error('useGuestAudit must be used within a GuestAuditProvider');
    }
    return context;
}
