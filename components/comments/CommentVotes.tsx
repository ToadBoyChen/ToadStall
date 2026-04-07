'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { databases, appwriteDatabaseId } from '@/lib/appwrite';
import { Query, ID } from 'appwrite';
import { FiThumbsUp, FiThumbsDown } from 'react-icons/fi';
import { useRouter } from 'next/navigation';

export default function CommentVotes({ commentId }: { commentId: string }) {
    const { user } = useAuth();
    const router = useRouter();

    const [upvotes, setUpvotes] = useState(0);
    const [downvotes, setDownvotes] = useState(0);
    const [userVote, setUserVote] = useState<any>(null);
    const [isVoting, setIsVoting] = useState(false);
    const voteLock = useRef(false);

    const collection = process.env.NEXT_PUBLIC_APPWRITE_COMMENT_VOTES_COLLECTION_ID as string;

    const fetchVotes = useCallback(async () => {
        try {
            const res = await databases.listDocuments(appwriteDatabaseId, collection, [
                Query.equal('commentId', commentId),
            ]);
            let ups = 0, downs = 0, mine: any = null;
            for (const v of res.documents) {
                if (v.voteType === 1) ups++;
                if (v.voteType === -1) downs++;
                if (user && v.userId === user.$id) mine = v;
            }
            setUpvotes(ups);
            setDownvotes(downs);
            setUserVote(mine);
        } catch {}
    }, [commentId, user, collection]);

    useEffect(() => { fetchVotes(); }, [fetchVotes]);

    const handleVote = async (type: 1 | -1) => {
        if (!user) { router.push('/login'); return; }
        if (voteLock.current) return;
        voteLock.current = true;
        setIsVoting(true);

        try {
            if (userVote) {
                if (userVote.voteType === type) {
                    await databases.deleteDocument(appwriteDatabaseId, collection, userVote.$id);
                    setUserVote(null);
                    type === 1 ? setUpvotes(p => p - 1) : setDownvotes(p => p - 1);
                } else {
                    const updated = await databases.updateDocument(appwriteDatabaseId, collection, userVote.$id, { voteType: type });
                    setUserVote(updated);
                    if (type === 1) { setUpvotes(p => p + 1); setDownvotes(p => p - 1); }
                    else { setDownvotes(p => p + 1); setUpvotes(p => p - 1); }
                }
            } else {
                const newVote = await databases.createDocument(appwriteDatabaseId, collection, ID.unique(), {
                    commentId,
                    userId: user.$id,
                    voteType: type,
                });
                setUserVote(newVote);
                type === 1 ? setUpvotes(p => p + 1) : setDownvotes(p => p + 1);
            }
        } catch (e) {
            console.error('Comment vote error:', e);
        } finally {
            voteLock.current = false;
            setIsVoting(false);
        }
    };

    return (
        <div className="flex items-center gap-0.5">
            <button
                onClick={() => handleVote(1)}
                disabled={isVoting}
                className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold transition-colors disabled:opacity-50 ${
                    userVote?.voteType === 1
                        ? 'text-emerald-600 bg-emerald-50'
                        : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                }`}
            >
                <FiThumbsUp className="w-3.5 h-3.5" />
                {upvotes > 0 && <span>{upvotes}</span>}
            </button>
            <button
                onClick={() => handleVote(-1)}
                disabled={isVoting}
                className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold transition-colors disabled:opacity-50 ${
                    userVote?.voteType === -1
                        ? 'text-red-500 bg-red-50'
                        : 'text-slate-400 hover:text-red-500 hover:bg-red-50'
                }`}
            >
                <FiThumbsDown className="w-3.5 h-3.5" />
                {downvotes > 0 && <span>{downvotes}</span>}
            </button>
        </div>
    );
}
