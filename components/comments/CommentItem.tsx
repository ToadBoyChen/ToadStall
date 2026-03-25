'use client';

import Link from 'next/link';
import VerificationBadge from '../profile/VerificationBadge';
import ProfilePfp from '../profile/ProfilePfp'; 
import FollowButton from '../profile/FollowButton';

interface CommentItemProps {
    comment: any;
    currentUserId?: string;
    currentUserIsVerified?: boolean;
    initialIsFollowing?: boolean; 
}

export default function CommentItem({ 
    comment, 
    currentUserId, 
    currentUserIsVerified,
    initialIsFollowing = false 
}: CommentItemProps) {
    
    const isOwnComment = currentUserId === comment.userId;

    return (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex gap-4 transition-all hover:shadow-md">
            
            <Link href={`/profile/${comment.userId}`} className="shrink-0">
                <ProfilePfp 
                    userId={comment.userId} 
                    fallbackName={comment.authorName || '?'} 
                    className="w-12 h-12 hover:ring-2 hover:ring-emerald-500 hover:ring-offset-2 transition-all" 
                />
            </Link>

            <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    
                    <div className="flex items-center gap-2">
                        <Link 
                            href={`/profile/${comment.userId}`}
                            className="font-bold text-slate-900 hover:text-emerald-600 transition-colors truncate"
                        >
                            {comment.authorName}
                        </Link>
                        {comment.authorIsVerified && (
                            <div className="scale-75 origin-left">
                                <VerificationBadge isVerified={true} />
                            </div>
                        )}
                    </div>

                    {currentUserId && !isOwnComment && (
                        <FollowButton 
                            targetUserId={comment.userId}
                            currentUserId={currentUserId}
                            currentUserIsVerified={currentUserIsVerified}
                            initialIsFollowing={initialIsFollowing}
                            variant="comment"
                        />
                    )}
                </div>

                <p className="text-slate-700 whitespace-pre-wrap text-sm md:text-base leading-relaxed">
                    {comment.body}
                </p>

                <div className="mt-3 text-xs font-medium text-slate-400">
                    {new Date(comment.$createdAt).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit'
                    })}
                </div>
            </div>
        </div>
    );
}