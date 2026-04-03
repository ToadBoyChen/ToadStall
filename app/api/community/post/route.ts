import { NextResponse } from 'next/server';
import { writeClient } from '@/lib/sanity';

export async function POST(request: Request) {
    try {
        const reqBody = await request.json();
        
        const { title, content, authorId, authorName, status, categoryIds } = reqBody;

        if (!title || !content || !authorId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const baseSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        const uniqueSlug = `${baseSlug}-${Date.now().toString().slice(-5)}`;

        const sanityDoc: any = {
            _type: 'community',
            title: title,
            slug: {
                _type: 'slug',
                current: uniqueSlug
            },
            authorName: authorName, 
            authorAppwriteId: authorId,
            publishedAt: new Date().toISOString(),
            
            body: content, 
        };

        if (status) {
            sanityDoc.status = status;
        }

        if (Array.isArray(categoryIds) && categoryIds.length > 0) {
            sanityDoc.categories = categoryIds.map((id: string) => ({
                _type: 'reference',
                _ref: id,
                _key: id,
            }));
        }

        const result = await writeClient.create(sanityDoc);
        return NextResponse.json({ success: true, post: result }, { status: 201 });

    } catch (error: any) {
        console.error('Sanity Write Error:', error);
        return NextResponse.json({ error: error.message || 'Failed to create post' }, { status: 500 });
    }
}