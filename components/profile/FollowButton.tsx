'use client';

import { useState, useEffect } from 'react';
import { FiUserCheck, FiUserPlus, FiCheck } from 'react-icons/fi';
import { databases, appwriteDatabaseId } from '@/lib/appwrite';
import { Query, ID } from 'appwrite';

interface FollowButtonProps {
    targetUserId: string;
    currentUserId?: string;
    currentUserIsVerified?: boolean;
    initialIsFollowing?: boolean;
    variant?: 'profile' | 'comment';
    isFollowingOverride?: boolean;
    isProcessingOverride?: boolean;
    onToggleOverride?: () => void;
}

export default function FollowButton({
    targetUserId,
    currentUserId,
    currentUserIsVerified,
    initialIsFollowing = false,
    variant = 'comment',
    isFollowingOverride,
    isProcessingOverride,
    onToggleOverride
}: FollowButtonProps) {
    const [internalIsFollowing, setInternalIsFollowing] = useState(initialIsFollowing);
    const [internalIsProcessing, setInternalIsProcessing] = useState(false);

    useEffect(() => {
        if (isFollowingOverride !== undefined) {
            setInternalIsFollowing(initialIsFollowing);
            return;
        }

        const verifyFollowStatus = async () => {
            if (!currentUserId || !targetUserId) return;
            try {
                const res = await databases.listDocuments(
                    appwriteDatabaseId, 
                    process.env.NEXT_PUBLIC_APPWRITE_FOLLOWERS_COLLECTION_ID as string,
                    [
                        Query.equal('followerId', currentUserId),
                        Query.equal('followingId', targetUserId),
                        Query.limit(1)
                    ]
                );
                setInternalIsFollowing(res.documents.length > 0);
            } catch (error) {
                console.error("Failed to verify follow status:", error);
            }
        };

        verifyFollowStatus();
    }, [currentUserId, targetUserId, isFollowingOverride, initialIsFollowing]);

    const isFollowing = isFollowingOverride !== undefined ? isFollowingOverride : internalIsFollowing;
    const isProcessing = isProcessingOverride !== undefined ? isProcessingOverride : internalIsProcessing;

    const handleToggle = async (e?: React.MouseEvent) => {
        if (e) {
            e.stopPropagation();
            e.preventDefault();
        }

        if (onToggleOverride) {
            return onToggleOverride();
        }

        if (!currentUserId) return;
        if (!currentUserIsVerified) {
            alert("You must verify your email to follow users.");
            return;
        }

        setInternalIsProcessing(true);
        try {
            const existingConnections = await databases.listDocuments(
                appwriteDatabaseId, 
                process.env.NEXT_PUBLIC_APPWRITE_FOLLOWERS_COLLECTION_ID as string,
                [
                    Query.equal('followerId', currentUserId),
                    Query.equal('followingId', targetUserId)
                ]
            );

            if (isFollowing) {
                if (existingConnections.documents.length > 0) {
                    for (const doc of existingConnections.documents) {
                        await databases.deleteDocument(
                            appwriteDatabaseId, 
                            process.env.NEXT_PUBLIC_APPWRITE_FOLLOWERS_COLLECTION_ID as string, 
                            doc.$id
                        );
                    }
                }
                setInternalIsFollowing(false);
            } else {
                if (existingConnections.documents.length === 0) {
                    await databases.createDocument(
                        appwriteDatabaseId, 
                        process.env.NEXT_PUBLIC_APPWRITE_FOLLOWERS_COLLECTION_ID as string, 
                        ID.unique(),
                        { followerId: currentUserId, followingId: targetUserId }
                    );
                }
                setInternalIsFollowing(true);
            }
        } catch (error) {
            console.error("Failed to toggle follow status:", error);
            alert("Failed to update follow status.");
        } finally {
            setInternalIsProcessing(false);
        }
    };

    if (variant === 'profile') {
        return (
            <button
                onClick={handleToggle}
                disabled={!currentUserIsVerified || isProcessing}
                className={`px-6 py-2.5 rounded-full font-bold flex items-center gap-2 transition-colors
                ${!currentUserIsVerified 
                    ? 'bg-white/10 text-white/50 cursor-not-allowed border border-white/10' 
                    : isFollowing 
                        ? 'bg-emerald-200 text-emerald-900 hover:bg-emerald-300' 
                        : 'bg-emerald-500 hover:bg-emerald-400 text-white'}`}
                title={!currentUserIsVerified ? "Verify your email to follow users" : ""}
            >
                {isProcessing ? (
                    <span className="opacity-70 animate-pulse">Processing...</span>
                ) : isFollowing ? (
                    <><FiUserCheck className="w-4 h-4" /><span>Following</span></>
                ) : (
                    <><FiUserPlus className="w-4 h-4" /><span>Follow</span></>
                )}
            </button>
        );
    }

    return (
        <button
            onClick={handleToggle}
            disabled={isProcessing || !currentUserIsVerified}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all
                ${!currentUserIsVerified 
                    ? 'bg-slate-50 text-slate-400 cursor-not-allowed opacity-50'
                    : isFollowing 
                        ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' 
                        : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                }`}
            title={!currentUserIsVerified ? "Verify your email to follow users" : ""}
        >
            {isProcessing ? (
                <span className="opacity-70 animate-pulse">...</span>
            ) : isFollowing ? (
                <><FiCheck className="w-3.5 h-3.5" /><span>Following</span></>
            ) : (
                <><FiUserPlus className="w-3.5 h-3.5" /><span>Follow</span></>
            )}
        </button>
    );
}