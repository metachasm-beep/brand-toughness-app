import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Standard Next.js singleton pattern for Prisma
let prismaInstance: PrismaClient | null = null;

export const getPrisma = async () => {
    if (prismaInstance) return prismaInstance;

    // In development, use a global to prevent exhaustion of file descriptors across hot reloads
    if (process.env.NODE_ENV !== 'production') {
        if (!globalForPrisma.prisma) {
            globalForPrisma.prisma = new PrismaClient({ log: ['query'] });
        }
        return globalForPrisma.prisma;
    }

    prismaInstance = new PrismaClient();
    return prismaInstance;
};
