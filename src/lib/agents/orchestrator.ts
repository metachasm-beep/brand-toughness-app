import { runPlanner } from './planner';
import { runAestheticReviewer } from './aesthetic';
import { runMessagingAuditor } from './messaging';
import { BrandData } from '../audit/brandEngine';
import { recallKnowledge, learnKnowledge } from './knowledge';
import { orchestrateAutonomousGrowth } from './growth';
import { runRemediator } from './remediator';
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

        console.log('[Orchestrator] Step 1: Neural Diagnostics (v3.0 Resilient Pipeline)...');
        try {
            // High-fidelity parallel agent execution
            const plannerResult = await runPlanner(brand.url, `${cleanRawText}\n\n[PAST INTELLIGENCE]: ${pastContext}`);
            if (!plannerResult.success) throw new Error('Planning failed: ' + plannerResult.error);

            const shards = plannerResult.data.shards;
            const visualShard = shards.find((s: any) => s.id === 'visual') || shards[0];
            const messagingShard = shards.find((s: any) => s.id === 'messaging') || shards[1];

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
            const synthesis: any = {
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
                    healFactor: 0
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
                originalMessaging: messaging,
                remediationSolutions: []
            };

            // v3.0: Strategic Learn & Heal (Best Effort)
            try {
                // Learn
                await learnKnowledge(
                    brand.url, 
                    userEmail, 
                    'STRATEGIC', 
                    `Audit Complete. Core Authority: ${synthesis.aggregate}. Identity: ${synthesis.brandIntelligence.positioning}`, 
                    { scores: synthesis.scores, aggregate: synthesis.aggregate },
                    synthesis.extracted
                );

                // Shadows & Heal Factor
                const vault = await prisma.brandVault.findUnique({
                    where: { domain_userEmail: { domain: brand.url, userEmail } }
                });

                if (vault) {
                    console.log('[Orchestrator] Step 4: Autonomous Growth Shadows...');
                    const growth = await orchestrateAutonomousGrowth(vault.id);
                    synthesis.scores.marketResonance = growth.resonanceScore;
                    synthesis.brandIntelligence.growthCatalysts = growth.catalysts;
                }

                console.log('[Orchestrator] Step 5: Neural Healing (Generative Fixes)...');
                const remediation = await runRemediator(
                    visual.visualGaps, 
                    messaging.communicationGaps, 
                    brand.url
                );

                if (remediation.success) {
                    synthesis.remediationSolutions = remediation.data.solutions;
                    synthesis.scores.healFactor = remediation.data.overallAuthorityHeal;
                }

            } catch (e) {
                console.warn('[Orchestrator] Secondary synthesis (Learn/Heal) degraded silently.');
            }

            return synthesis;

        } catch (error: any) {
            console.error('[Orchestrator] Diagnostic critical failure:', error.message);
            // v3.0 Resilience: Return a 'Safe Failure' object so UI still renders something coherent
            return {
                extracted: { coreOffering: 'Discovery in progress...', valueProps: [] },
                scores: { clarity: 1, consistency: 1, differentiation: 1, emotionalImpact: 1, marketResonance: 0 },
                brandIntelligence: { positioning: 'Intelligence Stream Interrupted', priorityFixes: ['Retry connectivity'], trustGaps: [], conversionGaps: [] },
                aggregate: 0,
                remediationSolutions: []
            };
        }

    } catch (error: any) {
        console.error('[Orchestrator] Critical failure:', error.message);
        throw error;
    }
}
