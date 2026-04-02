import axios from 'axios';

const API_KEY = process.env.COHERE_API_KEY || 'L47ePrt3wY6lJ0kKntEqH0K3s3fXF9A7sTbbS0aL';
const API_URL = 'https://api.cohere.ai/v1/generate';

export async function callCohere(prompt: string, maxTokens = 800) {
    try {
        const response: any = await axios.post(
            API_URL,
            {
                model: 'command',
                prompt: prompt,
                max_tokens: maxTokens,
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
