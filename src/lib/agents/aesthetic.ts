import { callCohere } from './client';
import { AgentResponse } from './types';

export async function runAestheticReviewer(shard: any, url: string, rawText: string): Promise<AgentResponse> {
    const prompt = `
[SYSTEM: BRANDOS AI - AESTHETIC REVIEWER]
You are a senior Design Director specializing in Brand Identity.
TASK: Analyze the Visual Authority and Identity of this brand.
FOCUS: ${shard.focus}
URL: ${url}
CONTENT: ${rawText.slice(0, 1500)}

Analyze:
1. Visual Authority: Does the design feel premium, tactical, or generic?
2. Identity Consistency: Are branding assets used with precision?
3. Design Language: Typography, color-balance, and whitespace usage.
4. Strategic Visual Wins: 3 key visual elements that build trust.
5. Visual Gaps: 2 critical design flaws undermining authority.

Return valid JSON:
{
  "visualAuthority": 0-25,
  "identityScore": 0-25,
  "styleAnalysis": "...",
  "visualWins": ["...", "...", "..."],
  "visualGaps": ["...", "..."],
  "designAudit": "..."
}
`.trim();

    try {
        const data = await callCohere(prompt);
        return { success: true, data };
    } catch (e: any) {
        return { success: false, data: null, error: e.message };
    }
}
