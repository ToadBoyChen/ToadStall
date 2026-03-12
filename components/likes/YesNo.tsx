'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { databases, appwriteDatabaseId } from '@/lib/appwrite';
import { Query, ID } from 'appwrite';
import { FiThumbsUp, FiThumbsDown } from 'react-icons/fi';
import { useRouter } from 'next/navigation';

export default function YesNo({ postId, readOnly = false }: { postId: string, readOnly?: boolean }) {
    const { user } = useAuth();
    const router = useRouter();

    const [upvotes, setUpvotes] = useState(0);
    const [downvotes, setDownvotes] = useState(0);
    const [userVote, setUserVote] = useState<any>(null);
    const [isVoting, setIsVoting] = useState(false);
    const voteLock = useRef(false);

    const fetchVotes = useCallback(async () => {
        if (!postId) return;

        try {
            const votesRes = await databases.listDocuments(
                appwriteDatabaseId,
                process.env.NEXT_PUBLIC_APPWRITE_VOTES_COLLECTION_ID as string,
                [Query.equal('sanityPostId', postId)]
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
            console.error('Failed to load votes', error);
        }
    }, [postId, user]);

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
            const votesCollection = process.env.NEXT_PUBLIC_APPWRITE_VOTES_COLLECTION_ID as string;

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
                        sanityPostId: postId,
                        userId: user.$id,
                        voteType: type,
                    }
                );
                setUserVote(newVote);
                if (type === 1) setUpvotes(prev => prev + 1);
                if (type === -1) setDownvotes(prev => prev + 1);
            }
        } catch (error) {
            console.error('Voting error blocked:', error);
        } finally {
            voteLock.current = false;
            setIsVoting(false);
        }
    };

    if (readOnly) {
        return (
            <div className="flex items-center gap-4 text-slate-400 pointer-events-none">
                <div className="flex items-center gap-1.5">
                    <FiThumbsUp className="w-4 h-4" />
                    <span className="font-semibold text-sm">{upvotes}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <FiThumbsDown className="w-4 h-4" />
                    <span className="font-semibold text-sm">{downvotes}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center bg-white/80 rounded-full p-1 w-fit">
            <button
                onClick={() => handleVote(1)}
                disabled={isVoting}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${userVote?.voteType === 1 ? 'bg-emerald-500 text-white' : 'text-slate-800 hover:bg-slate-200'} disabled:opacity-70`}
            >
                <FiThumbsUp className="w-5 h-5" />
                <span className="font-bold">{upvotes}</span>
            </button>

            <button
                onClick={() => handleVote(-1)}
                disabled={isVoting}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${userVote?.voteType === -1 ? 'bg-red-500 text-white' : 'text-slate-800 hover:bg-slate-200'} disabled:opacity-70`}
            >
                <FiThumbsDown className="w-5 h-5" />
                <span className="font-bold">{downvotes}</span>
            </button>
        </div>
    );
}