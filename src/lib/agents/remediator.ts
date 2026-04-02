import { callCohere } from './client';
import { AgentResponse, RemediationOutput } from './types';

/**
 * [Remediator Agent v3.0 - MASTER ARCHITECT]
 * The 'Neural Healer' transformed into a context-aware Brand Architect.
 * It uses detected brand tone, positioning, and audience to generate
 * high-precision, production-ready Tailwind CSS and copy remediations.
 */
export async function runRemediator(
    visualGaps: string[], 
    communicationGaps: string[], 
    url: string,
    context?: {
        tone: string;
        promise: string;
        audience: string;
        positioning: string;
    }
): Promise<AgentResponse> {
    const brandContext = context ? `
[BRAND_CONTEXT]
TONE: ${context.tone}
PROMISE: ${context.promise}
AUDIENCE: ${context.audience}
POSITIONING: ${context.positioning}
` : '';

    const prompt = `
[SYSTEM: BRANDOS AI - MASTER ARCHITECT v3.0]
You are a 'Senior Design Engineer' and 'Lead Copywriter' specializing in High-Fidelity Brand Authority.
TASK: Synthesize the diagnostic gaps into 'Master Remediation Shards' using Tailwind CSS and high-resonance copywriting.

URL: ${url}
${brandContext}

VISUAL GAPS: ${visualGaps.join(', ')}
COMMUNICATION GAPS: ${communicationGaps.join(', ')}

OBJECTIVES:
1. Generate 'COPY' solutions: Must match the brand's TONE and AUDIENCE. Use active, high-authority voice.
2. Generate 'CSS' solutions: Use ONLY Tailwind CSS Utility Classes. Focus on refractive identity (glassmorphism, advanced spacing, typography).
3. Generate 'RATIONALE': Explain why this fix solves the branding friction point.

[FEW-SHOT EXAMPLES]
Problem: "Generic hero headline lacks emotional hook."
Type: "COPY"
Solution: "Evolve 'We make software' -> 'Architecting the Future of Neural Commerce.'"
Rationale: "Moves from functional description to visionary authority, aligning with the tech-savvvy audience."

Problem: "Poor visual hierarchy in feature grid."
Type: "CSS"
Solution: "Add 'p-10 rounded-[32px] bg-white/5 backdrop-blur-xl border border-white/10 hover:border-red-500/30 transition-all duration-700'"
Rationale: "Implements Liquid Glass design principles to create a premium, interactive depth."

Return valid JSON:
{
  "solutions": [
    {
      "id": "solution-1",
      "type": "COPY | CSS | UX",
      "problem": "Brief description of the gap",
      "solution": "The actual fix text or primary recommendation",
      "rationale": "Strategic reasoning for the fix",
      "codeSnippet": "Tailwind utility classes logic",
      "impact": "CRITICAL | HIGH | MEDIUM"
    }
  ],
  "overallAuthorityHeal": 0-100
}
`.trim();

    try {
        const data = await callCohere(prompt);
        return { success: true, data };
    } catch (e: any) {
        return { success: false, data: null, error: e.message };
    }
}
