'use client';

import { useState, useEffect } from 'react';
import CommentItem from '@/components/comments/CommentItem';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import { sanityClient } from '@/lib/sanity';

interface RecentCommentsProps {
    comments: any[];
    isOwnProfile: boolean;
    currentUserId?: string;
    currentUserIsVerified: boolean;
    currentUserFollows?: string[]; 
}

export default function RecentComments({
    comments,
    isOwnProfile,
    currentUserId,
    currentUserIsVerified,
    currentUserFollows = [] 
}: RecentCommentsProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [enrichedComments, setEnrichedComments] = useState<any[]>([]);
    const router = useRouter();

    useEffect(() => {
        if (!comments || comments.length === 0) {
            setEnrichedComments([]);
            return;
        }

        const fetchSlugs = async () => {
            const postIds = [...new Set(comments.map(c => c.sanityPostId).filter(Boolean))];

            if (postIds.length === 0) {
                setEnrichedComments(comments);
                return;
            }

            try {
                const allIdsToSearch = [...postIds, ...postIds.map(id => `drafts.${id}`)];
                const sanityQuery = `*[_id in $allIds] { 
                    _id, 
                    _type,
                    "slug": slug.current 
                }`;

                const sanityPosts = await sanityClient.fetch(sanityQuery, { allIds: allIdsToSearch });

                const getBasePath = (type: string) => {
                    switch (type) {
                        case 'community': return '/community';
                        case 'article': return '/articles';
                        case 'data': return '/data';
                        case 'tools-technical': return '/tools-technical';
                        default: return `/${type}`; 
                    }
                };

                const urlMap: Record<string, string> = {};
                sanityPosts.forEach((post: any) => {
                    const cleanId = post._id.replace('drafts.', '');
                    const basePath = getBasePath(post._type);
                    urlMap[cleanId] = `${basePath}/${post.slug}`;
                });

                const updatedComments = comments.map(c => ({
                    ...c,
                    postUrl: urlMap[c.sanityPostId] || `/community/${c.sanityPostId}`
                }));

                setEnrichedComments(updatedComments);
            } catch (error) {
                console.error("Failed to fetch slugs from Sanity:", error);
                setEnrichedComments(comments);
            }
        };

        fetchSlugs();
    }, [comments]);

    if (!comments) return null;

    const displayedComments = isExpanded ? enrichedComments : enrichedComments.slice(0, 3);
    const hasMoreComments = enrichedComments.length > 3;

    return (
        <div className="space-y-6">
            <div className='bg-white rounded-3xl px-6 py-8 flex flex-col gap-8'>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                    {isOwnProfile ? "Your Recent Comments" : "Recent Comments"}
                </h2>

                {enrichedComments.length === 0 ? (
                    <div className="p-12 rounded-3xl text-center border border-slate-100 shadow-sm">
                        <p className="text-slate-400 font-medium">No discussions joined yet.</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-6">
                        <div className="grid gap-4">
                            {displayedComments.map(comment => (
                                <div
                                    key={comment.$id}
                                    onClick={() => {
                                        console.log("Navigating to:", comment.postUrl);
                                        router.push(comment.postUrl);
                                    }}
                                    className="block group transition-all cursor-pointer"
                                >
                                    <div className="rounded-2xl border border-transparent group-hover:border-emerald-100 group-hover:shadow-sm transition-all bg-white">
                                        <CommentItem
                                            comment={comment}
                                            currentUserId={currentUserId}
                                            currentUserIsVerified={currentUserIsVerified}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {hasMoreComments && (
                            <button
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="mx-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold transition-colors border border-slate-200 text-sm"
                            >
                                {isExpanded ? (
                                    <>
                                        View Less <FiChevronUp className="w-4 h-4" />
                                    </>
                                ) : (
                                    <>
                                        View All ({enrichedComments.length}) <FiChevronDown className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}