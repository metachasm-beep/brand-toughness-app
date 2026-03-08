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
            : [
                CredentialsProvider({
                    name: 'Demo Login',
                    credentials: {
                        email: { label: 'Email', type: 'email', placeholder: 'demo@turtlelabs.co' },
                        password: { label: 'Password', type: 'password' },
                    },
                    async authorize(credentials) {
                        if (credentials?.email) {
                            return {
                                id: 'demo',
                                name: 'Demo User',
                                email: credentials.email,
                                tier: 'FREE'
                            };
                        }
                        return null;
                    },
                }),
            ]),
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
            console.log('[DEBUG] NEXTAUTH SIGN-IN ATTEMPT:', { email: user.email, provider: account?.provider });
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
                console.error('Error upserting user on signin:', err);
            }
            return true;
        },
        async redirect({ url, baseUrl }) {
            // Allows relative callback URLs
            if (url.startsWith("/")) return `${baseUrl}${url}`
            // Allows callback URLs on the same origin (custom domain)
            else if (new URL(url).origin === baseUrl) return url
            return baseUrl
        },
    },
    pages: {
        signIn: '/auth/signin',
        error: '/auth/error',
    },
    debug: true,
    events: {
        async signIn(message) { console.log("[DEBUG] Auth Event: signIn", message.user.email); },
        async createUser(message) { console.log("[DEBUG] Auth Event: createUser", message.user.email); },
        async session(message) { console.log("[DEBUG] Auth Event: session active"); },
    }
};
