import axios from 'axios';
import * as cheerio from 'cheerio';
import { v4 as uuidv4 } from 'uuid';

export interface BrandData {
    url: string;
    hero: {
        h1: string;
        subtext: string;
        cta: string[];
    };
    about: string;
    services: string[];
    socialProof: string[];
    meta: {
        title: string;
        description: string;
        techStack?: string[];
        publisher?: string;
    };
    rawText: string;
}

export class BrandEngine {
    private url: string;
    private html: string = '';
    private $: any;

    constructor(url: string) {
        this.url = url;
    }

    async scan(): Promise<BrandData> {
        let success = false;
        let microlinkData: any = null;

        // Tier 1: Direct Scrape with realistic headers
        try {
            console.log(`[BrandEngine] Tier 1: Direct Scrape ${this.url}`);
            const response = await axios.get(this.url, {
                timeout: 10000,
                headers: { 
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.5'
                },
            });
            this.html = (response.data as string) || '';
            // Basic check to see if we got an empty SPA body
            if (this.html.length > 2000 && !this.html.includes('Enable JavaScript and cookies to continue')) {
                success = true;
            } else {
                console.log(`[BrandEngine] Tier 1 Returned heavily restricted/empty HTML.`);
                success = false;
            }
        } catch (e: any) {
            console.log(`[BrandEngine] Tier 1 Failed: ${e.message}`);
        }

        // Tier 2: AllOrigins Public Proxy Fallback
        if (!success) {
            try {
                console.log(`[BrandEngine] Tier 2: AllOrigins Scrape ${this.url}`);
                const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(this.url)}`;
                const response = await axios.get(proxyUrl, { timeout: 15000 });
                if (response.data && (response.data as any).contents) {
                    this.html = (response.data as any).contents;
                    if (this.html.length > 2000 && !this.html.includes('Enable JavaScript and cookies to continue')) {
                        success = true;
                    }
                }
            } catch (e: any) {
                console.log(`[BrandEngine] Tier 2 Failed: ${e.message}`);
            }
        }

        // Tier 3: Microlink API Metadata API Extract
        // Usually, Microlink is amazing for modern React SPAs or sites that block traditional DOM scraping.
        if (!success) {
            try {
                console.log(`[BrandEngine] Tier 3: Microlink API Extractor ${this.url}`);
                const mlUrl = `https://api.microlink.io?url=${encodeURIComponent(this.url)}`;
                const response = await axios.get(mlUrl, { timeout: 10000 });
                if (response.data && (response.data as any).data) {
                    microlinkData = (response.data as any).data;
                    success = true;
                }
            } catch (e: any) {
                console.log(`[BrandEngine] Tier 3 Failed: ${e.message}`);
            }
        }

        if (!success && !microlinkData && !this.html) {
             throw new Error(`Domain actively blocking all intelligent analysis techniques.`);
        }

        // Tier 4: Public Infra/Tech API via HackerTarget
        let techStack: string[] = [];
        try {
            const hUrl = `https://api.hackertarget.com/httpheaders/?q=${encodeURIComponent(this.url)}`;
            const hRes = await axios.get(hUrl, { timeout: 8000 });
            if (typeof hRes.data === 'string' && !hRes.data.includes('error')) {
                const lines = hRes.data.split('\n');
                lines.forEach(line => {
                    const l = line.toLowerCase();
                    if (l.startsWith('server:') || l.startsWith('x-powered-by:') || l.startsWith('x-framework:') || l.startsWith('cf-ray:')) {
                        techStack.push(line.trim());
                    }
                });
            }
        } catch(e) {
            console.log(`[BrandEngine] Tech stack analysis blocked.`);
        }

        // DOM parsing if HTML is intact
        if (this.html && this.html.length > 1000) {
            this.$ = cheerio.load(this.html);
            return {
                url: this.url,
                hero: this.extractHero() || { h1: microlinkData?.title || '', subtext: microlinkData?.description || '', cta: [] },
                about: this.extractAbout() || microlinkData?.description || '',
                services: this.extractServices(),
                socialProof: this.extractSocialProof(),
                meta: {
                    title: microlinkData?.title || this.$('title').text().trim(),
                    description: microlinkData?.description || (this.$('meta[name="description"]').attr('content') || '') as string,
                    techStack,
                    publisher: microlinkData?.publisher
                },
                rawText: this.extractMainText(),
            };
        } else if (microlinkData) {
            // Revert back strictly to Microlink Metadata since DOM was denied
            return {
                url: this.url,
                hero: {
                    h1: microlinkData.title || '',
                    subtext: microlinkData.description || '',
                    cta: []
                },
                about: microlinkData.description || 'Target is a deep React/Next.js single page application masking its core text.',
                services: [],
                socialProof: [],
                meta: {
                    title: microlinkData.title || '',
                    description: microlinkData.description || '',
                    techStack,
                    publisher: microlinkData.publisher
                },
                rawText: `${microlinkData.title} ${microlinkData.description} ${microlinkData.publisher || ''}`
            };
        }

        throw new Error('Unreachable completion state in BrandEngine');
    }

    private extractHero() {
        if (!this.$) return null;
        let h1 = this.$('h1').first().text().trim();
        if (!h1) return null; // let caller fallback to microlink
        const subtext = this.$('h1').first().nextAll('p, div').first().text().trim();
        const cta: string[] = [];
        this.$('a, button').slice(0, 10).each((_: any, el: any) => {
            const text = this.$(el).text().trim();
            if (text.length > 2 && text.length < 30) cta.push(text);
        });

        return { h1, subtext, cta: [...new Set(cta)] };
    }

    private extractAbout() {
        if (!this.$) return '';
        let aboutText = '';
        this.$('section, div').each((_: any, el: any) => {
            const id = this.$(el).attr('id') || '';
            const className = this.$(el).attr('class') || '';
            if (/about|mission|who-we-are|vision/i.test(id + className)) {
                aboutText += this.$(el).text().trim() + ' ';
            }
        });
        return aboutText.slice(0, 1000).trim();
    }

    private extractServices() {
        if (!this.$) return [];
        const services: string[] = [];
        this.$('h2, h3').each((_: any, el: any) => {
            const text = this.$(el).text().trim();
            if (text.length > 5 && text.length < 50) services.push(text);
        });
        return [...new Set(services)].slice(0, 10);
    }

    private extractSocialProof() {
        if (!this.$) return [];
        const proof: string[] = [];
        this.$('blockquote, .testimonial, .review, .proof').each((_: any, el: any) => {
            const txt = this.$(el).text().trim();
            if (txt && txt.length > 10) proof.push(txt);
        });
        return proof.slice(0, 5);
    }

    private extractMainText() {
        if (!this.$) return '';
        return this.$('body').text().replace(/\s+/g, ' ').trim().slice(0, 5000);
    }
}
