'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';

interface DiagnosticOrbitProps {
    scores: number[];
    labels?: string[];
    overallScore: number | string;
}

export default function DiagnosticOrbit({ scores, labels, overallScore }: DiagnosticOrbitProps) {
    const defaultLabels = ['Clarity', 'Consistency', 'Differentiation', 'Emotional', 'Resonance', 'CTA Strength'];
    const displayLabels = labels || defaultLabels;

    const getColor = (s: number) => {
        if (s >= 80) return '#FF3D57';
        if (s >= 60) return '#E31B23';
        return '#CC0000';
    };

    const orbitLines = [0.4, 0.6, 0.8, 1.0];

    const points = useMemo(() => {
        const n = scores.length;
        return scores.map((s, i) => {
            const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
            const radius = 0.4 + (s / 10) * 0.06; // Scale from 40% to 100% of container (scores are 0-10)
            return {
                x: Math.cos(angle) * (radius > 1 ? 1 : radius),
                y: Math.sin(angle) * (radius > 1 ? 1 : radius),
                label: displayLabels[i],
                score: s,
                color: getColor(s * 10)
            };
        });
    }, [scores, displayLabels]);

    return (
        <div className="relative w-full aspect-square flex items-center justify-center p-12 select-none group">
            {/* Background Orbits */}
            {orbitLines.map((r, i) => (
                <div
                    key={i}
                    className="absolute rounded-full border border-white/5 pointer-events-none transition-all duration-700 group-hover:border-white/10"
                    style={{
                        width: `${r * 100}%`,
                        height: `${r * 100}%`,
                        opacity: 1 - i * 0.2
                    }}
                />
            ))}

            {/* Axis Lines */}
            {points.map((p, i) => (
                <div
                    key={`axis-${i}`}
                    className="absolute h-px bg-white/5 origin-left pointer-events-none group-hover:bg-white/10 transition-colors"
                    style={{
                        width: '50%',
                        left: '50%',
                        top: '50%',
                        transform: `rotate(${(i / points.length) * 360 - 90}deg)`
                    }}
                />
            ))}

            {/* Connection Polygon */}
            <svg viewBox="-1.2 -1.2 2.4 2.4" className="absolute inset-0 w-full h-full drop-shadow-[0_0_50px_rgba(0,209,255,0.15)] overflow-visible">
                <path
                    d={`M ${points[0].x} ${points[0].y} ${points.map(p => `L ${p.x} ${p.y}`).join(' ')} Z`}
                    fill="rgba(255, 61, 87, 0.08)"
                    stroke="rgba(255, 61, 87, 0.5)"
                    strokeWidth="0.015"
                    className="transition-all duration-1000 ease-out"
                />
                {points.map((p, i) => (
                    <circle
                        key={i}
                        cx={p.x} cy={p.y} r="0.045"
                        fill={p.color}
                        className="transition-all duration-1000"
                        style={{ filter: `drop-shadow(0 0 8px ${p.color})` }}
                    />
                ))}
            </svg>

            {/* Overall Score Center */}
            <div className="relative z-10 flex flex-col items-center justify-center">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-8xl xl:text-[10rem] font-black font-display tracking-tighter text-white neon-text-purple"
                >
                    {overallScore}
                </motion.div>
                <div className="surgical-label !text-[#FF3D57] !opacity-100 !tracking-[0.4em] mt-2 group-hover:scale-110 transition-transform">BRAND AUTHORITY</div>
            </div>

            {/* Floating Labels */}
            {points.map((p, i) => (
                <motion.div
                    key={`label-${i}`}
                    className="absolute flex flex-col items-center pointer-events-none"
                    style={{
                        left: `${50 + p.x * 58}%`,
                        top: `${50 + p.y * 58}%`,
                        transform: 'translate(-50%, -50%)'
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                >
                    <span className="surgical-label text-[9px] !text-white/40 group-hover:!text-white transition-colors">{p.label}</span>
                    <span className="text-base font-black font-display text-white">{p.score}</span>
                </motion.div>
            ))}
        </div>
    );
}
