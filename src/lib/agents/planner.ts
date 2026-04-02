import { callCohere } from './client';
import { AgentResponse, PlannerOutput } from './types';

export async function runPlanner(url: string, rawText: string): Promise<AgentResponse> {
    const prompt = `
[SYSTEM: BRANDOS AI - STRATEGIC PLANNER]
You are a high-level Strategic Brand Planner. Your mission is to decompose a brand landing page into a tactical diagnostic plan.
URL: ${url}
CONTENT: ${rawText.slice(0, 1500)}

Decompose this brand into 4 specialized shards for analysis:
1. Visual Shard: Aesthetic authority, design language, and identity markers.
2. Messaging Shard: Core promise, tone of voice, and value alignment.
3. UX Shard: Conversion friction, CTAs, and user flow alignment.
4. Differentiation Shard: Market positioning, competitive uniqueness, and emotional resonance.

Assign each a priority (CRITICAL, HIGH, MEDIUM, LOW) based on initial content triage.

Return valid JSON:
{
  "shards": [
    { "id": "visual", "focus": "...", "priority": "..." },
    { "id": "messaging", "focus": "...", "priority": "..." },
    { "id": "ux", "focus": "...", "priority": "..." },
    { "id": "differentiation", "focus": "...", "priority": "..." }
  ],
  "totalConfidence": 95
}
`.trim();

    try {
        const data = await callCohere(prompt);
        return { success: true, data };
    } catch (e: any) {
        return { success: false, data: null, error: e.message };
    }
}
