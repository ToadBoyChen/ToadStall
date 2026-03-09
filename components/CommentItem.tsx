'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { databases, appwriteDatabaseId } from '@/lib/appwrite';
import { Query, ID } from 'appwrite';
import { FiThumbsUp, FiThumbsDown } from 'react-icons/fi';
import { useRouter } from 'next/navigation';

export default function CommentItem({ comment }: { comment: any }) {
    const { user } = useAuth();
    const router = useRouter();

    const [upvotes, setUpvotes] = useState(0);
    const [downvotes, setDownvotes] = useState(0);
    const [userVote, setUserVote] = useState<any>(null);
    const [isVoting, setIsVoting] = useState(false);
    const voteLock = useRef(false);

    const fetchVotes = useCallback(async () => {
        try {
            const votesRes = await databases.listDocuments(
                appwriteDatabaseId,
                process.env.NEXT_PUBLIC_APPWRITE_COMMENT_VOTES_COLLECTION_ID as string,
                [Query.equal('commentId', comment.$id)]
            );

            let ups = 0;
            let downs = 0;
            let currentUserVoteDoc = null;

            votesRes.documents.forEach((vote) => {
                if (vote.voteType === 1) ups++;
                if (vote.voteType === -1) downs++;
                if (user && vote.userId === user.$id) {
                    currentUserVoteDoc = vote;
                }
            });

            setUpvotes(ups);
            setDownvotes(downs);
            setUserVote(currentUserVoteDoc);
        } catch (error) {
            console.error('Failed to load comment votes', error);
        }
    }, [comment.$id, user]);

    useEffect(() => {
        fetchVotes();
    }, [fetchVotes]);

    const handleVote = async (type: 1 | -1) => {
        if (!user) {
            router.push('/login');
            return;
        }

        if (voteLock.current) return;
        voteLock.current = true;
        setIsVoting(true);

        try {
            const votesCollection = process.env.NEXT_PUBLIC_APPWRITE_COMMENT_VOTES_COLLECTION_ID as string;

            if (userVote) {
                if (userVote.voteType === type) {
                    await databases.deleteDocument(appwriteDatabaseId, votesCollection, userVote.$id);
                    setUserVote(null);
                    if (type === 1) setUpvotes(prev => prev - 1);
                    if (type === -1) setDownvotes(prev => prev - 1);
                } else {
                    const updatedVote = await databases.updateDocument(
                        appwriteDatabaseId,
                        votesCollection,
                        userVote.$id,
                        { voteType: type }
                    );
                    setUserVote(updatedVote);
                    if (type === 1) {
                        setUpvotes(prev => prev + 1);
                        setDownvotes(prev => prev - 1);
                    } else {
                        setDownvotes(prev => prev + 1);
                        setUpvotes(prev => prev - 1);
                    }
                }
            } else {
                const newVote = await databases.createDocument(
                    appwriteDatabaseId,
                    votesCollection,
                    ID.unique(),
                    {
                        commentId: comment.$id,
                        userId: user.$id,
                        voteType: type,
                    }
                );
                setUserVote(newVote);
                if (type === 1) setUpvotes(prev => prev + 1);
                if (type === -1) setDownvotes(prev => prev + 1);
            }
        } catch (error) {
            console.error('Comment voting error blocked:', error);
        } finally {
            voteLock.current = false;
            setIsVoting(false);
        }
    };

    return (
        <div className="bg-white/80 p-6 rounded-2xl shadow-md">
            <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-emerald-100 text-emerald-700 font-bold rounded-full flex items-center justify-center overflow-hidden shrink-0">
                    {comment.authorAvatarURL ? (
                        <img src={comment.authorAvatarURL} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                        comment.authorName ? comment.authorName.charAt(0).toUpperCase() : '?'
                    )}
                </div>
                <div>
                    <p className="text-sm font-bold text-slate-800">
                        {comment.authorName || 'Anonymous Toad'}
                    </p>
                    <p className="text-xs text-slate-500 font-medium">
                        {new Date(comment.$createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                </div>
            </div>
            
            <p className="text-slate-700 leading-relaxed font-medium mb-4">
                {comment.body}
            </p>

            {/* NEW: Comment Vote Buttons */}
            <div className="flex items-center gap-1">
                <button
                    onClick={() => handleVote(1)}
                    disabled={isVoting}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold transition-colors ${
                        userVote?.voteType === 1 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'text-slate-500 hover:bg-slate-100'
                    } disabled:opacity-70`}
                >
                    <FiThumbsUp className="w-4 h-4" />
                    <span>{upvotes}</span>
                </button>

                <button
                    onClick={() => handleVote(-1)}
                    disabled={isVoting}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold transition-colors ${
                        userVote?.voteType === -1 
                        ? 'bg-red-100 text-red-600' 
                        : 'text-slate-500 hover:bg-slate-100'
                    } disabled:opacity-70`}
                >
                    <FiThumbsDown className="w-4 h-4" />
                    <span>{downvotes}</span>
                </button>
            </div>
        </div>
    );
}