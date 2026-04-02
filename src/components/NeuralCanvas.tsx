'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Layers, Rocket, Command, Trash2, Maximize2 } from 'lucide-react';
import BrandAura from './BrandAura';

/**
 * [NeuralCanvas v3.0 - THE SANDBOX]
 * A generative identity space where brand remediations are previewed live.
 * It integrates the 'BrandAura' visual and a 'Component Sandbox' to render 
 * AI-generated Tailwind fixes in real-time.
 */
interface NeuralCanvasProps {
    solutions: any[];
    scores: any;
    aggregate: number;
}

export default function NeuralCanvas({ solutions, scores, aggregate }: NeuralCanvasProps) {
    const [selectedSolution, setSelectedSolution] = useState<any>(solutions[0] || null);

    return (
        <div className="relative w-full aspect-[16/9] rounded-[48px] overflow-hidden border border-white/5 bg-black group shadow-pro">
            {/* Visual Aura Layer */}
            <BrandAura scores={scores} aggregate={aggregate} />

            <div className="absolute inset-0 z-10 flex flex-col p-10">
                {/* Header Information */}
                <div className="flex items-center justify-between pointer-events-none">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                             <div className="w-1.5 h-1.5 rounded-full bg-[#FF3D57] animate-pulse" />
                             <span className="text-[10px] font-black uppercase tracking-widest text-[#FF3D57]">Generative Identity Sandbox</span>
                        </div>
                        <h2 className="text-4xl font-black font-display tracking-tight text-white uppercase leading-none">Neural Canvas</h2>
                        <p className="text-white/20 text-xs mt-3 uppercase tracking-widest font-black">Refractive Authority Discovery · v3.0</p>
                    </div>
                </div>

                <div className="flex-1 flex gap-10 mt-12 overflow-hidden">
                    {/* Solution Selector Shards */}
                    <div className="w-80 flex flex-col gap-4 overflow-y-auto no-scrollbar pr-4">
                        {solutions.map((s, i) => (
                            <button
                                key={i}
                                onClick={() => setSelectedSolution(s)}
                                className={`p-6 rounded-3xl border transition-all text-left group/shard ${
                                    selectedSolution?.id === s.id 
                                    ? 'bg-white/10 border-[#FF3D57]/40 shadow-inner' 
                                    : 'bg-white/5 border-white/5 hover:border-white/20'
                                }`}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-[#FF3D57]">{s.type}</span>
                                    <span className="text-[8px] font-mono text-white/20 uppercase tracking-widest">{s.impact}</span>
                                </div>
                                <h3 className="text-sm font-black text-white/80 line-clamp-2 leading-tight uppercase group-hover/shard:text-white transition-colors">{s.problem}</h3>
                            </button>
                        ))}
                    </div>

                    {/* Live Preview & Remediation Frame */}
                    <div className="flex-1 rounded-[40px] apple-glass border-white/10 relative overflow-hidden group/canvas">
                        <AnimatePresence mode="wait">
                            {selectedSolution ? (
                                <motion.div
                                    key={selectedSolution.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="absolute inset-0 flex items-center justify-center p-12"
                                >
                                    <div className="text-center w-full max-w-2xl">
                                        <div className="mb-10 pointer-events-none">
                                            <p className="text-[#FF3D57] font-black uppercase text-[9px] tracking-widest mb-4">Neural Remediation Strategy</p>
                                            <p className="text-white/40 text-sm font-medium italic leading-relaxed">"{selectedSolution.solution}"</p>
                                        </div>

                                        {/* Component Sanitization Layer (Proto v3.0) */}
                                        <div className="relative group/preview shadow-pro">
                                            <div className="absolute -inset-1 bg-gradient-to-r from-[#FF3D57]/20 to-[#00D1FF]/20 rounded-[42px] blur-xl opacity-0 group-hover/preview:opacity-100 transition-all duration-700" />
                                            <div className="relative overflow-hidden rounded-[40px] border border-white/10 bg-[#0B0F14]/60 backdrop-blur-3xl animate-hover-lift">
                                                {/* Header for the Frame */}
                                                <div className="flex items-center justify-between px-8 py-4 border-b border-white/5 bg-white/5 pointer-events-none">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 rounded-full bg-white/20" />
                                                        <div className="w-2 h-2 rounded-full bg-white/20" />
                                                        <div className="w-2 h-2 rounded-full bg-white/20" />
                                                    </div>
                                                    <span className="text-[9px] text-white/20 font-black tracking-widest uppercase">Sandboxed Component Framework</span>
                                                </div>

                                                {/* Actual LIVE RENDERER */}
                                                <div className="p-12 min-h-[300px] flex items-center justify-center">
                                                     {/* Safety: Rendering AI suggestions in v3.0 */}
                                                     <div 
                                                        className={`w-full transition-all duration-1000 ${selectedSolution.codeSnippet || ''}`}
                                                        dangerouslySetInnerHTML={{ __html: selectedSolution.previewMarkup || '<p class="text-white/20 uppercase font-black tracking-widest">No visual preview available.</p>' }}
                                                     />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <p className="surgical-label !text-white/20 tracking-widest">Awaiting Solution Selection</p>
                                </div>
                            )}
                        </AnimatePresence>

                        {/* Controls Bottom Right */}
                        <div className="absolute bottom-8 right-8 flex gap-3">
                            <button className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all">
                                <Maximize2 size={16} className="text-white/40" />
                            </button>
                            <button className="w-10 h-10 rounded-full bg-[#FF3D57]/20 border border-[#FF3D57]/20 flex items-center justify-center hover:bg-[#FF3D57] transition-all group">
                                <Command size={16} className="text-white group-hover:scale-110 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
