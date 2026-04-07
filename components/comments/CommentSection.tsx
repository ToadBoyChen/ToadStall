'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { databases, appwriteDatabaseId } from '@/lib/appwrite';
import { Query, ID } from 'appwrite';
import { FiChevronDown, FiLock } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import CommentItem from './CommentItem';

export default function CommentSection({ postId, readOnly = false }: { postId: string; readOnly?: boolean }) {
    const { user } = useAuth();
    const router = useRouter();

    const [topLevel, setTopLevel] = useState<any[]>([]);
    const [repliesMap, setRepliesMap] = useState<Record<string, any[]>>({});
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [visibleCount, setVisibleCount] = useState(5);
    const submitLock = useRef(false);

    const isVerified = user?.profile?.isVerified === true;
    const canComment = user && isVerified;

    const fetchComments = useCallback(async () => {
        if (!postId) return;
        try {
            const res = await databases.listDocuments(
                appwriteDatabaseId,
                process.env.NEXT_PUBLIC_APPWRITE_COMMENTS_COLLECTION_ID as string,
                [Query.equal('sanityPostId', postId), Query.orderAsc('$createdAt'), Query.limit(500)]
            );

            const all = res.documents;
            const roots: any[] = [];
            const map: Record<string, any[]> = {};

            for (const doc of all) {
                if (doc.parentCommentId) {
                    if (!map[doc.parentCommentId]) map[doc.parentCommentId] = [];
                    map[doc.parentCommentId].push(doc);
                } else {
                    roots.push(doc);
                }
            }

            // Newest top-level first
            setTopLevel(roots.reverse());
            setRepliesMap(map);
        } catch (error) {
            console.error('Failed to load comments', error);
        }
    }, [postId]);

    useEffect(() => { fetchComments(); }, [fetchComments]);

    const handleReplyAdded = (parentCommentId: string, reply: any) => {
        setRepliesMap(prev => ({
            ...prev,
            [parentCommentId]: [...(prev[parentCommentId] ?? []), reply],
        }));
    };

    const submitComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (readOnly) return;
        if (!user) { router.push('/login'); return; }
        if (!isVerified) { alert('Please verify your email in your profile to comment.'); return; }
        if (!newComment.trim() || submitLock.current) return;

        submitLock.current = true;
        setIsSubmitting(true);

        try {
            const userAvatarUrl = (user as any).profile?.avatarURL || null;
            const newDoc = await databases.createDocument(
                appwriteDatabaseId,
                process.env.NEXT_PUBLIC_APPWRITE_COMMENTS_COLLECTION_ID as string,
                ID.unique(),
                {
                    sanityPostId: postId,
                    userId: user.$id,
                    body: newComment,
                    authorName: user.name,
                    authorAvatarURL: userAvatarUrl,
                    authorTag: (user as any).profile?.userTag || null,
                    authorTagEmoji: (user as any).profile?.userTagEmoji || null,
                    authorTagColor: (user as any).profile?.userTagColor || null,
                }
            );

            setTopLevel(prev => [newDoc, ...prev]);
            setNewComment('');
        } catch (error) {
            console.error('Commenting error:', error);
        } finally {
            submitLock.current = false;
            setIsSubmitting(false);
        }
    };

    const totalComments = topLevel.length + Object.values(repliesMap).reduce((acc, r) => acc + r.length, 0);

    return (
        <div className="w-full">
            {!readOnly && (
                <div className="mb-24">
                    <form onSubmit={submitComment} className="relative">
                        <textarea
                            value={newComment}
                            onChange={e => setNewComment(e.target.value)}
                            placeholder={
                                !user
                                    ? 'Sign in to join the discussion…'
                                    : !isVerified
                                        ? 'Verification required to comment…'
                                        : 'Add to the discussion…'
                            }
                            disabled={!canComment || isSubmitting}
                            rows={3}
                            className={`w-full border rounded-2xl p-4 text-slate-800 transition-all ${
                                !canComment
                                    ? 'bg-slate-100 border-slate-200 cursor-not-allowed'
                                    : 'bg-slate-50 border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent'
                            }`}
                        />

                        {user && !isVerified && (
                            <div className="mt-2 flex items-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-xl border border-amber-100">
                                <FiLock className="shrink-0" />
                                <p className="text-sm font-bold">
                                    Your account is unverified. Please{' '}
                                    <button
                                        onClick={e => { e.preventDefault(); router.push('/profile'); }}
                                        className="mx-1 underline hover:text-amber-700"
                                    >
                                        verify your email
                                    </button>
                                    to participate.
                                </p>
                            </div>
                        )}

                        <div className="mt-3 flex justify-end">
                            <button
                                type="submit"
                                disabled={!canComment || !newComment.trim() || isSubmitting}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-6 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? 'Posting…' : 'Post Comment'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="space-y-4">
                <div className="mb-6 sm:mb-10">
                    <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight flex items-baseline gap-3 sm:gap-4">
                        Comments
                        <span className="text-emerald-400 text-3xl md:text-5xl font-bold">
                            ({totalComments})
                        </span>
                    </h2>
                </div>

                {topLevel.length === 0 ? (
                    <p className="text-slate-600 text-center py-8 bg-white/80 rounded-2xl font-medium">
                        No comments yet. Be the first to start the discussion.
                    </p>
                ) : (
                    <>
                        {topLevel.slice(0, visibleCount).map(comment => (
                            <CommentItem
                                key={comment.$id}
                                comment={comment}
                                replies={repliesMap[comment.$id] ?? []}
                                currentUserId={user?.$id}
                                currentUserIsVerified={isVerified}
                                postId={postId}
                                onReplyAdded={handleReplyAdded}
                            />
                        ))}

                        {visibleCount < topLevel.length && (
                            <div className="pt-4 flex justify-center">
                                <button
                                    onClick={() => setVisibleCount(prev => prev + 5)}
                                    className="flex items-center gap-2 bg-white text-slate-700 hover:text-emerald-600 font-bold py-3 px-6 rounded-full shadow-sm hover:shadow transition-all border border-slate-100"
                                >
                                    <span>Show More Comments</span>
                                    <FiChevronDown className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
