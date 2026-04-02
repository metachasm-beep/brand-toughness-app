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
                timeout: 15000,
                headers: { 'User-Agent': 'BrandOSIntelBot/1.0' },
            });

            this.html = response.data;
            this.$ = cheerio.load(this.html);

            return {
                url: this.url,
                hero: this.extractHero(),
                about: this.extractAbout(),
                services: this.extractServices(),
                socialProof: this.extractSocialProof(),
                meta: {
                    title: this.$('title').text().trim(),
                    description: (this.$('meta[name="description"]').attr('content') || '') as string,
                },
                rawText: this.extractMainText(),
            };
        } catch (error: any) {
            throw new Error(`Brand scan failed: ${error.message}`);
        }
    }

    private extractHero() {
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
        // Look for sections with "about", "mission", "who we are"
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
        const services: string[] = [];
        this.$('h2, h3').each((_: any, el: any) => {
            const text = this.$(el).text().trim();
            if (text.length > 5 && text.length < 50) services.push(text);
        });
        return [...new Set(services)].slice(0, 10);
    }

    private extractSocialProof() {
        const proof: string[] = [];
        this.$('blockquote, .testimonial, .review, .proof').each((_: any, el: any) => {
            proof.push(this.$(el).text().trim());
        });
        return proof.slice(0, 5);
    }

    private extractMainText() {
        return this.$('body').text().replace(/\s+/g, ' ').trim().slice(0, 5000);
    }
}
