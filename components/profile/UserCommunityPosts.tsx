'use client';

import { useEffect, useState } from 'react';
import { databases, appwriteDatabaseId } from '@/lib/appwrite';
import { Query } from 'appwrite';
import Link from 'next/link';
import { FiMessageCircle, FiClock, FiChevronDown, FiChevronUp } from 'react-icons/fi';

import { sanityClient } from '@/lib/sanity';

interface UserCommunityPostsProps {
    targetUserId: string;
    isOwnProfile: boolean;
}

export default function UserCommunityPosts({ targetUserId, isOwnProfile }: UserCommunityPostsProps) {
    const [posts, setPosts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        if (!targetUserId) return;

        const fetchPostsAndCounts = async () => {
            try {
                const query = `*[_type == "community" && authorAppwriteId == $userId] | order(publishedAt desc)[0...10]{
                    _id,
                    title,
                    "slug": slug.current,
                    publishedAt,
                    "content": body[0].children[0].text
                }`;

                const sanityPosts = await sanityClient.fetch(query, { userId: targetUserId });

                const postsWithCounts = await Promise.all(
                    sanityPosts.map(async (post: any) => {
                        try {
                            const commentsRes = await databases.listDocuments(
                                appwriteDatabaseId,
                                process.env.NEXT_PUBLIC_APPWRITE_COMMENTS_COLLECTION_ID as string,
                                [
                                    Query.equal('sanityPostId', post._id),
                                    Query.limit(1)
                                ]
                            );
                            return { ...post, commentCount: commentsRes.total };
                        } catch (err) {
                            console.error(`Failed to get count for post ${post._id}`, err);
                            return { ...post, commentCount: 0 };
                        }
                    })
                );

                setPosts(postsWithCounts);
            } catch (error) {
                console.error('Error fetching user posts from Sanity:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPostsAndCounts();
    }, [targetUserId]);

    if (isLoading) {
        return <div className="animate-pulse h-32 bg-slate-50 rounded-3xl mt-8"></div>;
    }

    // 3. Determine which posts to show based on the toggle state
    const displayedPosts = isExpanded ? posts : posts.slice(0, 3);
    const hasMorePosts = posts.length > 3;

    return (
        <div className="space-y-6">
            <div className='bg-white rounded-3xl px-6 py-8 flex flex-col gap-8'>
                <h2 className="text-3xl font-black tracking-tight">
                    {isOwnProfile ? "Your Community Posts" : "Community Posts"}
                </h2>

                {posts.length === 0 ? (
                    <div className="p-12 rounded-3xl text-center border border-slate-100 shadow-sm">
                        <p className="text-slate-400 font-medium">No posts created yet.</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-6">
                        <div className="grid gap-4">
                            {displayedPosts.map(post => (
                                <Link
                                    key={post._id}
                                    href={`/community/${post.slug}`}
                                    className="block bg-white border border-slate-100 p-6 rounded-2xl shadow-sm hover:shadow-md hover:border-emerald-100 transition-all group"
                                >
                                    <h3 className="text-lg font-bold group-hover:text-emerald-700 transition-colors mb-2">
                                        {post.title}
                                    </h3>
                                    <p className="text-slate-500 text-sm line-clamp-2 mb-4">
                                        {post.content}
                                    </p>
                                    <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
                                        <span className="flex items-center gap-1.5">
                                            <FiClock className="w-3.5 h-3.5" />
                                            {new Date(post.publishedAt).toLocaleDateString()}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <FiMessageCircle className="w-3.5 h-3.5" />
                                            {post.commentCount} Replies
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {/* 4. Render the "View More" toggle if there are > 3 posts */}
                        {hasMorePosts && (
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
                                        View All ({posts.length}) <FiChevronDown className="w-4 h-4" />
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