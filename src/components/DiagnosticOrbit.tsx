'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';

interface DiagnosticOrbitProps {
    scores?: number[];
    labels?: string[];
    overallScore?: number | string;
}

export default function DiagnosticOrbit({
    scores = [],
    labels,
    overallScore = 0
}: DiagnosticOrbitProps) {
    const defaultLabels = ['Market', 'Technical', 'Security', 'Innovation', 'Customer', 'Content'];

    const safeScores = useMemo(() => {
        const normalized = Array.isArray(scores) ? scores : [];
        const sliced = normalized.slice(0, 6).map((value) => {
            const n = Number(value);
            if (!Number.isFinite(n)) return 0;
            return Math.max(0, Math.min(100, n));
        });

        while (sliced.length < 6) {
            sliced.push(0);
        }

        return sliced;
    }, [scores]);

    const displayLabels = useMemo(() => {
        const source = Array.isArray(labels) && labels.length ? labels : defaultLabels;
        const sliced = source.slice(0, 6);

        while (sliced.length < 6) {
            sliced.push(defaultLabels[sliced.length] || `Metric ${sliced.length + 1}`);
        }

        return sliced;
    }, [labels]);

    const safeOverallScore = useMemo(() => {
        const n = Number(overallScore);
        if (!Number.isFinite(n)) return '0.0';
        return n.toFixed(1);
    }, [overallScore]);

    const getColor = (s: number) => {
        if (s >= 80) return '#00E28A';
        if (s >= 60) return '#00D1FF';
        return '#FF3D57';
    };

    const orbitLines = [0.4, 0.6, 0.8, 1.0];

    const points = useMemo(() => {
        const n = safeScores.length || 6;

        return safeScores.map((s, i) => {
            const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
            const radius = 0.4 + (s / 100) * 0.6;

            return {
                x: Math.cos(angle) * radius,
                y: Math.sin(angle) * radius,
                label: displayLabels[i] || `Metric ${i + 1}`,
                score: s,
                color: getColor(s)
            };
        });
    }, [safeScores, displayLabels]);

    const polygonPath = useMemo(() => {
        if (!points.length) return '';

        const first = points[0];
        const rest = points.slice(1).map((p) => `L ${p.x} ${p.y}`).join(' ');
        return `M ${first.x} ${first.y} ${rest} Z`;
    }, [points]);

    return (
        <div className="relative w-full aspect-square flex items-center justify-center p-10 select-none">
            {orbitLines.map((r, i) => (
                <div
                    key={i}
                    className="absolute rounded-full border border-white/5 pointer-events-none"
                    style={{
                        width: `${r * 100}%`,
                        height: `${r * 100}%`,
                        opacity: 1 - i * 0.15
                    }}
                />
            ))}

            {points.map((_, i) => (
                <div
                    key={`axis-${i}`}
                    className="absolute h-px bg-white/5 origin-left pointer-events-none"
                    style={{
                        width: '50%',
                        left: '50%',
                        top: '50%',
                        transform: `rotate(${(i / points.length) * 360 - 90}deg)`
                    }}
                />
            ))}

            <svg
                viewBox="-1.2 -1.2 2.4 2.4"
                className="absolute inset-0 w-full h-full drop-shadow-[0_0_30px_rgba(0,209,255,0.1)]"
            >
                {polygonPath && (
                    <path
                        d={polygonPath}
                        fill="rgba(0, 209, 255, 0.05)"
                        stroke="rgba(0, 209, 255, 0.4)"
                        strokeWidth="0.01"
                        className="transition-all duration-1000"
                    />
                )}

                {points.map((p, i) => (
                    <circle
                        key={i}
                        cx={p.x}
                        cy={p.y}
                        r="0.04"
                        fill={p.color}
                        className="transition-all duration-1000"
                        style={{ filter: `drop-shadow(0 0 5px ${p.color})` }}
                    />
                ))}
            </svg>

            <div className="relative z-10 flex flex-col items-center justify-center">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-7xl xl:text-9xl font-black font-display tracking-tighter text-white drop-shadow-[0_0_40px_rgba(0,209,255,0.3)]"
                >
                    {safeOverallScore}
                </motion.div>
                <div className="surgical-label !text-white/40 mt-2">Integrity Composite</div>
            </div>

            {points.map((p, i) => (
                <motion.div
                    key={`label-${i}`}
                    className="absolute flex flex-col items-center pointer-events-none"
                    style={{
                        left: `${50 + p.x * 55}%`,
                        top: `${50 + p.y * 55}%`,
                        transform: 'translate(-50%, -50%)'
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                >
                    <span className="surgical-label text-[8px] !text-white/40">{p.label}</span>
                    <span className="text-sm font-black font-display text-white">
                        {p.score.toFixed(1)}
                    </span>
                </motion.div>
            ))}
        </div>
    );
}
