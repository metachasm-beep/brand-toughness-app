// src/app/api/audit/route.ts

import { NextResponse } from 'next/server';
import { ProcessWebsites } from '@/utils/googleSheet';

export async function POST(request: Request) {
    try {
        const { url } = await request.json();
        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }
        const data = await ProcessWebsites(url);
        return NextResponse.json(data);
    } catch (err: any) {
        console.error('Audit error:', err);
        return NextResponse.json({ error: err.message || 'Failed to process audit' }, { status: 500 });
    }
}

export const runtime = 'nodejs'; // ensure server runtime
