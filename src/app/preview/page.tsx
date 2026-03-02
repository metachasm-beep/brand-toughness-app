'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
    Activity, Shield, Zap, Globe, ArrowLeft,
    Search, Server, Lock, Cpu, BarChart,
    ChevronRight, Info
} from 'lucide-react';

const categories = [
    {
        name: "Performance Integrity",
        icon: Activity,
        color: "#00D1FF",
        metrics: [
            { name: "First Contentful Paint (FCP)", d: "Measures the time from when the page starts loading to when any part of the page's content is rendered on the screen." },
            { name: "Largest Contentful Paint (LCP)", d: "Reports the render time of the largest image or text block visible within the viewport." },
            { name: "Cumulative Layout Shift (CLS)", d: "Measures the sum total of all individual layout shift scores for every unexpected layout shift that occurs during the entire lifespan of the page." },
            { name: "Total Blocking Time (TBT)", d: "Measures the total amount of time between First Contentful Paint and Time to Interactive." },
            { name: "Speed Index", d: "Shows how quickly the contents of a page are visibly populated." },
            { name: "Time to First Byte (TTFB)", d: "The time it takes for a browser to receive the first byte of page content from the server." },
            { name: "Server Latency", d: "Total time for the server to process the request and return the response." },
            { name: "TCP Handshake Duration", d: "Time taken to establish a connection between the client and server." },
            { name: "SSL/TLS Negotiation Time", d: "Duration of the secure connection handshake process." },
            { name: "DNS Lookup Speed", d: "Time taken to resolve the domain name to an IP address." },
            { name: "Resource Compression Ratio", d: "Effectiveness of Brotli/Gzip compression on transferred assets." },
            { name: "Cache Hit Efficiency", d: "Percentage of static assets successfully served from Edge CDN caches." },
            { name: "Payload Size (Gzipped)", d: "Total weight of the page resources transferred over the wire." },
            { name: "Number of DOM Nodes", d: "Total count of HTML elements; higher counts degrade performance." },
            { name: "Critical Request Chain Depth", d: "Length of the series of dependent network requests needed for initial render." },
            { name: "Image Optimization Score", d: "Ratio of current image sizes to potential sizes with modern formats (WebP/AVIF)." },
            { name: "JavaScript Execution Time", d: "CPU time spent parsing, compiling, and executing script files." },
            { name: "CSS Selectors Efficiency", d: "Complexity and quantity of CSS rules mapped to the DOM." },
            { name: "Third-party Script Latency", d: "Impact of external scripts (trackers, chats) on main thread availability." },
            { name: "Font Loading Strategy", d: "Efficiency of font-display swap and subsetting to prevent FOIT/FLUT." }
        ]
    },
    {
        name: "Trust & Authority",
        icon: Shield,
        color: "#7B5CFF",
        metrics: [
            { name: "HSTS Implementation", d: "Enforces HTTPS connections to prevent man-in-the-middle attacks." },
            { name: "Content Security Policy (CSP)", d: "Restricts sources of executable script to prevent XSS." },
            { name: "X-Frame-Options", d: "Prevents clickjacking by controlling if the site can be embedded in iframes." },
            { name: "Permissions-Policy", d: "Restricts browser features like camera/microphone/geolocation." },
            { name: "SSL Certificate Grade", d: "Quality and expiration status of the encryption certificate." },
            { name: "Privacy Policy Presence", d: "Existence and accessibility of the legal privacy disclosure." },
            { name: "Domain Authority (DA)", d: "Predictive ranking score of the domain's overall power." },
            { name: "Spam Score", d: "Likelihood of the domain being penalized for low-quality associations." },
            { name: "Brand Mention Frequency", d: "Unlinked mentions across high-authority digital publications." },
            { name: "Trustpilot Integration", d: "Presence and API verification of external social proof." },
            { name: "PCI DSS Compliance Check", d: "Verification of secure payment handling standards." },
            { name: "Contact Verifiability", d: "Automated check for valid physical address and business phone." },
            { name: "Legal Document Hash Status", d: "Cryptographic verification of Terms & Conditions versioning." },
            { name: "Subdomain Security Leakage", d: "Scanning for vulnerable or unpatched auxiliary staging sites." },
            { name: "Email Spoofing Protection (DMARC)", d: "Verification of SPF and DKIM records to protect brand reputation." }
        ]
    },
    {
        name: "Discovery Power",
        icon: Globe,
        color: "#00E28A",
        metrics: [
            { name: "Semantic Data (Schema.org)", d: "Implementation of structured data for rich snippets in search results." },
            { name: "Keyword Semantic Weight", d: "Relevance of content to primary and secondary topical clusters." },
            { name: "Internal Link Topology", d: "Graph analysis of how authority flows between pages." },
            { name: "Backlink Quality Ratio", d: "Ratio of high-authority vs. low-quality incoming links." },
            { name: "Mobile Usability Score", d: "Adaptability of layouts and tap targets for small screens." },
            { name: "Canonicalization Efficiency", d: "Correct handling of duplicate content via rel=canonical tags." },
            { name: "Sitemap logic validation", d: "Accuracy and freshness of the XML sitemap index." },
            { name: "Robots.txt directive clarity", d: "Proper configuration of crawler access permissions." },
            { name: "Social Metadata (OpenGraph)", d: "Optimization of preview cards for LinkedIn, Twitter, and FB." },
            { name: "Language Localization (Hreflang)", d: "Implementation of multi-region targeting signals." },
            { name: "Accessibility (WCAG 2.1)", d: "Compliance with standards for screen readers and keyboard navigation." },
            { name: "Interactive Element Contrast", d: "Visual accessibility of buttons and links for all users." },
            { name: "Alt-Text Saturation", d: "Coverage of descriptive text for all meaningful visual assets." },
            { name: "Page Depth from Root", d: "Number of clicks required to reach content from the home page." },
            { name: "Broken Link Percentage", d: "Frequency of 404 errors during a full crawl of the site." }
        ]
    },
    {
        name: "Brand Clarity",
        icon: Zap,
        color: "#FF3D57",
        metrics: [
            { name: "Headline Narrative Strength", d: "AI analysis of how quickly the primary headline communicates the core value proposition." },
            { name: "CTA Visual Saliency", d: "Heatmap simulation of how prominent call-to-action buttons are relative to other page elements." },
            { name: "Information Density Ratio", d: "Mathematical balance between whitespace and cognitive load in the layout." },
            { name: "Tone of Voice Consistency", d: "Linguistic analysis of brand personality alignment across different page sections." },
            { name: "Social Proof Saturation", d: "Density and placement logic of testimonials, case studies, and partner logos." },
            { name: "Visual Hierarchy Integrity", d: "Scanning for scanning-pattern (F-pattern or Z-pattern) compatibility." },
            { name: "Value Prop Scannability", d: "Time-to-comprehension for key benefits during a 3-second rapid scroll." },
            { name: "Hero-Section Friction Score", d: "Detection of competing messages or 'noise' in the primary viewport." },
            { name: "Micro-copy Clarity", d: "Utility assessment of labels, placeholders, and error messages." },
            { name: "Conversion Path Logic", d: "Number of cognitive steps required to complete a primary goal." },
            { name: "Typography Legibility Index", d: "Contrast and sizing analysis for optimal reading across all vision types." },
            { name: "Brand Asset Unity", d: "Verification of logo, color, and font usage against design system tokens." }
        ]
    }
];

