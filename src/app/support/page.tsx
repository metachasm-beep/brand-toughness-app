'use client';

import DashboardShell from '@/components/DashboardShell';

export default function SupportPage() {
    return (
        <DashboardShell>
            <div className="p-10 text-white min-h-screen">
                <h1 className="text-7xl font-extrabold tracking-tighter mb-8">Support</h1>
                <div className="apple-card p-10">
                    <p className="text-white/40 font-medium">Access diagnostic documentation and initiate direct support links.</p>
                </div>
            </div>
        </DashboardShell>
    );
}
