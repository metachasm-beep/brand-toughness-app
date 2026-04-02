'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useMemo } from 'react';

/**
 * [BrandAura v3.0]
 * A generative, refractive visual engine that reacts to brand authority scores.
 * Density, motion speed, and color-shifting are mapped to diagnostic resonance.
 */
interface BrandAuraProps {
    scores: {
        clarity: number;
        consistency: number;
        differentiation: number;
        emotionalImpact: number;
        marketResonance: number;
        healFactor: number;
    };
    aggregate: number;
}

export default function BrandAura({ scores, aggregate }: BrandAuraProps) {
    // Generate 20-40 "Neural Nodes" based on aggregate authority
    const particleCount = useMemo(() => Math.floor(20 + (aggregate / 100) * 20), [aggregate]);
    
    const particles = useMemo(() => {
        return Array.from({ length: particleCount }).map((_, i) => ({
            id: i,
            size: Math.random() * 300 + 100,
            x: Math.random() * 100,
            y: Math.random() * 100,
            duration: 15 + Math.random() * 20 - (aggregate / 20), // Faster if higher score
            opacity: 0.03 + (Math.random() * 0.07),
        }));
    }, [particleCount, aggregate]);

    // Color mapping: High Authority = Red shifting to Silver/White; Low = Deep Crimson/Black
    const auraColor = useMemo(() => {
        if (aggregate >= 80) return 'rgba(255, 61, 87, 0.15)';
        if (aggregate >= 60) return 'rgba(227, 27, 35, 0.1)';
        return 'rgba(150, 0, 0, 0.08)';
    }, [aggregate]);

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            <div className="absolute inset-0 bg-[#0B0F14]" />
            
            <AnimatePresence>
                {particles.map((p) => (
                    <motion.div
                        key={p.id}
                        className="absolute rounded-full blur-[100px]"
                        style={{
                            width: p.size,
                            height: p.size,
                            left: `${p.x}%`,
                            top: `${p.y}%`,
                            background: auraColor,
                            opacity: p.opacity,
                        }}
                        animate={{
                            x: [0, Math.random() * 100 - 50, 0],
                            y: [0, Math.random() * 100 - 50, 0],
                            scale: [1, 1.2, 1],
                        }}
                        transition={{
                            duration: p.duration,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                    />
                ))}
            </AnimatePresence>

            {/* Neural Mesh Overlay */}
            <svg className="absolute inset-0 w-full h-full opacity-10">
                <defs>
                    <pattern id="neural-grid" width="50" height="50" patternUnits="userSpaceOnUse">
                        <path d="M 50 0 L 0 0 0 50" fill="none" stroke="white" strokeWidth="0.5" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#neural-grid)" />
            </svg>
            
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F14] via-transparent to-[#0B0F14]/40" />
        </div>
    );
}

