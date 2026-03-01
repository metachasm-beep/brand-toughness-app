'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';

interface DiagnosticOrbitProps {
    scores: number[];
    labels?: string[];
    overallScore: number | string;
}

export default function DiagnosticOrbit({ scores, labels, overallScore }: DiagnosticOrbitProps) {
    const defaultLabels = ['Market', 'Technical', 'Security', 'Innovation', 'Customer', 'Content'];
    const displayLabels = labels || defaultLabels;

    const getColor = (s: number) => {
        if (s >= 80) return '#30D158';
        if (s >= 60) return '#FF9F0A';
        return '#FF453A';
    };

    const orbitLines = [0.4, 0.6, 0.8, 1.0];

    const points = useMemo(() => {
        const n = scores.length;
        return scores.map((s, i) => {
            const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
            const radius = 0.4 + (s / 100) * 0.6; // Scale from 40% to 100% of container
            return {
                x: Math.cos(angle) * radius,
                y: Math.sin(angle) * radius,
                label: displayLabels[i],
                score: s,
                color: getColor(s)
            };
        });
    }, [scores, displayLabels]);

    return (
        <div className="relative w-full aspect-square flex items-center justify-center p-10">
            {/* Background Orbits */}
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

            {/* Axis Lines */}
            {points.map((p, i) => (
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

            {/* Connection Polygon */}
            <svg viewBox="-1.2 -1.2 2.4 2.4" className="absolute inset-0 w-full h-full drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                <path
                    d={`M ${points[0].x} ${points[0].y} ${points.map(p => `L ${p.x} ${p.y}`).join(' ')} Z`}
                    fill="rgba(10, 132, 255, 0.05)"
                    stroke="rgba(255, 255, 255, 0.3)"
                    strokeWidth="0.01"
                    className="transition-all duration-1000"
                />
                {points.map((p, i) => (
                    <circle
                        key={i}
                        cx={p.x} cy={p.y} r="0.04"
                        fill={p.color}
                        className="transition-all duration-1000 shadow-[0_0_10px_white]"
                    />
                ))}
            </svg>

            {/* Overall Score Center */}
            <div className="relative z-10 flex flex-col items-center justify-center">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-7xl xl:text-8xl font-black tracking-tighter text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]"
                >
                    {overallScore}
                </motion.div>
                <div className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 mt-2">Integrity Composite</div>
            </div>

            {/* Floating Labels */}
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
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{p.label}</span>
                    <span className="text-sm font-bold text-white">{p.score}</span>
                </motion.div>
            ))}
        </div>
    );
}
