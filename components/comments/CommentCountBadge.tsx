'use client';

import { useState, useEffect, useCallback } from 'react';
import { databases, appwriteDatabaseId } from '@/lib/appwrite';
import { Query } from 'appwrite';
import { FiMessageSquare } from 'react-icons/fi';

export default function CommentCountBadge({ postId }: { postId: string }) {
    const [count, setCount] = useState(0);

    const fetchCommentCount = useCallback(async () => {
        if (!postId) return;

        try {
            const res = await databases.listDocuments(
                appwriteDatabaseId,
                process.env.NEXT_PUBLIC_APPWRITE_COMMENTS_COLLECTION_ID as string,
                [
                    Query.equal('sanityPostId', postId),
                    Query.limit(1)
                ]
            );
            setCount(res.total);
        } catch (error) {
            console.error('Failed to load comment count', error);
        }
    }, [postId]);

    useEffect(() => {
        fetchCommentCount();
    }, [fetchCommentCount]);

    return (
        <div className="flex items-center gap-2 text-slate-700 font-bold px-4 py-2 bg-slate-100 rounded-full pointer-events-none">
            <FiMessageSquare className="w-5 h-5 text-slate-500" />
            <span>{count}</span>
        </div>
    );
}