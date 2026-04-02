import { callCohere } from './client';
import { AgentResponse } from './types';

export async function runMessagingAuditor(shard: any, url: string, rawText: string): Promise<AgentResponse> {
    const prompt = `
[SYSTEM: BRANDOS AI - MESSAGING AUDITOR]
You are a Copywriting Strategist.
TASK: Analyze the Messaging Clarity and Consistency of this brand.
FOCUS: ${shard.focus}
URL: ${url}
EXTRACTED CONTEXT: ${rawText.slice(0, 1500)}

CRITICAL: Use your active web search connector to lookup the brand site if the extracted context is insufficient.

Analyze:
1. Core Promise: Is it immediately clear?
2. Tone of Voice: Is it consistent and appropriate?
3. Value Alignment: Does the content prove the promise?
4. Messaging Pillars: Identify the 3 pillars being used.
5. Communication Gaps: 2 messaging breakdowns affecting trust.

Return valid JSON:
{
  "clarityScore": 0-25,
  "consistencyScore": 0-25,
  "corePromise": "...",
  "toneOfVoice": "...",
  "messagingPillars": ["...", "...", "..."],
  "communicationGaps": ["...", "..."],
  "copyAudit": "..."
}
`.trim();

    try {
        const data = await callCohere(prompt);
        return { success: true, data };
    } catch (e: any) {
        return { success: false, data: null, error: e.message };
    }
}
