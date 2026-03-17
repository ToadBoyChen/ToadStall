import { NextResponse } from 'next/server';
import { writeClient } from '@/lib/sanity';

const generateKey = () => Math.random().toString(36).substring(2, 12);

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { title, content, authorId, authorName } = body;

        if (!title || !content || !authorId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const baseSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        const uniqueSlug = `${baseSlug}-${Date.now().toString().slice(-5)}`;

        const sanityDoc = {
            _type: 'community',
            title: title,
            slug: {
                _type: 'slug',
                current: uniqueSlug
            },
            authorName: authorName, 
            authorAppwriteId: authorId,
            status: 'open',
            publishedAt: new Date().toISOString(),
            body: [
                {
                    _type: 'block',
                    _key: generateKey(),
                    style: 'normal',
                    markDefs: [],
                    children: [
                        {
                            _type: 'span',
                            _key: generateKey(),
                            text: content,
                            marks: [],
                        }
                    ]
                }
            ]
        };

        const result = await writeClient.create(sanityDoc);
        return NextResponse.json({ success: true, post: result }, { status: 201 });

    } catch (error: any) {
        console.error('Sanity Write Error:', error);
        return NextResponse.json({ error: error.message || 'Failed to create post' }, { status: 500 });
    }
}