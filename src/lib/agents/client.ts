import axios from 'axios';

const API_KEY = process.env.COHERE_API_KEY;
if (!API_KEY) {
    throw new Error('MISSING_CREDENTIALS: COHERE_API_KEY is not defined in the environment.');
}
const API_URL = 'https://api.cohere.ai/v1/chat';

export async function callCohere(prompt: string, maxTokens = 800) {
    try {
        const response: any = await axios.post(
            API_URL,
            {
                model: 'command-r-plus',
                message: prompt,
                connectors: [{ id: "web-search" }],
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

        const text = response.data.text;
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        return jsonMatch ? JSON.parse(jsonMatch[0]) : { error: 'Invalid JSON', raw: text };
    } catch (e: any) {
        console.error('Cohere call failed:', e.response?.data || e.message);
        return { error: 'API Error' };
    }
}
