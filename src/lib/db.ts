import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const createPrismaClient = () => {
    // When running on Cloudflare, we prefer Hyperdrive or Driver Adapters
    if (process.env.NODE_ENV === 'production') {
        // DATABASE_URL in production should be your Hyperdrive connection string
        const connectionString = process.env.DATABASE_URL;

        if (!connectionString) {
            console.warn("DATABASE_URL not found in production environment.");
        }

        const pool = new pg.Pool({ connectionString });
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
