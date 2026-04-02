import { runPlanner } from './planner';
import { runAestheticReviewer } from './aesthetic';
import { runMessagingAuditor } from './messaging';
import { BrandData } from '../audit/brandEngine';
import { recallKnowledge, learnKnowledge } from './knowledge';

export async function orchestrateBrandAudit(brand: BrandData, userEmail: string = 'guest@turtlelabs.co') {
    try {
        console.log('[Orchestrator] Step 0: Strategic Recall (Fetch Memory)...');
        const memory = await recallKnowledge(brand.url, userEmail);
        const pastContext = memory ? JSON.stringify(memory.knowledgeItems) : "No previous data.";

        console.log('[Orchestrator] Step 1: Strategic Planning (Memory-Augmented)...');
        // Planner now receives past learnings to detect brand evolution
        const plannerResult = await runPlanner(brand.url, `${brand.rawText}\n\n[PAST INTELLIGENCE]: ${pastContext}`);
        if (!plannerResult.success) throw new Error('Planning failed: ' + plannerResult.error);

        const shards = plannerResult.data.shards;
        const visualShard = shards.find((s: any) => s.id === 'visual') || shards[0];
        const messagingShard = shards.find((s: any) => s.id === 'messaging') || shards[1];

        console.log('[Orchestrator] Step 2: Parallel Diagnostics (Aesthetic + Messaging)...');
        // Execute specialized agents in parallel for maximum throughput
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
                marketResonance: 20, // To be implemented by MarketReviewer later
                ctaStrength: 22,    // To be implemented by UXReviewer later
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
        await learnKnowledge(
            brand.url, 
            userEmail, 
            'STRATEGIC', 
            `Domain Authority Score: ${synthesis.aggregate}. Identity detected as: ${synthesis.brandIntelligence.positioning}`, 
            { scores: synthesis.scores, aggregate: synthesis.aggregate },
            synthesis.extracted
        );

        return synthesis;

    } catch (error: any) {
        console.error('[Orchestrator] Critical failure:', error.message);
        throw error;
    }
}
