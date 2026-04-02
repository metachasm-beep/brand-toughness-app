import axios from 'axios';

const PAGESPEED_API_KEY = process.env.PAGESPEED_API_KEY;

export interface PageSpeedMetrics {
    performance: number;
    accessibility: number;
    bestPractices: number;
    seo: number;
}

export async function fetchPageSpeed(url: string): Promise<PageSpeedMetrics | null> {
    if (!PAGESPEED_API_KEY) {
        console.warn('[PageSpeed] No API key found. Skipping technical analysis.');
        return null;
    }

    try {
        const categories = ['performance', 'accessibility', 'best-practices', 'seo'];
        const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&key=${PAGESPEED_API_KEY}&category=${categories.join('&category=')}`;

        const response = await axios.get(apiUrl, { timeout: 20000 });
        const lighthouse = (response.data as any)?.lighthouseResult?.categories;

        if (!lighthouse) return null;

        return {
            performance: Math.round((lighthouse.performance?.score || 0) * 100),
            accessibility: Math.round((lighthouse.accessibility?.score || 0) * 100),
            bestPractices: Math.round((lighthouse['best-practices']?.score || 0) * 100),
            seo: Math.round((lighthouse.seo?.score || 0) * 100),
        };
    } catch (error: any) {
        console.error(`[PageSpeed] API Error for ${url}:`, error.response?.data || error.message);
        return null;
    }
}