// Filling up to simulate the "150 Intelligence Points"
// In a real app we'd list all 150, but we provide the top 50 in full detail here.

export default function IntelligencePreview() {
    return (
        <div className="bg-[#0B0F14] min-h-screen text-white font-sans p-10 lg:p-20 overflow-x-hidden">
            <nav className="max-w-7xl mx-auto mb-20 flex justify-between items-center">
                <Link href="/" className="flex items-center gap-2 text-white/50 hover:text-white transition-colors group">
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="surgical-label">Back to Base</span>
                </Link>
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#00D1FF] rounded-lg flex items-center justify-center font-black text-black">OS</div>
                    <span className="font-display font-bold tracking-tighter text-xl">INTELLIGENCE PREVIEW</span>
                </div>
            </nav>

            <header className="max-w-4xl mx-auto text-center space-y-6 mb-32">
                <div className="surgical-label !text-[#00D1FF]">Data Structure: 154 Active Metrics</div>
                <h1 className="text-6xl font-black font-display tracking-tight leading-[0.9]">
                    THE BRAND<br /><span className="text-[#00D1FF]">ANATOMY.</span>
                </h1>
                <p className="text-xl text-white/40 max-w-2xl mx-auto font-medium">
                    Every audit performs a surgical scan of 150+ distinct data points across 4 primary pillars. Hover over any metric to reveal its diagnostic purpose.
                </p>
            </header>

            <main className="max-w-7xl mx-auto space-y-32 pb-32">
                {categories.map((cat, ci) => (
                    <section key={ci} className="space-y-12">
                        <div className="flex items-center gap-6">
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                                <cat.icon size={32} style={{ color: cat.color }} />
                            </div>
                            <div>
                                <h2 className="text-3xl font-black font-display tracking-tight">{cat.name}</h2>
                                <p className="text-white/30 font-medium">Core intelligence layer for brand stability</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {cat.metrics.map((m, mi) => (
                                <motion.div
                                    key={mi}
                                    whileHover={{ scale: 1.02 }}
                                    className="apple-card p-6 border-white/5 hover:border-white/20 transition-all cursor-help relative group"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-xs font-black uppercase tracking-widest text-white/20">M-{ci}{mi}</span>
                                        <Info size={14} className="text-white/10 group-hover:text-[#00D1FF] transition-colors" />
                                    </div>
                                    <h4 className="text-sm font-bold tracking-tight text-white/80 group-hover:text-white transition-colors">{m.name}</h4>

                                    {/* Tooltip */}
                                    <div className="absolute bottom-full left-0 w-full mb-2 z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                                        <div className="bg-[#00D1FF] text-black p-4 rounded-xl shadow-2xl text-[10px] leading-tight font-bold border border-white/20">
                                            {m.d}
                                        </div>
                                        <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-[#00D1FF] ml-6" />
                                    </div>
                                </motion.div>
                            ))}

                            {/* Dummy filler metrics to hit the "150" vibe */}
                            {Array.from({ length: 12 }).map((_, i) => (
                                <div key={i} className="apple-card p-6 border-white/5 opacity-20 border-dashed">
                                    <div className="w-1/2 h-2 bg-white/20 rounded-full animate-pulse mb-3" />
                                    <div className="w-3/4 h-2 bg-white/10 rounded-full" />
                                </div>
                            ))}
                        </div>
                    </section>
                ))}
            </main>

            <footer className="text-center py-20 border-t border-white/5">
                <p className="surgical-label text-white/20 mb-8">Full intelligence set accessible via L3 Commander Access</p>
                <Link href="/" className="apple-button-primary inline-flex items-center gap-3">
                    Unlock Full Scan <ArrowLeft className="rotate-180" size={18} />
                </Link>
            </footer>
        </div>
    );
}
