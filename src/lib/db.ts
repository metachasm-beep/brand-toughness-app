import { PrismaClient } from '@prisma/client';
import { PrismaD1 } from '@prisma/adapter-d1';
import { getCloudflareContext } from '@opennextjs/cloudflare';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const createPrismaClient = async () => {
    // Check if we are in the Cloudflare environment
    if (process.env.NODE_ENV === 'production') {
        const context = await getCloudflareContext({ async: true });
        const env = context.env as any;

        // Use the D1 binding 'DB' from wrangler.jsonc
        if (env.DB) {
            const adapter = new PrismaD1(env.DB);
            return new PrismaClient({ adapter });
        }

        console.warn("D1 Binding 'DB' not found in Cloudflare environment. Falling back to standard client.");
    }

    // Standard client for local development (SQLite)
    return new PrismaClient({
        log: ['query'],
    });
};

// Next.js 15 / OpenNext singleton pattern for D1
let prismaInstance: PrismaClient | null = null;

export const getPrisma = async () => {
    if (prismaInstance) return prismaInstance;

    // In development, use a global to prevent exhaustion of file descriptors
    if (process.env.NODE_ENV !== 'production') {
        if (!globalForPrisma.prisma) {
            globalForPrisma.prisma = new PrismaClient();
        }
        return globalForPrisma.prisma;
    }

    prismaInstance = await createPrismaClient();
    return prismaInstance;
};
