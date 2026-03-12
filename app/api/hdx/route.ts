import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint');
    const countryCode = searchParams.get('countryCode');

    if (!endpoint || !countryCode) {
        return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const url = `https://hapi.humdata.org${endpoint}?location_code=${countryCode}`;

    try {
        const res = await fetch(url, {
            headers: {
                "X-HDX-HAPI-APP-IDENTIFIER": process.env.HDX_APP_IDENTIFIER || "toadstall-explorer",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
                "Accept": "application/json"
            },
            cache: 'no-store' 
        });

        if (!res.ok) {
            const text = await res.text();
            return NextResponse.json({ error: `HDX Error ${res.status}: ${text}` }, { status: res.status });
        }

        const data = await res.json();
        return NextResponse.json(data);

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}