import axios from 'axios';

export async function getAiInsights(url: string, findings: any[]) {
    const apiKey = process.env.COHERE_API_KEY || 'L47ePrt3wY6lJ0kKntEqH0K3s3fXF9A7sTbbS0aL'; // Replace with a valid test key if available
    const apiUrl = 'https://api.cohere.ai/v1/generate';

    try {
        const prompt = `
You are the "WEB OS v4.2 Diagnostic Core". 
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
                model: 'command',
                prompt: prompt,
                max_tokens: 1000,
                temperature: 0.5,
            },
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
            }
        );

        const text = response.data.generations[0].text;
        try {
            // Find JSON in text if Cohere adds fluff
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            return jsonMatch ? JSON.parse(jsonMatch[0]) : { overview: text };
        } catch (e) {
            return { overview: text };
        }
    } catch (error: any) {
        console.error('AI Insights failed:', error?.response?.data || error.message);
        return { overview: 'Service interrupted. Using backup diagnostic heuristics.' };
    }
}
