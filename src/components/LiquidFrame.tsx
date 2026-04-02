'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface LiquidFrameProps extends React.PropsWithChildren {
    className?: string;
    showShimmer?: boolean;
    borderColor?: string;
}

/**
 * LiquidFrame: The core visual primitive for BrandOS AI v2.0.
 * Implements refractive glass, dynamic shimmer borders, and tactical tints.
 */
export default function LiquidFrame({ 
    children, 
    className = '', 
    showShimmer = true,
    borderColor = 'rgba(255, 61, 87, 0.2)'
}: LiquidFrameProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`
                liquid-glass 
                group 
                rounded-[32px] 
                transition-all 
                duration-500 
                hover:bg-black/40 
                ${className}
            `}
            style={{ borderColor } as any}
        >
            {/* Neural Highlight Layer */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#FF3D57]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            
            {/* Production-Safe Shimmer Border (Framer Motion) */}
            {showShimmer && (
                <motion.div
                    className="absolute inset-0 rounded-[inherit] pointer-events-none opacity-0 group-hover:opacity-40 transition-opacity duration-500"
                    style={{
                        padding: '1px',
                        background: `linear-gradient(var(--shimmer-deg, 0deg), transparent, #FF3D57, transparent)`,
                        WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                        WebkitMaskComposite: 'xor',
                        maskComposite: 'exclude',
                    } as any}
                    animate={{
                        '--shimmer-deg': ['0deg', '360deg']
                    } as any}
                    transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                />
            )}

            <div className="relative z-10">
                {children}
            </div>
        </motion.div>
    );
}
