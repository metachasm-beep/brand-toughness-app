import axios from 'axios';
import { BrandData } from './brandEngine';

const API_KEY = process.env.COHERE_API_KEY || 'L47ePrt3wY6lJ0kKntEqH0K3s3fXF9A7sTbbS0aL';
const API_URL = 'https://api.cohere.ai/v1/generate';

/**
 * Step 1: Synthesize Raw Data into a Brand Identity Profile
 */
async function synthesizeProfile(brand: BrandData) {
    const prompt = `
[SYSTEM: BRAND STRATEGY ENGINE]
Analyze the following raw website data and synthesize a clear Brand Identity Profile.

URL: ${brand.url}
HERO: ${brand.hero.h1} - ${brand.hero.subtext}
CTAs: ${brand.hero.cta.join(', ')}
ABOUT (Snippet): ${brand.about}
RAW (Snippet): ${brand.rawText.slice(0, 1000)}

Produce valid JSON:
{
  "corePromise": "...",
  "targetAudience": "...",
  "toneOfVoice": "...",
  "marketPositioning": "...",
  "emotionalTriggers": ["..."]
}
`.trim();

    return callCohere(prompt);
}

/**
 * Step 2: Evaluate Alignment Scores
 */
async function evaluateScores(profile: any, brand: BrandData) {
    const prompt = `
[SYSTEM: BRAND ALIGNMENT SCORER]
Based on the profile and actual website content, score this brand on a scale of 0-100.

PROFILE: ${JSON.stringify(profile)}
CONTENT: ${brand.rawText.slice(0, 1000)}

Scores:
1. Clarity (How easy it is to understand what they do)
2. Consistency (How unified the messaging is across content)
3. Differentiation (How unique they appear against competitors)
4. Emotional Impact (How well they connect with audience drivers)

Produce valid JSON:
{
  "clarity": 0-100,
  "consistency": 0-100,
  "differentiation": 0-100,
  "emotionalImpact": 0-100,
  "reasoning": "..."
}
`.trim();

    return callCohere(prompt);
}

/**
 * Step 3: Generate Communication Playbook
 */
async function generatePlaybook(profile: any, scores: any) {
    const prompt = `
[SYSTEM: COMMUNICATION PLAYBOOK GENERATOR]
Generate actionable messaging growth vectors for this brand.

PROFILE: ${JSON.stringify(profile)}
SCORES: ${JSON.stringify(scores)}

Produce valid JSON:
{
  "homepageArchitecture": { "h1": "...", "subtext": "...", "cta": "..." },
  "adCopyDirections": ["..."],
  "contentThemes": ["..."],
  "conversionGaps": ["..."],
  "lowHangingFruit": ["..."]
}
`.trim();

    return callCohere(prompt);
}

async function callCohere(prompt: string) {
    try {
        const response: any = await axios.post(
            API_URL,
            {
                model: 'command',
                prompt: prompt,
                max_tokens: 800,
                temperature: 0.3,
            },
            {
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
            }
        );

        const text = response.data.generations[0].text;
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        return jsonMatch ? JSON.parse(jsonMatch[0]) : { error: 'Invalid JSON', raw: text };
    } catch (e: any) {
        console.error('Cohere call failed:', e.message);
        return { error: 'API Error' };
    }
}

export async function getBrandIntelligence(brand: BrandData) {
    try {
        console.log('[BrandOS] Step 1: Synthesizing Profile...');
        const profile = await synthesizeProfile(brand);

        console.log('[BrandOS] Step 2: Evaluating Scores...');
        const scores = await evaluateScores(profile, brand);

        console.log('[BrandOS] Step 3: Generating Playbook...');
        const playbook = await generatePlaybook(profile, scores);

        return {
            profile,
            scores,
            playbook,
            confidence: 85, // Heuristic static confidence for demo
            summary: profile.corePromise,
            positioning: profile.marketPositioning,
            audience: profile.targetAudience,
            toneOfVoice: profile.toneOfVoice,
            conversionGaps: playbook.conversionGaps,
            priorityFixes: playbook.lowHangingFruit,
            quickWins: playbook.contentThemes,
        };
    } catch (error: any) {
        console.error('Brand Intelligence failed:', error.message);
        return { error: 'Diagnostic Pipeline Interrupted' };
    }
}

/**
 * Compatibility wrapper for legacy calls
 */
export async function getAiInsights(url: string, findings: any[]) {
    // Treat as mini brand audit for backward compatibility
    return {
        overview: "System Refactored to BrandOS. Please use getBrandIntelligence for deep strategy.",
        confidence: 90
    };
}
