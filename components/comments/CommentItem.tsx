'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { databases, appwriteDatabaseId } from '@/lib/appwrite';
import { ID, Query } from 'appwrite';
import { FiCornerDownRight, FiMessageSquare, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import ProfilePfp from '../profile/ProfilePfp';
import FollowButton from '../profile/FollowButton';
import CommentVotes from './CommentVotes';
import UserTagBadge from '../profile/UserTagBadge';

interface CommentItemProps {
    comment: any;
    replies?: any[];
    currentUserId?: string;
    currentUserIsVerified?: boolean;
    postId: string;
    onReplyAdded?: (parentCommentId: string, reply: any) => void;
    isReply?: boolean;
}

function formatDate(dateStr: string) {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function CommentItem({
    comment,
    replies = [],
    currentUserId,
    currentUserIsVerified,
    postId,
    onReplyAdded,
    isReply = false,
}: CommentItemProps) {
    const { user } = useAuth();
    const router = useRouter();

    const [resolvedTag, setResolvedTag] = useState<{ label: string; emoji: string; color: string } | null>(
        comment.authorTag
            ? { label: comment.authorTag, emoji: comment.authorTagEmoji || '', color: comment.authorTagColor || 'slate' }
            : null
    );

    // For existing comments without tag data, fetch live from profile
    useEffect(() => {
        if (comment.authorTag || !comment.userId) return;
        databases.listDocuments(
            appwriteDatabaseId,
            process.env.NEXT_PUBLIC_APPWRITE_PROFILES_COLLECTION_ID as string,
            [Query.equal('userID', comment.userId), Query.limit(1)]
        ).then(res => {
            const p = res.documents[0];
            if (p?.userTag) {
                setResolvedTag({ label: p.userTag, emoji: p.userTagEmoji || '', color: p.userTagColor || 'slate' });
            }
        }).catch(() => {});
    }, [comment.userId, comment.authorTag]);

    const [showReplyForm, setShowReplyForm] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showReplies, setShowReplies] = useState(true);
    const submitLock = useRef(false);

    const isOwnComment = currentUserId === comment.userId;

    const submitReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) { router.push('/login'); return; }
        if (!currentUserIsVerified) return;
        if (!replyText.trim() || submitLock.current) return;

        submitLock.current = true;
        setIsSubmitting(true);

        try {
            const userAvatarUrl = (user as any).profile?.avatarURL || null;
            const newReply = await databases.createDocument(
                appwriteDatabaseId,
                process.env.NEXT_PUBLIC_APPWRITE_COMMENTS_COLLECTION_ID as string,
                ID.unique(),
                {
                    sanityPostId: postId,
                    parentCommentId: comment.$id,
                    userId: user.$id,
                    body: replyText,
                    authorName: user.name,
                    authorAvatarURL: userAvatarUrl,
                    authorTag: (user as any).profile?.userTag || null,
                    authorTagEmoji: (user as any).profile?.userTagEmoji || null,
                    authorTagColor: (user as any).profile?.userTagColor || null,
                }
            );

            onReplyAdded?.(comment.$id, newReply);
            setReplyText('');
            setShowReplyForm(false);
            setShowReplies(true);
        } catch (error) {
            console.error('Reply error:', error);
        } finally {
            submitLock.current = false;
            setIsSubmitting(false);
        }
    };

    return (
        <div className={isReply ? 'ml-8 sm:ml-12' : ''}>
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex gap-3">
                    {/* Avatar */}
                    <Link href={`/profile/${comment.userId}`} className="shrink-0 mt-0.5">
                        <ProfilePfp
                            userId={comment.userId}
                            fallbackName={comment.authorName || '?'}
                            className="w-9 h-9 hover:ring-2 hover:ring-emerald-400 hover:ring-offset-2 transition-all"
                        />
                    </Link>

                    <div className="flex-1 min-w-0">
                        {/* Header row */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 min-w-0">
                                <Link
                                    href={`/profile/${comment.userId}`}
                                    className="text-sm font-bold text-slate-900 hover:text-emerald-600 transition-colors shrink-0"
                                >
                                    {comment.authorName}
                                </Link>

                                {resolvedTag && (
                                    <UserTagBadge label={resolvedTag.label} emoji={resolvedTag.emoji} color={resolvedTag.color} />
                                )}

                                <span className="text-xs text-slate-400 shrink-0">
                                    {formatDate(comment.$createdAt)}
                                </span>
                            </div>

                            {currentUserId && !isOwnComment && (
                                <div className="shrink-0">
                                    <FollowButton
                                        targetUserId={comment.userId}
                                        currentUserId={currentUserId}
                                        currentUserIsVerified={currentUserIsVerified}
                                        initialIsFollowing={false}
                                        variant="comment"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Comment body */}
                        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap mb-3">
                            {comment.body}
                        </p>

                        {/* Action row */}
                        <div className="flex items-center gap-2">
                            <CommentVotes commentId={comment.$id} />

                            <div className="w-px h-3.5 bg-slate-200" />

                            {!isReply && (
                                <button
                                    onClick={() => {
                                        if (!user) { router.push('/login'); return; }
                                        setShowReplyForm(v => !v);
                                    }}
                                    className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold transition-colors ${
                                        showReplyForm
                                            ? 'text-emerald-600 bg-emerald-50'
                                            : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                                    }`}
                                >
                                    <FiMessageSquare className="w-3.5 h-3.5" />
                                    Reply
                                </button>
                            )}

                            {!isReply && replies.length > 0 && (
                                <button
                                    onClick={() => setShowReplies(v => !v)}
                                    className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                                >
                                    <FiCornerDownRight className="w-3.5 h-3.5" />
                                    {showReplies
                                        ? <><FiChevronUp className="w-3 h-3" /> Hide</>
                                        : <>{replies.length} {replies.length === 1 ? 'reply' : 'replies'} <FiChevronDown className="w-3 h-3" /></>
                                    }
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Inline reply form */}
            {showReplyForm && (
                <div className="ml-8 sm:ml-12 mt-2">
                    <form onSubmit={submitReply} className="bg-white rounded-2xl border border-slate-200 p-4">
                        <textarea
                            value={replyText}
                            onChange={e => setReplyText(e.target.value)}
                            placeholder={
                                !currentUserIsVerified
                                    ? 'Verify your email to reply…'
                                    : `Reply to ${comment.authorName}…`
                            }
                            disabled={!currentUserIsVerified || isSubmitting}
                            rows={2}
                            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 bg-slate-50 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <div className="flex justify-end gap-2 mt-2.5">
                            <button
                                type="button"
                                onClick={() => { setShowReplyForm(false); setReplyText(''); }}
                                className="text-xs font-semibold text-slate-500 hover:text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={!currentUserIsVerified || !replyText.trim() || isSubmitting}
                                className="text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? 'Posting…' : 'Post reply'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Threaded replies */}
            {!isReply && showReplies && replies.length > 0 && (
                <div className="mt-2 flex flex-col gap-2 border-l-2 border-slate-100 ml-4 pl-4">
                    {replies.map(reply => (
                        <CommentItem
                            key={reply.$id}
                            comment={reply}
                            currentUserId={currentUserId}
                            currentUserIsVerified={currentUserIsVerified}
                            postId={postId}
                            isReply
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
