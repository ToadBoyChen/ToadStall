import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const res = await fetch('https://api.worldbank.org/v2/country?format=json&per_page=300');

        if (!res.ok) {
            console.error(`[worldbank/countries] upstream ${res.status}`);
            return NextResponse.json([]);
        }

        const json = await res.json();

        if (!Array.isArray(json) || !json[1]) {
            return NextResponse.json([]);
        }

        const countries = json[1]
            .filter((c: any) => c.region?.id !== 'NA')
            .map((c: any) => ({ code: c.id, name: c.name }))
            .sort((a: any, b: any) => a.name.localeCompare(b.name));

        return NextResponse.json(countries, {
            headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800' },
        });
    } catch (error: any) {
        console.error('[worldbank/countries] proxy error:', error);
        return NextResponse.json([]);
    }
}
