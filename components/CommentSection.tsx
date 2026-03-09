'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { databases, appwriteDatabaseId } from '@/lib/appwrite';
import { Query, ID } from 'appwrite';
import { FiMessageSquare, FiChevronDown } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import CommentItem from './CommentItem'; // Import the new component

export default function CommentSection({ postId }: { postId: string }) {
    const { user } = useAuth();
    const router = useRouter();

    const [comments, setComments] = useState<any[]>([]);
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [visibleCount, setVisibleCount] = useState(3); 
    const submitLock = useRef(false);

    const fetchComments = useCallback(async () => {
        if (!postId) return;

        try {
            const commentsRes = await databases.listDocuments(
                appwriteDatabaseId,
                process.env.NEXT_PUBLIC_APPWRITE_COMMENTS_COLLECTION_ID as string,
                [
                    Query.equal('sanityPostId', postId),
                    Query.orderDesc('$createdAt')
                ]
            );
            setComments(commentsRes.documents);
        } catch (error) {
            console.error('Failed to load comments', error);
        }
    }, [postId]);

    useEffect(() => {
        fetchComments();
    }, [fetchComments]);

    const submitComment = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            router.push('/login');
            return;
        }

        if (!newComment.trim() || submitLock.current) return;

        submitLock.current = true;
        setIsSubmitting(true);

        try {
            const commentId = ID.unique();
            const userAvatarUrl = (user as any).profile?.avatarURL || null;

            const newDoc = await databases.createDocument(
                appwriteDatabaseId,
                process.env.NEXT_PUBLIC_APPWRITE_COMMENTS_COLLECTION_ID as string,
                commentId,
                {
                    sanityPostId: postId,
                    userId: user.$id,
                    body: newComment,
                    authorName: user.name,
                    authorAvatarURL: userAvatarUrl
                }
            );

            setComments(prev => [newDoc, ...prev]);
            setVisibleCount(prev => prev + 1);
            setNewComment('');
        } catch (error) {
            console.error('Commenting error blocked:', error);
        } finally {
            submitLock.current = false;
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full">
            <div className="flex justify-end mb-8">
                <div className="flex items-center gap-2 text-slate-800 font-bold px-4 py-2 bg-white/80 rounded-full w-fit">
                    <FiMessageSquare className="w-5 h-5" />
                    <span>{comments.length} Comments</span>
                </div>
            </div>

            <div className="mb-24">
                <form onSubmit={submitComment}>
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder={user ? "Add to the discussion..." : "Sign in to join the discussion..."}
                        disabled={!user || isSubmitting}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all disabled:opacity-50"
                        rows={3}
                    />
                    <div className="mt-3 flex justify-end">
                        <button
                            type="submit"
                            disabled={!user || !newComment.trim() || isSubmitting}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-6 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Posting...' : 'Post Comment'}
                        </button>
                    </div>
                </form>
            </div>

            <div className="space-y-6">
                <h2 className="text-6xl font-black text-white tracking-tight mb-4">
                    Comments
                </h2>
                {comments.length === 0 ? (
                    <p className="text-slate-600 text-center py-8 bg-white/80 rounded-2xl">Be the first to share your thoughts.</p>
                ) : (
                    <>
                        {/* Render the extracted CommentItem component */}
                        {comments.slice(0, visibleCount).map((comment) => (
                            <CommentItem key={comment.$id} comment={comment} />
                        ))}

                        {visibleCount < comments.length && (
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