import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';

const hasGoogleCreds =
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_ID !== 'YOUR_GOOGLE_CLIENT_ID' &&
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.GOOGLE_CLIENT_SECRET !== 'YOUR_GOOGLE_CLIENT_SECRET';

export const authOptions: NextAuthOptions = {
    secret: process.env.NEXTAUTH_SECRET || 'e43f9a72b8d0c6f1a9b2d4e7f8c0a3b5',
    session: {
        strategy: 'jwt',
    },
    providers: [
        ...(hasGoogleCreds
            ? [
                GoogleProvider({
                    clientId: process.env.GOOGLE_CLIENT_ID!,
                    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
                }),
            ]
            : []),
        CredentialsProvider({
            name: 'Demo Login',
            credentials: {
                email: { label: 'Email', type: 'email', placeholder: 'demo@turtlelabs.co' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (credentials?.email) {
                    return {
                        id: 'demo-' + Date.now(),
                        name: 'Demo User',
                        email: credentials.email,
                        tier: 'FREE'
                    };
                }
                return null;
            },
        }),
    ],
    callbacks: {
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).id = token.sub;
                (session.user as any).tier = token.tier || 'FREE';
            }
            return session;
        },
        async jwt({ token, user }: any) {
            if (user) {
                token.tier = user.tier;
            }
            return token;
        },
        async signIn({ user, account, profile }) {
            console.log('[DEBUG] AUTH_ENV_CHECK:', {
                NEXTAUTH_URL: process.env.NEXTAUTH_URL,
                GOOGLE_ID_EXISTS: !!process.env.GOOGLE_CLIENT_ID,
                NODE_ENV: process.env.NODE_ENV
            });
            
            if (!user.email) return true; 

            try {
                const { getPrisma } = await import('@/lib/db');
                const prisma = await getPrisma();
                await prisma.user.upsert({
                    where: { email: user.email },
                    update: { name: user.name, image: user.image },
                    create: { email: user.email, name: user.name, image: user.image, tier: 'FREE' }
                });
            } catch (err) {
                console.error('[DEBUG] DB UPSERT FAILED:', err);
            }
            return true;
        },
        async redirect({ url, baseUrl }) {
            // Priority 1: Use the explicit NEXTAUTH_URL if available
            const effectiveBaseUrl = process.env.NEXTAUTH_URL || baseUrl;
            
            console.log('[DEBUG] REDIRECT CALCULATION:', { 
                requestedUrl: url, 
                baseUrlIn: baseUrl, 
                effectiveBase: effectiveBaseUrl 
            });

            if (url.startsWith("/")) return `${effectiveBaseUrl}${url}`;
            
            try {
                const checkUrl = new URL(url);
                // If the URL is already absolute and matches our effective base, allow it
                if (checkUrl.origin === new URL(effectiveBaseUrl).origin) return url;
            } catch (e) {}

            return effectiveBaseUrl;
        },
    },
    pages: {
        signIn: '/auth/signin',
        error: '/auth/error',
    },
    debug: true,
    useSecureCookies: true, // Force secure on the custom domain
    events: {
        async signIn(message: any) { console.log("[DEBUG] Auth Event: signIn", message.user.email); },
        async session(message: any) { console.log("[DEBUG] Auth Event: session active"); },
    },
    logger: {
        error(code, metadata) { console.error("[AUTH ERROR]", code, metadata); },
        warn(code) { console.warn("[AUTH WARN]", code); },
        debug(code, metadata) { console.log("[AUTH DEBUG]", code, metadata); },
    }
};
