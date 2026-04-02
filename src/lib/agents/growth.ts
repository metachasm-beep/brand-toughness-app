import { prisma } from '../db';
import { BrandEngine } from '../audit/brandEngine';
import { callCohere } from './client';

export interface GrowthResult {
    catalysts: any[];
     resonanceScore: number;
}

/**
 * Growth Orchestrator (v2.0): Proactive Intelligence Layer.
 * Shadows competitors and generates actionable Growth Shards.
 */
export async function orchestrateAutonomousGrowth(vaultId: string): Promise<GrowthResult> {
    try {
        const vault = await prisma.brandVault.findUnique({
            where: { id: vaultId },
            include: { competitors: true }
        });

        if (!vault || vault.competitors.length === 0) {
            return { catalysts: [], resonanceScore: 0 };
        }

        const catalysts: any[] = [];
        let totalResonance = 0;

        for (const competitor of vault.competitors) {
            console.log(`[GrowthAgent] Shadowing Competitor: ${competitor.url}`);
            
            // 1. Competitive Scan
            const engine = new BrandEngine(competitor.url);
            const compData = await engine.scan();

            // 2. Comparative Analysis (User vs Competitor)
            const prompt = `
                COMPARE my brand against a competitor to find differentiation gaps.
                
                MY BRAND IDENTITY (VAULT):
                ${JSON.stringify(vault.evolvingContext)}

                COMPETITOR DATA:
                ${JSON.stringify(compData)}

                TASK:
                1. Identify one specific THREAT or OPPORTUNITY.
                2. Calculate a "Resonance Score" (0-100) for the competitor.
                3. Return JSON: { "type": "OPPORTUNITY" | "THREAT" | "DRIFT", "title": string, "description": string, "resonance": number }
            `;

            const analysis = await callCohere(prompt);
            
            // 3. Register Catalyst
            const catalyst = await prisma.growthCatalyst.create({
                data: {
                    vaultId: vault.id,
                    type: analysis.type,
                    title: analysis.title,
                    description: analysis.description,
                    confidence: 0.85
                }
            });

            catalysts.push(catalyst);
            totalResonance += (analysis.resonance || 50);
            
            // Update lastScanned
            await prisma.competitor.update({
                where: { id: competitor.id },
                data: { lastScanned: new Date() }
            });
        }

        return {
            catalysts,
            resonanceScore: Math.round(totalResonance / vault.competitors.length)
        };

    } catch (e) {
        console.error('Autonomous Growth failed:', e);
        return { catalysts: [], resonanceScore: 0 };
    }
}
