import { NextResponse } from 'next/server';
import { client } from '@/sanity/lib/client';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) return NextResponse.json([]);

    // 1. Update the _type array to match your StructureResolver
    // 2. Add draft exclusion to prevent unpublished content from showing in search
    const SEARCH_QUERY: string = `
        *[
            _type in ["article", "community", "data", "tools-technical"] && 
            !(_id in path('drafts.**')) &&
            (title match $query + "*" || summary match $query + "*" || pt::text(body) match $query + "*")
        ] | order(_createdAt desc) [0...8] {
            _type,
            title,
            "slug": slug.current,
            "description": coalesce(
                summary, 
                array::join(string::split(pt::text(body), "")[0..100], "") + "...",
                "No description available."
            )
        }
    `;

    try {
        const results: any[] = await client.fetch(
            SEARCH_QUERY,
            { query } as Record<string, unknown>
        );

        const formattedResults = results.map((item: any) => {
            // Dynamically assign the correct URL path and badge label based on the Sanity document type
            let href = '/';
            let category = 'Content';

            switch (item._type) {
                case 'article':
                    href = `/articles/${item.slug}`;
                    category = 'Article';
                    break;
                case 'community':
                    href = `/community/${item.slug}`;
                    category = 'Discussion';
                    break;
                case 'data':
                    href = `/data/${item.slug}`;
                    category = 'Data Hub';
                    break;
                case 'tools-technical':
                    href = `/tools/${item.slug}`; // Change to /tool/ if your frontend folder is singular
                    category = 'Tool';
                    break;
            }

            return {
                title: item.title,
                href,
                category,
                description: item.description,
            };
        });

        return NextResponse.json(formattedResults);
    } catch (error) {
        console.error("Search error:", error);
        return NextResponse.json([], { status: 500 });
    }
}