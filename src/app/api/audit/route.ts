// src/app/api/audit/route.ts
import { NextResponse } from 'next/server';
import { ProcessWebsites } from '@/utils/googleSheet';

export const maxDuration = 120; // allow up to 2 minutes (Vercel/Cloudflare limit)
export const runtime = 'nodejs';

export async function POST(request: Request) {
    try {
        const { url } = await request.json();
        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        const result = await ProcessWebsites(url);
        return NextResponse.json(result);
    } catch (err: any) {
        console.error('Audit error:', err);
        return NextResponse.json(
            { error: err.message || 'Failed to process audit' },
            { status: 500 }
        );
    }
}
