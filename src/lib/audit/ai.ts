import axios from 'axios';
import { BrandData } from './brandEngine';

const API_KEY = process.env.COHERE_API_KEY;
const API_URL = 'https://api.cohere.ai/v1/generate';

/**
 * Step 1: INPUT EXTRACTION
 */
async function extractInputs(brand: BrandData) {
    const prompt = `
[SYSTEM: BRANDOS AI - STEP 1: INPUT EXTRACTION]
Extract the following from the given website/content:
URL: ${brand.url}
CONTENT: ${brand.rawText.slice(0, 1500)}

1. Core offering
2. Target audience
3. Brand tone (formal, casual, premium, etc.)
4. Key value propositions
5. Emotional triggers used

Keep answers concise and structured. Return valid JSON.
{
  "coreOffering": "...",
  "targetAudience": "...",
  "brandTone": "...",
  "valueProps": ["..."],
  "emotionalTriggers": ["..."]
}
`.trim();

    return callCohere(prompt);
}

/**
 * Step 2: CLARITY ANALYSIS
 */
async function analyzeClarity(extracted: any) {
    const prompt = `
[SYSTEM: BRANDOS AI - STEP 2: CLARITY ANALYSIS]
Evaluate the clarity of the messaging based on the following extraction:
${JSON.stringify(extracted)}

Answer:
- Is the core offering immediately clear? (Yes/No)
- What causes confusion?
- Rewrite the core message in one clear sentence.

Return valid JSON.
{
  "isImmediatelyClear": "Yes/No",
  "confusionPoints": "...",
  "oneClearSentence": "..."
}
`.trim();
    return callCohere(prompt);
}

/**
 * Step 3: DIFFERENTIATION CHECK
 */
async function checkDifferentiation(extracted: any) {
    const prompt = `
[SYSTEM: BRANDOS AI - STEP 3: DIFFERENTIATION CHECK]
Analyze how differentiated this brand is:
${JSON.stringify(extracted)}

- What makes it unique?
- Is the messaging generic?
- Suggest 2 stronger positioning directions.

Return valid JSON.
{
  "uniqueness": "...",
  "isGeneric": "Yes/No",
  "suggestedDirections": ["...", "..."]
}
`.trim();
    return callCohere(prompt);
}

/**
 * Step 4: CONSISTENCY ANALYSIS
 */
async function analyzeConsistency(brand: BrandData, extracted: any) {
    const prompt = `
[SYSTEM: BRANDOS AI - STEP 4: CONSISTENCY ANALYSIS]
Check for tone and messaging consistency across this content:
BRAND TONE GOAL: ${extracted.brandTone}
CONTENT: ${brand.rawText.slice(0, 1500)}

- Is the tone consistent?
- Where does it break?
- Suggest corrections.

Return valid JSON.
{
  "isToneConsistent": "Yes/No",
  "breakPoints": "...",
  "corrections": "..."
}
`.trim();
    return callCohere(prompt);
}

/**
 * Step 5: CONVERSION ANALYSIS
 */
async function analyzeConversion(brand: BrandData) {
    const prompt = `
[SYSTEM: BRANDOS AI - STEP 5: CONVERSION ANALYSIS]
Evaluate conversion readiness for:
HERO: ${brand.hero.h1}
CTAs: ${brand.hero.cta.join(', ')}

- Is there a clear CTA?
- Is the value communicated quickly?
- What is missing for conversion?
- Suggest improvements.

Return valid JSON.
{
  "hasClearCTA": "Yes/No",
  "isValueCommunicatedQuickly": "Yes/No",
  "missingElements": "...",
  "suggestedImprovements": "..."
}
`.trim();
    return callCohere(prompt);
}

/**
 * Step 6: BRAND SCORE GENERATION
 */
async function generateScores(clarity: any, consistency: any, differentiation: any, conversion: any) {
    const prompt = `
[SYSTEM: BRANDOS AI - STEP 6: BRAND SCORE GENERATION]
Score the brand based on these analyses:
CLARITY: ${JSON.stringify(clarity)}
CONSISTENCY: ${JSON.stringify(consistency)}
DIFFERENTIATION: ${JSON.stringify(differentiation)}
CONVERSION: ${JSON.stringify(conversion)}

Score the brand on (0-25 each):
- Clarity (0–25)
- Consistency (0–25)
- Differentiation (0–25)
- Conversion (0–25)

Explain each score briefly. Provide total out of 100.
Return valid JSON.
{
  "clarity": 0-25,
  "consistency": 0-25,
  "differentiation": 0-25,
  "conversion": 0-25,
  "explanations": {
    "clarity": "...",
    "consistency": "...",
    "differentiation": "...",
    "conversion": "..."
  },
  "total": 0-100
}
`.trim();
    return callCohere(prompt);
}

/**
 * Step 7: PLAYBOOK GENERATION
 */
async function generatePlaybook(extracted: any, scores: any, clarity: any) {
    const prompt = `
[SYSTEM: BRANDOS AI - STEP 7: PLAYBOOK GENERATION]
Generate a communication playbook:
BRAND: ${JSON.stringify(extracted)}
SCORES: ${JSON.stringify(scores)}
MESSAGE: ${clarity.oneClearSentence}

1. One-line positioning
2. Hero section rewrite
3. 3 key messaging pillars
4. CTA suggestions
5. Content themes

Make it practical and usable. Return valid JSON.
{
  "oneLinePositioning": "...",
  "heroRewrite": { "h1": "...", "subtext": "...", "cta": "..." },
  "messagingPillars": ["...", "...", "..."],
  "ctaSuggestions": ["...", "..."],
  "contentThemes": ["...", "..."]
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
        console.log('[BrandOS] Step 1: Input Extraction...');
        const extracted = await extractInputs(brand);

        console.log('[BrandOS] Step 2: Clarity Analysis...');
        const clarity = await analyzeClarity(extracted);

        console.log('[BrandOS] Step 3: Differentiation Check...');
        const differentiation = await checkDifferentiation(extracted);

        console.log('[BrandOS] Step 4: Consistency Analysis...');
        const consistency = await analyzeConsistency(brand, extracted);

        console.log('[BrandOS] Step 5: Conversion Analysis...');
        const conversion = await analyzeConversion(brand);

        console.log('[BrandOS] Step 6: Brand Score Generation...');
        const scores = await generateScores(clarity, consistency, differentiation, conversion);

        console.log('[BrandOS] Step 7: Playbook Generation...');
        const playbook = await generatePlaybook(extracted, scores, clarity);

        return {
            extracted,
            clarity,
            differentiation,
            consistency,
            conversion,
            scores,
            playbook,
            confidence: 92,
            summary: clarity.oneClearSentence,
            positioning: playbook.oneLinePositioning,
            audience: extracted.targetAudience,
            toneOfVoice: extracted.brandTone,
            conversionGaps: [conversion.missingElements],
            priorityFixes: [conversion.suggestedImprovements],
            quickWins: playbook.contentThemes,
        };
    } catch (error: any) {
        console.error('Brand Intelligence failed:', error.message);
        return { error: 'Diagnostic Pipeline Interrupted' };
    }
}

export async function getAiInsights(url: string, findings: any[]) {
    return {
        overview: "System Refactored to BrandOS 7-Step Pipeline. Please use getBrandIntelligence.",
        confidence: 95
    };
}
