import { NextResponse } from 'next/server';
import { writeClient } from '@/lib/sanity';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const resolvedParams = await params;
        const body = await request.json();
        
        if (body.action === 'close') {
            const result = await writeClient
                .patch(resolvedParams.id)
                .set({ status: 'closed' })
                .commit();
            return NextResponse.json({ success: true, post: result });
        }
        
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error: any) {
        console.error('Sanity Update Error:', error);
        return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const resolvedParams = await params;
        await writeClient.delete(resolvedParams.id);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Sanity Delete Error:', error);
        return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
    }
}