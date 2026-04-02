'use client';

import { useState, useEffect } from 'react';

/**
 * [useAuditSession v3.0]
 * A high-fidelity hook for synchronizing the active audit session across 
 * various 'Neural Shard' sub-pages (Authority, Messaging, etc.) via LocalStorage.
 */
export function useAuditSession() {
    const [auditData, setAuditData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const syncSession = () => {
            if (typeof window === 'undefined') return;
            
            try {
                const stored = localStorage.getItem('brandos_active_audit');
                if (stored) {
                    setAuditData(JSON.parse(stored));
                }
            } catch (e) {
                console.error('[Session Sync] Failed to parse audit data', e);
            } finally {
                setLoading(false);
            }
        };

        syncSession();

        // Listen for storage changes in other tabs/shards
        window.addEventListener('storage', syncSession);
        return () => window.removeEventListener('storage', syncSession);
    }, []);

    const clearSession = () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('brandos_active_audit');
            setAuditData(null);
        }
    };

    return { auditData, loading, clearSession };
}
