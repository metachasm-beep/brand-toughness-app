import axios from 'axios';

export async function getAiInsights(url: string, findings: any[]) {
    const apiKey = process.env.COHERE_API_KEY || 'occgoxFaNQvZZVufa3sWhMAGsoux3wCI401690Rg'; 
    const apiUrl = 'https://api.cohere.ai/v1/chat';

    try {
        const message = `
You are the "Brand OS v4.2 Diagnostic Core". 
I have performed a deep-telemetry audit of ${url}.
Findings: ${JSON.stringify(findings.slice(0, 30).map(f => ({ title: f.title, severity: f.severity })), null, 2)}

Produce a valid JSON object only. No intro/outro.
Format:
{
  "overview": "...",
  "positioning": "...",
  "audience": "...",
  "keyOffers": ["..."],
  "trustGaps": ["..."],
  "conversionGaps": ["..."],
  "priorityFixes": ["..."],
  "quickWins": ["..."],
  "confidence": 0-100
}
`.trim();

        const response: any = await axios.post(
            apiUrl,
            {
                model: 'command-a-03-2025', 
                message: message,
                temperature: 0.3,
            },
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
            }
        );

        const text = response.data.text;
        try {
            // Find JSON in text if Cohere adds markdown or fluff
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            return jsonMatch ? JSON.parse(jsonMatch[0]) : { overview: text };
        } catch (e) {
            console.warn('[AI JSON PARSE FAILED]', text);
            return { overview: text };
        }
    } catch (error: any) {
        console.error('AI Insights failed:', error?.response?.data || error.message);
        return { overview: 'Service interrupted. Using backup diagnostic heuristics.' };
    }
}
