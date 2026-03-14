import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const revalidate = 43200;

type GlobalRow = {
  rank: number;
  domain: string;
  brand: string;
  source: 'tranco';
};

function titleCaseFromDomain(domain: string): string {
  const base = domain.replace(/^www\./, '').split('.')[0] || domain;
  return base
    .split(/[-_]/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export async function GET() {
  try {
    const res = await fetch('https://tranco-list.eu/top-1m.csv.zip', {
      next: { revalidate: 43200 },
      headers: {
        Accept: 'application/zip, application/octet-stream, */*',
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        {
          error: `Failed to fetch Tranco list (HTTP ${res.status})`,
          source: 'tranco',
        },
        { status: 502 }
      );
    }

    const arrayBuffer = await res.arrayBuffer();
    const { unzipSync, strFromU8 } = await import('fflate');

    const zipped = new Uint8Array(arrayBuffer);
    const files = unzipSync(zipped);

    const firstFileName = Object.keys(files)[0];
    if (!firstFileName) {
      return NextResponse.json(
        { error: 'Tranco zip was empty', source: 'tranco' },
        { status: 502 }
      );
    }

    const csvText = strFromU8(files[firstFileName]);
    const lines = csvText.split(/\r?\n/).filter(Boolean).slice(0, 10000);

    const rows: GlobalRow[] = lines.map((line) => {
      const [rankRaw, domainRaw] = line.split(',');
      const rank = Number(rankRaw);
      const domain = String(domainRaw || '').trim();

      return {
        rank,
        domain,
        brand: titleCaseFromDomain(domain),
        source: 'tranco',
      };
    });

    return NextResponse.json({
      scope: 'global',
      label: 'Global Top 10,000',
      source: 'Tranco',
      rows,
      total: rows.length,
      lastUpdated: new Date().toISOString(),
    });
  } catch (err: unknown) {
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : 'Global leaderboard fetch failed',
        source: 'tranco',
      },
      { status: 500 }
    );
  }
}
