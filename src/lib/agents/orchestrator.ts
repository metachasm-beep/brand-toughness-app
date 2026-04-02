import { runPlanner } from './planner';
import { runAestheticReviewer } from './aesthetic';
import { runMessagingAuditor } from './messaging';
import { BrandData } from '../audit/brandEngine';
import { recallKnowledge, learnKnowledge } from './knowledge';
import { orchestrateAutonomousGrowth } from './growth';
import { prisma } from '../db';

export async function orchestrateBrandAudit(brand: BrandData, userEmail: string = 'guest@turtlelabs.co') {
    try {
        // High-fidelity sanitization - stripping obvious prompt-injection attempts from scrapped content
        const cleanRawText = brand.rawText
            .replace(/(ignore all previous instructions|system prompt|DAN mode|you are now)/gi, '[REDACTED_BY_GUARD]')
            .slice(0, 15000); // Token safety limit

        console.log('[Orchestrator] Step 0: Strategic Recall (Fetch Memory)...');
        let memory = null;
        try {
            memory = await recallKnowledge(brand.url, userEmail);
        } catch (e) {
            console.warn('[Orchestrator] Persistence recalled failed (Stateless Mode Active).');
        }
        const pastContext = memory ? JSON.stringify(memory.knowledgeItems) : "No previous data.";

        console.log('[Orchestrator] Step 1: Strategic Planning (Memory-Augmented)...');
        const plannerResult = await runPlanner(brand.url, `${cleanRawText}\n\n[PAST INTELLIGENCE]: ${pastContext}`);
        if (!plannerResult.success) throw new Error('Planning failed: ' + plannerResult.error);

        const shards = plannerResult.data.shards;
        const visualShard = shards.find((s: any) => s.id === 'visual') || shards[0];
        const messagingShard = shards.find((s: any) => s.id === 'messaging') || shards[1];

        console.log('[Orchestrator] Step 2: Parallel Diagnostics (Aesthetic + Messaging)...');
        const [visualResult, messagingResult] = await Promise.all([
            runAestheticReviewer(visualShard, brand.url, brand.rawText),
            runMessagingAuditor(messagingShard, brand.url, brand.rawText)
        ]);

        if (!visualResult.success || !messagingResult.success) {
            throw new Error('Specialized diagnostics failed');
        }

        const visual = visualResult.data;
        const messaging = messagingResult.data;

        // Synthesis phase: Mapping specialized results back to the unified Dashboard interface
        const synthesis = {
            extracted: {
                coreOffering: messaging.corePromise,
                targetAudience: messaging.audience || 'Unknown',
                brandTone: messaging.toneOfVoice,
                valueProps: messaging.messagingPillars,
                emotionalTriggers: visual.visualWins
            },
            scores: {
                clarity: messaging.clarityScore,
                consistency: messaging.consistencyScore,
                differentiation: visual.identityScore,
                emotionalImpact: visual.visualAuthority,
                marketResonance: 20, 
                ctaStrength: 22,    
            },
            brandIntelligence: {
                confidence: plannerResult.data.totalConfidence,
                positioning: visual.styleAnalysis,
                toneOfVoice: messaging.toneOfVoice,
                audience: messaging.audience || 'Market Broad',
                trustGaps: visual.visualGaps,
                conversionGaps: messaging.communicationGaps,
                priorityFixes: [...visual.visualGaps, ...messaging.communicationGaps].slice(0, 3),
                quickWins: visual.visualWins.slice(0, 2),
            },
            aggregate: (messaging.clarityScore + messaging.consistencyScore + visual.identityScore + visual.visualAuthority) / 4 * 4,
            originalVisual: visual,
            originalMessaging: messaging
        };

        console.log('[Orchestrator] Step 3: Strategic Learn (Update Memory)...');
        try {
            // Register this audit in the vault (best effort)
            const vault = await prisma.brandVault.findUnique({
                where: { domain_userEmail: { domain: brand.url, userEmail } }
            });

            await learnKnowledge(
                brand.url, 
                userEmail, 
                'STRATEGIC', 
                `Audit Complete. Core Authority: ${synthesis.aggregate}. Identity: ${synthesis.brandIntelligence.positioning}`, 
                { scores: synthesis.scores, aggregate: synthesis.aggregate },
                synthesis.extracted
            );

            // Optional Step 4: Autonomous Growth Resonance (only possible if DB is up)
            if (vault) {
                console.log('[Orchestrator] Step 4: Autonomous Growth Shadows...');
                const growth = await orchestrateAutonomousGrowth(vault.id);
                (synthesis.scores as any).marketResonance = growth.resonanceScore;
                (synthesis.brandIntelligence as any).growthCatalysts = growth.catalysts;
            }
        } catch (e) {
            console.error('[Orchestrator] Persistence/Growth failed. Audit result maintained (Stateless).');
        }

        return synthesis;

    } catch (error: any) {
        console.error('[Orchestrator] Critical failure:', error.message);
        throw error;
    }
}
