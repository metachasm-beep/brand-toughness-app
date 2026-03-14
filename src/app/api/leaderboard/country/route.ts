import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const revalidate = 21600;

type CountryRow = {
  rank: number;
  domain: string;
  brand: string;
  countryCode: string;
  source: 'cloudflare-radar';
};

type RadarListItem = {
  rank?: number;
  domain?: string;
};

type RadarApiResponse = {
  result?: {
    top_0?: RadarListItem[];
    top?: RadarListItem[];
    domains?: RadarListItem[];
  };
  success?: boolean;
  errors?: Array<{ message?: string }>;
};

function titleCaseFromDomain(domain: string): string {
  const base = domain.replace(/^www\./, '').split('.')[0] || domain;
  return base
    .split(/[-_]/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function countryNameFromCode(code: string): string {
  try {
    const display = new Intl.DisplayNames(['en'], { type: 'region' });
    return display.of(code.toUpperCase()) || code.toUpperCase();
  } catch {
    return code.toUpperCase();
  }
}

function extractRadarList(data: RadarApiResponse): RadarListItem[] {
  if (Array.isArray(data?.result?.top_0)) return data.result.top_0;
  if (Array.isArray(data?.result?.top)) return data.result.top;
  if (Array.isArray(data?.result?.domains)) return data.result.domains;
  return [];
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = (searchParams.get('code') || 'IN').toUpperCase();

    const token = process.env.CLOUDFLARE_RADAR_API_TOKEN;
    if (!token) {
      return NextResponse.json(
        {
          error: 'Missing CLOUDFLARE_RADAR_API_TOKEN',
          source: 'cloudflare-radar',
        },
        { status: 500 }
      );
    }

    const endpoint =
      `https://api.cloudflare.com/client/v4/radar/ranking/top` +
      `?name=top&location=${encodeURIComponent(code)}&limit=100`;

    const res = await fetch(endpoint, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
      next: { revalidate: 21600 },
    });

    const raw = await res.text();

    if (!res.ok) {
      return NextResponse.json(
        {
          error: `Failed to fetch country leaderboard (HTTP ${res.status})`,
          details: raw.slice(0, 1000),
          source: 'cloudflare-radar',
        },
        { status: 502 }
      );
    }

    let data: RadarApiResponse;
    try {
      data = JSON.parse(raw) as RadarApiResponse;
    } catch {
      return NextResponse.json(
        {
          error: 'Cloudflare Radar returned invalid JSON',
          details: raw.slice(0, 1000),
          source: 'cloudflare-radar',
        },
        { status: 502 }
      );
    }

    const list = extractRadarList(data);

    if (!list.length) {
      return NextResponse.json(
        {
          error: 'Cloudflare Radar returned no ranked domains for this country query',
          source: 'cloudflare-radar',
          countryCode: code,
          debug: {
            success: data?.success ?? null,
            errors: data?.errors ?? [],
            resultKeys: data?.result ? Object.keys(data.result) : [],
            preview: raw.slice(0, 1000),
          },
        },
        { status: 502 }
      );
    }

    const rows: CountryRow[] = list
      .filter((item) => item && item.domain)
      .map((item, index) => ({
        rank: Number(item.rank || index + 1),
        domain: String(item.domain || '').trim(),
        brand: titleCaseFromDomain(String(item.domain || '').trim()),
        countryCode: code,
        source: 'cloudflare-radar',
      }));

    return NextResponse.json({
      scope: 'country',
      countryCode: code,
      countryName: countryNameFromCode(code),
      label: `${countryNameFromCode(code)} Top 100`,
      source: 'Cloudflare Radar',
      rows,
      total: rows.length,
      lastUpdated: new Date().toISOString(),
    });
  } catch (err: unknown) {
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : 'Country leaderboard fetch failed',
        source: 'cloudflare-radar',
      },
      { status: 500 }
    );
  }
        }
