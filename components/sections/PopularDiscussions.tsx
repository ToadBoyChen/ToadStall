import Link from 'next/link';
import { client } from '@/sanity/lib/client';
import { databases, appwriteDatabaseId } from '@/lib/appwrite';
import { Query } from 'appwrite';
import { FiArrowRight, FiUser } from 'react-icons/fi';
import GradientText from '@/components/animations/GradientText';
import FadeIn from '@/components/animations/CustomDiv';

export default async function PopularDiscussions() {
    let topIds: string[] = [];
    const scoreMap: Record<string, number> = {};

    try {
        const votesCollection = process.env.NEXT_PUBLIC_APPWRITE_VOTES_COLLECTION_ID as string;
        const votesRes = await databases.listDocuments(
            appwriteDatabaseId,
            votesCollection,
            [Query.limit(5000)]
        );

        votesRes.documents.forEach((vote: any) => {
            const postId = vote.sanityPostId;
            if (!scoreMap[postId]) scoreMap[postId] = 0;
            if (vote.voteType === 1) scoreMap[postId] += 1;
            if (vote.voteType === -1) scoreMap[postId] -= 1;
        });

        topIds = Object.entries(scoreMap)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 50)
            .map(([id]) => id);
    } catch (error) {
        console.error('Failed to fetch votes:', error);
    }

    const hasPopularPosts = topIds.length > 0;
    const queryFilter = hasPopularPosts
        ? `_type == "community" && defined(slug.current) && _id in $topIds`
        : `_type == "community" && defined(slug.current)`;

    const POSTS_QUERY = `
        *[ ${queryFilter} ] {
            _id,
            title,
            "slug": slug.current,
            status,
            "authorName": coalesce(authorName, author->name),
            publishedAt,
            "categories": categories[]->{ _id, title, icon }
        }
    `;

    const params = hasPopularPosts ? { topIds } : {};
    let posts = await client.fetch(POSTS_QUERY, params);

    if (hasPopularPosts) {
        posts = posts
            .sort((a: any, b: any) => (scoreMap[b._id] || 0) - (scoreMap[a._id] || 0))
            .slice(0, 5);
    } else {
        posts = posts
            .sort((a: any, b: any) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
            .slice(0, 5);
    }

    if (posts.length === 0) return null;

    return (
        <section className="w-full">
            <div className="flex items-end justify-between mb-8 sm:mb-10">
                <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight">
                    {hasPopularPosts ? (
                        <><GradientText>Top</GradientText> Discussions</>
                    ) : (
                        <>Recent <GradientText>Discussions</GradientText></>
                    )}
                </h2>
                <Link
                    href="/community"
                    className="hidden sm:flex items-center gap-1.5 text-sm font-bold text-white/50 hover:text-white transition-colors shrink-0 mb-2"
                >
                    View all <FiArrowRight className="w-4 h-4" />
                </Link>
            </div>

            <FadeIn>
            <div className="flex flex-col gap-3">
                {posts.map((post: any, i: number) => {
                    const score = scoreMap[post._id];
                    return (
                        <Link
                            key={post._id}
                            href={`/community/${post.slug}`}
                            className="group flex items-center gap-5 sm:gap-8 p-5 bg-white/80 hover:bg-white rounded-2xl transition-all duration-200 border border-transparent hover:border-emerald-100"
                        >
                            {/* Rank number */}
                            <span className="text-3xl sm:text-4xl font-black text-slate-200 group-hover:text-emerald-200 transition-colors w-10 sm:w-14 shrink-0 leading-none tabular-nums">
                                {String(i + 1).padStart(2, '0')}
                            </span>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <h3 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-emerald-600 transition-colors tracking-tight leading-snug line-clamp-2">
                                    {post.title}
                                </h3>
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
                                    <span className="flex items-center gap-1 text-xs font-semibold text-slate-400">
                                        <FiUser className="w-3 h-3" />
                                        {post.authorName || 'ToadStall'}
                                    </span>
                                    {post.publishedAt && (
                                        <span className="text-xs text-slate-400">
                                            {new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </span>
                                    )}
                                    {post.categories?.filter((c: any) => c.icon).map((cat: any) => (
                                        <span key={cat._id} title={cat.title} className="text-sm leading-none">
                                            {cat.icon}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Score + arrow */}
                            <div className="flex items-center gap-3 shrink-0">
                                {hasPopularPosts && score !== undefined && (
                                    <span className={`text-xs font-black px-2.5 py-1 rounded-full ${
                                        score > 0 ? 'bg-emerald-50 text-emerald-600' : score < 0 ? 'bg-red-50 text-red-500' : 'bg-slate-100 text-slate-400'
                                    }`}>
                                        {score > 0 ? '+' : ''}{score}
                                    </span>
                                )}
                                {post.status === 'open' && (
                                    <span className="hidden sm:block text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md bg-emerald-50 text-emerald-600">
                                        Open
                                    </span>
                                )}
                                <FiArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                            </div>
                        </Link>
                    );
                })}
            </div>
            </FadeIn>
        </section>
    );
}
