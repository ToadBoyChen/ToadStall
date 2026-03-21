'use client';

import { useState, useEffect, useCallback } from 'react';
import { databases, appwriteDatabaseId } from '@/lib/appwrite';
import { Query } from 'appwrite';
import { FiMessageSquare } from 'react-icons/fi';

interface CommentCountBadgeProps {
    postId: string;
    subtle?: boolean;
}

export default function CommentCountBadge({ postId, subtle = false }: CommentCountBadgeProps) {
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

    if (subtle) {
        return (
            <div className="flex items-center gap-1.5 text-slate-400 pointer-events-none">
                <FiMessageSquare className="w-4 h-4" />
                <span className="font-semibold text-sm">{count}</span>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2 text-slate-800 font-bold px-4 py-2 bg-white/80 rounded-full pointer-events-none">
            <FiMessageSquare className="w-5 h-5 text-slate-800" />
            <span>{count}</span>
        </div>
    );
}