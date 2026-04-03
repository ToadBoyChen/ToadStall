import { NextResponse } from 'next/server';
import { writeClient } from '@/lib/sanity';

export async function POST(request: Request) {
    try {
        const { title, icon } = await request.json();

        if (!title || !title.trim()) {
            return NextResponse.json({ error: 'Category title is required' }, { status: 400 });
        }

        const baseSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

        const doc: any = {
            _type: 'category',
            title: title.trim(),
            slug: { _type: 'slug', current: baseSlug },
        };

        if (icon && icon.trim()) {
            doc.icon = icon.trim();
        }

        const result = await writeClient.create(doc);
        return NextResponse.json({ success: true, category: result }, { status: 201 });

    } catch (error: any) {
        console.error('Category create error:', error);
        return NextResponse.json({ error: error.message || 'Failed to create category' }, { status: 500 });
    }
}
