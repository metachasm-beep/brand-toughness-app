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

    const orbitLines = [0.28, 0.46, 0.64, 0.82];

    const points = useMemo(() => {
        const n = safeScores.length || 6;

        return safeScores.map((s, i) => {
            const angle = (i / n) * 2 * Math.PI - Math.PI / 2;

            // Reduced max radius so chart stays comfortably inside card
            const radius = 0.22 + (s / 100) * 0.50;

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
        <div className="relative w-full aspect-square flex items-center justify-center p-16 md:p-20 overflow-hidden select-none">
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
                        width: '41%',
                        left: '50%',
                        top: '50%',
                        transform: `rotate(${(i / points.length) * 360 - 90}deg)`
                    }}
                />
            ))}

            <svg
                viewBox="-1.05 -1.05 2.1 2.1"
                className="absolute inset-0 w-full h-full drop-shadow-[0_0_30px_rgba(0,209,255,0.08)]"
            >
                {polygonPath && (
                    <path
                        d={polygonPath}
                        fill="rgba(0, 209, 255, 0.05)"
                        stroke="rgba(0, 209, 255, 0.45)"
                        strokeWidth="0.01"
                        className="transition-all duration-1000"
                    />
                )}

                {points.map((p, i) => (
                    <circle
                        key={i}
                        cx={p.x}
                        cy={p.y}
                        r="0.032"
                        fill={p.color}
                        className="transition-all duration-1000"
                        style={{ filter: `drop-shadow(0 0 5px ${p.color})` }}
                    />
                ))}
            </svg>

            <div className="relative z-10 flex flex-col items-center justify-center pointer-events-none">
                <motion.div
                    initial={{ scale: 0.85, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-6xl md:text-7xl xl:text-8xl font-black font-display tracking-tighter text-white drop-shadow-[0_0_40px_rgba(0,209,255,0.25)]"
                >
                    {safeOverallScore}
                </motion.div>
                <div className="surgical-label !text-white/40 mt-2 text-center">
                    Integrity Composite
                </div>
            </div>

            {points.map((p, i) => (
                <motion.div
                    key={`label-${i}`}
                    className="absolute flex flex-col items-center text-center pointer-events-none max-w-[92px] md:max-w-[110px]"
                    style={{
                        // Pulled inward so labels stay inside the card
                        left: `${50 + p.x * 40}%`,
                        top: `${50 + p.y * 40}%`,
                        transform: 'translate(-50%, -50%)'
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.45 + i * 0.08 }}
                >
                    <span className="surgical-label text-[8px] md:text-[9px] !text-white/45 leading-tight whitespace-normal break-words">
                        {p.label}
                    </span>
                    <span className="text-xs md:text-sm font-black font-display text-white leading-none mt-1">
                        {p.score.toFixed(1)}
                    </span>
                </motion.div>
            ))}
        </div>
    );
}
