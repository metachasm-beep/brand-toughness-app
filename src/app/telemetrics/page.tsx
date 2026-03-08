'use client';

import DashboardShell from '@/components/DashboardShell';

export default function TelemetricsPage() {
    return (
        <DashboardShell>
            <div className="p-10 text-white min-h-screen">
                <h1 className="text-7xl font-extrabold tracking-tighter mb-8">Telemetrics</h1>
                <div className="apple-card p-10">
                    <p className="text-white/40 font-medium">Raw data streams and real-time connectivity logs.</p>
                </div>
            </div>
        </DashboardShell>
    );
}
