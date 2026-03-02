import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const createPrismaClient = () => {
    if (process.env.NODE_ENV === 'production' || process.env.DATABASE_URL?.includes('supabase.co')) {
        // Edge-compatible driver for Cloudflare Workers
        const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
        const adapter = new PrismaPg(pool);
        return new PrismaClient({ adapter });
    }

    // Standard client for local development
    return new PrismaClient({
        log: ['query'],
    });
};

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
