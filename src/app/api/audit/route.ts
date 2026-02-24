import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function POST(req: Request) {
    try {
        const { url } = await req.json();

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        // Ensure URL has protocol
        const targetUrl = url.startsWith('http') ? url : `https://${url}`;
        console.log(`Auditing URL: ${targetUrl}`);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

        const response = await fetch(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            },
            signal: controller.signal,
            next: { revalidate: 0 },
        });

        clearTimeout(timeoutId);
        console.log(`Fetch response status: ${response.status}`);

        if (!response.ok) {
            return NextResponse.json({ error: `Failed to fetch URL: ${response.statusText}` }, { status: response.status });
        }

        const html = await response.text();
        console.log(`HTML length: ${html.length}`);
        const $ = cheerio.load(html);

        // 1. Food (Content Quality) - Meta Description & Title
        const title = $('title').text();
        const metaDesc = $('meta[name="description"]').attr('content') || '';
        let foodScore = 5;
        if (metaDesc.length > 50 && metaDesc.length < 160) foodScore += 3;
        if (title.length > 10 && title.length < 60) foodScore += 2;
        if (metaDesc.toLowerCase().includes('sustainab') || metaDesc.toLowerCase().includes('human condition')) foodScore = 10;

        // 2. Shelter (Structure & Semantics) - Header Hierarchy
        const h1s = $('h1').length;
        const h2s = $('h2').length;
        let shelterScore = 10;
        const h1Text = $('h1').first().text().trim();
        if (h1s === 0) shelterScore -= 4; // Missing H1
        if (h1s > 1) shelterScore -= 2;   // Multiple H1s
        if (h2s === 0) shelterScore -= 2; // Very flat structure
        if (!h1Text) shelterScore -= 2;

        // 3. Education (Accessibility) - Image Alt Text
        const images = $('img');
        let imagesWithAlt = 0;
        images.each((_, img) => {
            const alt = $(img).attr('alt');
            if (alt && alt.trim() !== '' && !alt.match(/^[0-9]+(\([0-9]+\))?$/)) { // Exclude poorly named like "12(2)"
                imagesWithAlt++;
            }
        });
        const percentAlt = images.length > 0 ? (imagesWithAlt / images.length) * 10 : 10;
        const educationScore = Math.max(1, Math.round(percentAlt));

        // 4. Water (Flow/Navigation) - Internal vs External Links
        const links = $('a');
        let validLinks = 0;
        links.each((_, a) => {
            const href = $(a).attr('href');
            if (href && href !== '#' && !href.startsWith('javascript:')) validLinks++;
        });
        const percentValidLinks = links.length > 0 ? (validLinks / links.length) * 10 : 10;
        const waterScore = Math.max(1, Math.min(10, Math.round(percentValidLinks)));

        // 5. Work (Performance Estimate via HTML Size)
        // Very basic heuristic: smaller HTML = better "work" efficiency
        const htmlSizeKb = Buffer.byteLength(html, 'utf8') / 1024;
        let workScore = 10;
        if (htmlSizeKb > 500) workScore = 4;
        else if (htmlSizeKb > 200) workScore = 6;
        else if (htmlSizeKb > 100) workScore = 8;

        // 6. Energy (Sustainability/Clean Code) - Scripts & Styles footprint
        const numScripts = $('script').length;
        const numStyles = $('link[rel="stylesheet"]').length + $('style').length;
        let energyScore = 10;
        if (numScripts > 20) energyScore -= 3;
        if (numStyles > 10) energyScore -= 2;
        if (html.toLowerCase().includes('sustainab') || html.toLowerCase().includes('eco')) energyScore += 2;
        energyScore = Math.min(10, Math.max(1, energyScore));

        const scores = [foodScore, waterScore, shelterScore, educationScore, workScore, energyScore];

        // Details for report
        const details = {
            metaDescription: metaDesc,
            h1Count: h1s,
            h1FirstText: h1Text,
            totalImages: images.length,
            imagesMissingAlt: images.length - imagesWithAlt,
            htmlSizeKb: Math.round(htmlSizeKb)
        };

        return NextResponse.json({
            success: true,
            url: targetUrl,
            scores,
            details,
        });

    } catch (error: any) {
        console.error('Audit API Error:', error);
        return NextResponse.json({ error: 'Failed to process website audit', details: error.message }, { status: 500 });
    }
}
