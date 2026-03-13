'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FiUserPlus, FiCheck } from 'react-icons/fi';
import VerificationBadge from '../profile/VerificationBadge';

interface CommentItemProps {
    comment: any;
    currentUserId?: string;
    currentUserIsVerified?: boolean;
}

export default function CommentItem({ comment, currentUserId, currentUserIsVerified }: CommentItemProps) {
    const [isFollowing, setIsFollowing] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const isOwnComment = currentUserId === comment.userId;

    const handleFollow = async () => {
        if (!currentUserIsVerified) {
            alert("You must verify your email to follow users.");
            return;
        }

        setIsProcessing(true);
        try {
            setIsFollowing(!isFollowing);
        } catch (error) {
            console.error("Failed to follow user:", error);
        } finally {
            setIsProcessing(false);
        }
    };

    const initial = comment.authorName ? comment.authorName.charAt(0).toUpperCase() : '?';

    return (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex gap-4 transition-all hover:shadow-md">
            
            <Link href={`/profile/${comment.userId}`} className="shrink-0">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-700 font-black rounded-full flex items-center justify-center overflow-hidden hover:ring-2 hover:ring-emerald-500 hover:ring-offset-2 transition-all">
                    {comment.authorAvatarURL ? (
                        <img src={comment.authorAvatarURL} alt={comment.authorName} className="w-full h-full object-cover" />
                    ) : (
                        initial
                    )}
                </div>
            </Link>

            <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    
                    <div className="flex items-center gap-2">
                        {/* Clickable Name */}
                        <Link 
                            href={`/profile/${comment.userId}`}
                            className="font-bold text-slate-900 hover:text-emerald-600 transition-colors truncate"
                        >
                            {comment.authorName}
                        </Link>

                        {/* Verified Badge */}
                        {comment.authorIsVerified && (
                            <div className="scale-75 origin-left">
                                <VerificationBadge isVerified={true} />
                            </div>
                        )}
                    </div>

                    {/* Follow Button (Hidden if it's your own comment or you aren't logged in) */}
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