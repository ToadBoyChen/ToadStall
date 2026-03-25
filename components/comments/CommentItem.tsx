'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FiUserPlus, FiCheck } from 'react-icons/fi';
import VerificationBadge from '../profile/VerificationBadge';
import ProfilePfp from '../profile/ProfilePfp'; // <-- Make sure this path matches where you saved the component

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
    
    const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
    const [isProcessing, setIsProcessing] = useState(false);

    const isOwnComment = currentUserId === comment.userId;

    const handleFollow = async () => {
        if (!currentUserIsVerified) {
            alert("You must verify your email to follow users.");
            return;
        }

        setIsProcessing(true);
        try {
            // Your follow logic here
            setIsFollowing(!isFollowing);
        } catch (error) {
            console.error("Failed to follow user:", error);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex gap-4 transition-all hover:shadow-md">
            
            <Link href={`/profile/${comment.userId}`} className="shrink-0">
                {/* Replaced static image with dynamic ProfilePfp */}
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
                        <button
                            onClick={handleFollow}
                            disabled={isProcessing || !currentUserIsVerified}
                            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all
                                ${!currentUserIsVerified 
                                    ? 'bg-slate-50 text-slate-400 cursor-not-allowed opacity-50'
                                    : isFollowing 
                                        ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' 
                                        : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                                }
                            `}
                            title={!currentUserIsVerified ? "Verify your email to follow users" : ""}
                        >
                            {isFollowing ? (
                                <>
                                    <FiCheck className="w-3.5 h-3.5" />
                                    <span>Following</span>
                                </>
                            ) : (
                                <>
                                    <FiUserPlus className="w-3.5 h-3.5" />
                                    <span>Follow</span>
                                </>
                            )}
                        </button>
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