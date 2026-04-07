'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { databases, appwriteDatabaseId } from '@/lib/appwrite';
import { Query, ID } from 'appwrite';
import { useRouter } from 'next/navigation';

interface PollOption {
    _key: string;
    text: string;
}

interface PollValue {
    _key: string;
    question: string;
    options: PollOption[];
    endsAt?: string;
    allowChangeVote?: boolean;
}

const COLLECTION = process.env.NEXT_PUBLIC_APPWRITE_POLL_VOTES_COLLECTION_ID as string;

export default function PollBlock({ value }: { value: PollValue }) {
    const { user } = useAuth();
    const router = useRouter();

    const [voteCounts, setVoteCounts] = useState<number[]>(() =>
        new Array(value.options.length).fill(0)
    );
    const [userVote, setUserVote] = useState<{ $id: string; optionIndex: number } | null>(null);
    const [totalVotes, setTotalVotes] = useState(0);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const submitLock = useRef(false);

    const pollId = value._key;

    const hasEnded = value.endsAt ? new Date(value.endsAt) < new Date() : false;
    const showResults = userVote !== null || hasEnded;

    const fetchVotes = useCallback(async () => {
        try {
            const res = await databases.listDocuments(appwriteDatabaseId, COLLECTION, [
                Query.equal('pollId', pollId),
                Query.limit(5000),
            ]);

            const counts = new Array(value.options.length).fill(0);
            let mine: { $id: string; optionIndex: number } | null = null;

            for (const doc of res.documents) {
                const idx = doc.optionIndex as number;
                if (idx >= 0 && idx < counts.length) counts[idx]++;
                if (user && doc.userId === user.$id) {
                    mine = { $id: doc.$id, optionIndex: idx };
                }
            }

            setVoteCounts(counts);
            setTotalVotes(res.total);
            setUserVote(mine);
            if (mine !== null) setSelectedIndex(mine.optionIndex);
        } catch (e) {
            console.error('Poll fetch error:', e);
        } finally {
            setLoading(false);
        }
    }, [pollId, user, value.options.length]);

    useEffect(() => { fetchVotes(); }, [fetchVotes]);

    const handleVote = async () => {
        if (!user) { router.push('/login'); return; }
        if (selectedIndex === null || submitting || submitLock.current) return;
        if (hasEnded) return;

        // If already voted with same option, do nothing
        if (userVote?.optionIndex === selectedIndex) return;

        submitLock.current = true;
        setSubmitting(true);

        try {
            if (userVote && value.allowChangeVote !== false) {
                // Remove old vote
                await databases.deleteDocument(appwriteDatabaseId, COLLECTION, userVote.$id);
                const newDoc = await databases.createDocument(
                    appwriteDatabaseId, COLLECTION, ID.unique(),
                    { pollId, userId: user.$id, optionIndex: selectedIndex }
                );

                setVoteCounts(prev => {
                    const next = [...prev];
                    next[userVote.optionIndex]--;
                    next[selectedIndex]++;
                    return next;
                });
                setUserVote({ $id: newDoc.$id, optionIndex: selectedIndex });
            } else if (!userVote) {
                const newDoc = await databases.createDocument(
                    appwriteDatabaseId, COLLECTION, ID.unique(),
                    { pollId, userId: user.$id, optionIndex: selectedIndex }
                );

                setVoteCounts(prev => {
                    const next = [...prev];
                    next[selectedIndex]++;
                    return next;
                });
                setTotalVotes(t => t + 1);
                setUserVote({ $id: newDoc.$id, optionIndex: selectedIndex });
            }
        } catch (e) {
            console.error('Poll vote error:', e);
        } finally {
            submitLock.current = false;
            setSubmitting(false);
        }
    };

    const handleRetract = async () => {
        if (!userVote || submitting || submitLock.current || hasEnded) return;
        if (value.allowChangeVote === false) return;

        submitLock.current = true;
        setSubmitting(true);

        try {
            await databases.deleteDocument(appwriteDatabaseId, COLLECTION, userVote.$id);
            setVoteCounts(prev => {
                const next = [...prev];
                next[userVote.optionIndex]--;
                return next;
            });
            setTotalVotes(t => t - 1);
            setUserVote(null);
            setSelectedIndex(null);
        } catch (e) {
            console.error('Poll retract error:', e);
        } finally {
            submitLock.current = false;
            setSubmitting(false);
        }
    };

    return (
        <div className="my-8 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-5 pt-5 pb-4 border-b border-slate-100">
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center mt-0.5">
                        <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-1">Poll</p>
                        <p className="text-base font-semibold text-slate-800 leading-snug">{value.question}</p>
                    </div>
                </div>

                {hasEnded && (
                    <p className="mt-2 text-xs text-slate-400 font-medium">This poll has ended.</p>
                )}
                {value.endsAt && !hasEnded && (
                    <p className="mt-2 text-xs text-slate-400">
                        Closes {new Date(value.endsAt).toLocaleDateString('en-GB', {
                            day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                    </p>
                )}
            </div>

            {/* Options */}
            <div className="px-5 py-4 flex flex-col gap-2.5">
                {loading ? (
                    <div className="flex flex-col gap-2.5">
                        {value.options.map((_, i) => (
                            <div key={i} className="h-10 rounded-xl bg-slate-100 animate-pulse" />
                        ))}
                    </div>
                ) : showResults ? (
                    // Results view
                    value.options.map((opt, i) => {
                        const count = voteCounts[i] ?? 0;
                        const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
                        const isChosen = userVote?.optionIndex === i;

                        return (
                            <div key={opt._key ?? i} className="relative">
                                <div className={`relative rounded-xl overflow-hidden border transition-colors ${
                                    isChosen ? 'border-emerald-400' : 'border-slate-200'
                                }`}>
                                    {/* Background bar */}
                                    <div
                                        className={`absolute inset-y-0 left-0 transition-all duration-700 ease-out ${
                                            isChosen ? 'bg-emerald-100' : 'bg-slate-100'
                                        }`}
                                        style={{ width: `${pct}%` }}
                                    />
                                    <div className="relative flex items-center justify-between px-4 py-2.5">
                                        <div className="flex items-center gap-2 min-w-0">
                                            {isChosen && (
                                                <svg className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                            <span className={`text-sm font-medium truncate ${isChosen ? 'text-emerald-700' : 'text-slate-700'}`}>
                                                {opt.text}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                                            <span className={`text-xs font-semibold ${isChosen ? 'text-emerald-600' : 'text-slate-500'}`}>
                                                {pct}%
                                            </span>
                                            <span className="text-xs text-slate-400">{count}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    // Voting view
                    value.options.map((opt, i) => (
                        <button
                            key={opt._key ?? i}
                            onClick={() => setSelectedIndex(i)}
                            disabled={submitting}
                            className={`w-full text-left px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                                selectedIndex === i
                                    ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                            }`}
                        >
                            <div className="flex items-center gap-2.5">
                                <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                                    selectedIndex === i ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300'
                                }`}>
                                    {selectedIndex === i && (
                                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                    )}
                                </div>
                                <span>{opt.text}</span>
                            </div>
                        </button>
                    ))
                )}
            </div>

            {/* Footer */}
            <div className="px-5 pb-5 flex items-center justify-between gap-4">
                <span className="text-xs text-slate-400 font-medium">
                    {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}
                </span>

                <div className="flex items-center gap-3">
                    {!showResults && !hasEnded && (
                        <button
                            onClick={handleVote}
                            disabled={selectedIndex === null || submitting}
                            className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            {submitting ? 'Voting…' : 'Vote'}
                        </button>
                    )}

                    {showResults && !hasEnded && userVote && value.allowChangeVote !== false && (
                        <button
                            onClick={handleRetract}
                            disabled={submitting}
                            className="text-xs text-slate-400 hover:text-slate-600 underline underline-offset-2 transition-colors disabled:opacity-40"
                        >
                            {submitting ? '…' : 'Retract vote'}
                        </button>
                    )}

                    {!user && !hasEnded && (
                        <button
                            onClick={() => router.push('/login')}
                            className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors"
                        >
                            Sign in to vote
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
