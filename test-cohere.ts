import axios from 'axios';
import 'dotenv/config'; // Requires npm install dotenv, or we rely on process.env being loaded if executed via tsx --env-file

async function testCohere() {
    console.log("Testing Cohere Web Search on Apple.com...");
    const API_KEY = process.env.COHERE_API_KEY;
    try {
        const response: any = await axios.post(
            'https://api.cohere.ai/v1/chat',
            {
                model: 'command-r-plus', // Or command-r
                message: `Perform a detailed brand analysis of https://www.apple.com. Extract their core promise, tone of voice, visual identity score (1-10), messaging score (1-10), and 3 quick wins. Return JSON only without markdown formatting.`,
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
        console.log(response.data.text);
    } catch(e: any) {
        console.error(e.response ? e.response.data : e.message);
    }
}
testCohere();
