import { callCohere } from './client';
import { AgentResponse, RemediationOutput } from './types';

/**
 * [Remediator Agent v3.0]
 * The 'Neural Healer' responsible for transforming diagnostic gaps into
 * generative actions, high-resonance copy, and production-ready CSS code.
 */
export async function runRemediator(
    visualGaps: string[], 
    communicationGaps: string[], 
    url: string
): Promise<AgentResponse> {
    const prompt = `
[SYSTEM: BRANDOS AI - NEURAL HEALER v3.0]
You are a 'Brand Remediation Specialist' and 'Interface Engineer'.
TASK: Synthesize the following diagnostic gaps into actionable, generative 'Solution Shards'.

URL: ${url}
VISUAL GAPS: ${visualGaps.join(', ')}
COMMUNICATION GAPS: ${communicationGaps.join(', ')}

OBJECTIVES:
1. Generate specific 'COPY' solutions for communication gaps (high-resonance headlines/segments).
2. Generate specific 'CSS' solutions for visual gaps (production-ready modern CSS code).
3. Ensure every solution has an 'impact' (CRITICAL/HIGH/MEDIUM) and a 'problem' description.

Return valid JSON:
{
  "solutions": [
    {
      "id": "solution-1",
      "type": "COPY | CSS | UX",
      "problem": "Brief description of the gap",
      "solution": "High-level strategic fix",
      "codeSnippet": ".selector { property: value; }",
      "impact": "CRITICAL"
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
