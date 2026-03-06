import { NextResponse } from 'next/server';
import { client } from '@/sanity/lib/client';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) return NextResponse.json([]);

    const SEARCH_QUERY: string = `
        *[
            _type in ["post", "tool"] && 
            (title match $query + "*" || summary match $query + "*")
        ] | order(_createdAt desc) [0...8] {
            _type,
            title,
            "slug": slug.current,
            "description": summary
        }
    `;

    try {
        const results: any[] = await client.fetch(
            SEARCH_QUERY, 
            { query } as Record<string, unknown>
        );
        
        const formattedResults = results.map((item: any) => ({
            title: item.title,
            href: item._type === 'tool' ? `/tool/${item.slug}` : `/articles/${item.slug}`,
            category: item._type === 'tool' ? 'Tracker' : 'Article',
            description: item.description || 'No description available.',
        }));

        return NextResponse.json(formattedResults);
    } catch (error) {
        console.error("Search error:", error);
        return NextResponse.json([], { status: 500 });
    }
}