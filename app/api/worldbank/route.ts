import { NextRequest, NextResponse } from 'next/server';

// Force dynamic — this route reads query params so it must never be statically cached.
// Response-level caching is handled via Cache-Control headers for Vercel's CDN.
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const { searchParams } = request.nextUrl;
    const indicator = searchParams.get('indicator');
    const country = searchParams.get('country');
    const start = searchParams.get('start') || '2000';
    const end = searchParams.get('end') || new Date().getFullYear().toString();

    if (!indicator || !country) {
        return NextResponse.json({ error: 'indicator and country are required' }, { status: 400 });
    }

    const wbUrl = `https://api.worldbank.org/v2/country/${country}/indicator/${indicator}?format=json&per_page=100&date=${start}:${end}`;

    try {
        // Cache the upstream WB response for 24h in Next.js data cache.
        // This is safe on individual fetch calls even with force-dynamic on the route.
        const res = await fetch(wbUrl, { next: { revalidate: 86400 } });

        if (!res.ok) {
            console.error(`[worldbank] upstream ${res.status} for ${wbUrl}`);
            return NextResponse.json({ data: [], indicatorLabel: indicator, countryName: country });
        }

        const json = await res.json();

        if (!Array.isArray(json) || !json[1]) {
            console.error('[worldbank] unexpected response shape');
            return NextResponse.json({ data: [], indicatorLabel: indicator, countryName: country });
        }

        if (json[0]?.message) {
            console.error('[worldbank]', json[0].message[0]?.value);
            return NextResponse.json({ data: [], indicatorLabel: indicator, countryName: country });
        }

        const raw: any[] = json[1].filter((item: any) => item.value !== null);
        if (raw.length === 0) {
            return NextResponse.json({ data: [], indicatorLabel: indicator, countryName: country });
        }

        const indicatorLabel: string = raw[0]?.indicator?.value || indicator;
        const countryName: string = raw[0]?.country?.value || country;

        const data = raw
            .sort((a, b) => parseInt(a.date) - parseInt(b.date))
            .map((item) => ({ label: item.date, [countryName]: item.value }));

        return NextResponse.json(
            { data, indicatorLabel, countryName },
            { headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' } }
        );
    } catch (error: any) {
        console.error('[worldbank] proxy error:', error);
        return NextResponse.json({ data: [], indicatorLabel: indicator, countryName: country });
    }
}
