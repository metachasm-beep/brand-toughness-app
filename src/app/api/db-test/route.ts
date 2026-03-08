import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const prisma = await getPrisma();
        
        // 1. Check if we can reach the database
        const dbTime = await prisma.$queryRaw`SELECT now() as time`;
        
        // 2. Check if the tables exist
        const tableCount = await prisma.$queryRaw`
            SELECT count(*) 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('User', 'Audit', 'AuditFinding')
        `;

        return NextResponse.json({
            status: 'CONNECTED',
            message: 'Successfully reached Supabase',
            telemetry: {
                dbTimestamp: (dbTime as any)[0]?.time,
                tablesFound: (tableCount as any)[0]?.count
            }
        });
    } catch (err: any) {
        console.error('[DB TEST ERROR]:', err);
        return NextResponse.json({
            status: 'ERROR',
            message: 'Failed to reach Supabase database',
            error: err.message,
            code: err.code || 'UNKNOWN',
            suggestion: 'Check if your Render DATABASE_URL environment variable is correct and includes ?sslmode=require'
        }, { status: 500 });
    }
}
