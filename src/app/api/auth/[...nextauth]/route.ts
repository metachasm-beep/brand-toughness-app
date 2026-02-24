// src/app/api/auth/[...nextauth]/route.ts
import NextAuth, { type NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';

const hasGoogleCreds =
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_ID !== 'YOUR_GOOGLE_CLIENT_ID' &&
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.GOOGLE_CLIENT_SECRET !== 'YOUR_GOOGLE_CLIENT_SECRET';

export const authOptions: NextAuthOptions = {
    secret: process.env.NEXTAUTH_SECRET,
    providers: [
        ...(hasGoogleCreds
            ? [
                GoogleProvider({
                    clientId: process.env.GOOGLE_CLIENT_ID!,
                    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
                }),
            ]
            : [
                // Fallback credentials provider so the app doesn't crash without Google OAuth
                CredentialsProvider({
                    name: 'Demo Login',
                    credentials: {
                        email: { label: 'Email', type: 'email', placeholder: 'demo@turtlelabs.co' },
                        password: { label: 'Password', type: 'password' },
                    },
                    async authorize(credentials) {
                        // Accept any email/password in demo mode – replace with real logic
                        if (credentials?.email) {
                            return {
                                id: 'demo',
                                name: 'Demo User',
                                email: credentials.email,
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
            }
            return session;
        },
    },
    pages: {
        signIn: '/auth/signin',
        error: '/auth/error',
    },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
