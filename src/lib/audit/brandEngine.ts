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
        try {
            const response = await axios.get(this.url, {
                timeout: 10000,
                headers: { 
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.5'
                },
            });
            this.html = typeof response.data === 'string' ? response.data : '';
        } catch (error: any) {
            console.log(`[BrandEngine] Direct scrape failed or blocked. Defurring to Cohere Web Search...`);
            this.html = '';
        }

        // Even if empty, we pass it forward. Cohere Command R+ natively browses anyway!
        if (this.html.length > 2000 && !this.html.includes('Enable JavaScript and cookies to continue')) {
            this.$ = cheerio.load(this.html);
        }

        return {
            url: this.url,
            hero: this.extractHero() || { h1: '', subtext: '', cta: [] },
            about: this.extractAbout() || '',
            services: this.extractServices() || [],
            socialProof: this.extractSocialProof() || [],
            meta: {
                title: this.$ ? this.$('title').text().trim() : '',
                description: this.$ ? (this.$('meta[name="description"]').attr('content') || '') as string : '',
            },
            rawText: this.extractMainText() || 'No explicit text extracted. Initiate Web Search mode.',
        };
    }

    private extractHero() {
        if (!this.$) return null;
        const h1 = this.$('h1').first().text().trim();
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
