'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { databases, appwriteDatabaseId } from '@/lib/appwrite';
import { Query, ID } from 'appwrite';
import { FiThumbsUp, FiThumbsDown, FiMessageSquare } from 'react-icons/fi';
import { useRouter } from 'next/navigation';

export default function EngagementBar({ postId }: { postId: string }) {
    const { user } = useAuth();
    const router = useRouter();

    const [comments, setComments] = useState<any[]>([]);
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [upvotes, setUpvotes] = useState(0);
    const [downvotes, setDownvotes] = useState(0);
    const [userVote, setUserVote] = useState<any>(null); 
    const [isVoting, setIsVoting] = useState(false);
    const submitLock = useRef(false);
    const voteLock = useRef(false);

    const fetchEngagements = useCallback(async () => {
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
            console.error('Failed to load engagements', error);
        }
    }, [postId, user]);

    useEffect(() => {
        fetchEngagements();
    }, [fetchEngagements]);

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

    const submitComment = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!user) {
            router.push('/login');
            return;
        }
        
        if (!newComment.trim() || submitLock.current) return;
        
        submitLock.current = true;
        setIsSubmitting(true);

        console.log(user)

        try {
            const newDoc = await databases.createDocument(
                appwriteDatabaseId,
                process.env.NEXT_PUBLIC_APPWRITE_COMMENTS_COLLECTION_ID as string,
                ID.unique(),
                {
                    sanityPostId: postId,
                    userId: user.$id,
                    body: newComment,
                    authorName: user.name,
                }
            );

            setComments(prev => [newDoc, ...prev]);
            setNewComment('');
        } catch (error) {
            console.error('Commenting error blocked:', error);
        } finally {
            submitLock.current = false;
            setIsSubmitting(false);
        }
    };

    return (
        <div className="mt-12 border-t border-slate-200 pt-8">
            <div className="flex items-center gap-4 mb-10">
                <div className="flex items-center bg-slate-100 rounded-full p-1">
                    <button
                        onClick={() => handleVote(1)}
                        disabled={isVoting}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${userVote?.voteType === 1 ? 'bg-emerald-500 text-white' : 'text-slate-600 hover:bg-slate-200'} disabled:opacity-70`}
                    >
                        <FiThumbsUp className="w-5 h-5" />
                        <span className="font-bold">{upvotes}</span>
                    </button>
                    <div className="w-px h-6 bg-slate-300 mx-1"></div>
                    <button
                        onClick={() => handleVote(-1)}
                        disabled={isVoting}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${userVote?.voteType === -1 ? 'bg-red-500 text-white' : 'text-slate-600 hover:bg-slate-200'} disabled:opacity-70`}
                    >
                        <FiThumbsDown className="w-5 h-5" />
                        <span className="font-bold">{downvotes}</span>
                    </button>
                </div>

                <div className="flex items-center gap-2 text-slate-500 font-bold px-4 py-2 bg-slate-100 rounded-full">
                    <FiMessageSquare className="w-5 h-5" />
                    <span>{comments.length} Comments</span>
                </div>
            </div>

            <div className="mb-10">
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
                {comments.length === 0 ? (
                    <p className="text-slate-500 italic text-center py-8 bg-slate-50 rounded-2xl">Be the first to share your thoughts.</p>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.$id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-emerald-100 text-emerald-700 font-bold rounded-full flex items-center justify-center">
                                    {comment.authorName ? comment.authorName.charAt(0).toUpperCase() : '?'}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-800">
                                        {comment.authorName || 'Anonymous Toad'}
                                    </p>
                                    <p className="text-xs text-slate-400 font-medium">
                                        {new Date(comment.$createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </p>
                                </div>
                            </div>
                            <p className="text-slate-700 leading-relaxed font-medium">
                                {comment.body}
                            </p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}