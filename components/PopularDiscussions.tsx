import Link from 'next/link';
import { client } from '@/sanity/lib/client';
import { FiMessageSquare, FiThumbsUp, FiThumbsDown } from 'react-icons/fi';

const RECENT_POSTS_QUERY = `
  *[ _type == "community" && defined(slug.current) ] | order(publishedAt desc) [0...6] {
    _id,
    title,
    "slug": slug.current,
    publishedAt,
    "excerpt": array::join(string::split((pt::text(body)), "")[0..100], "") + "...",
    "commentCount": count(comments),
    "upvotes": coalesce(upvotes, 0),
    "downvotes": coalesce(downvotes, 0)
  }
`;

export default async function RecentArticles() {
    const posts = await client.fetch(RECENT_POSTS_QUERY);

    if (posts.length === 0) {
        return null;
    }

    return (
        <section className="w-full">
            <div className="flex flex-col md:flex-row justify-center items-baseline mb-4 pb-4">
                <h2 className="text-6xl font-black text-white tracking-tight mb-2">
                    Popular Discussions
                </h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {posts.map((post: any) => (
                    <div
                        key={post._id}
                        className="group flex flex-col justify-between p-6 bg-white/80 rounded-2xl hover:bg-white hover:border-emerald-500/30 transition-all duration-300 border border-transparent"
                    >
                        {/* Make the top section the clickable link to the article */}
                        <Link href={`/articles/${post.slug}`} className="block mb-4">
                            <div className="mb-4">
                                <span className="transition-all duration-200 text-xs font-bold tracking-widest uppercase text-emerald-400 bg-emerald-100 group-hover:bg-emerald-800 group-hover:text-emerald-100 px-2 py-1 rounded-md">
                                    {new Date(post.publishedAt || Date.now()).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric'
                                    })}
                                </span>
                            </div>
                            <h3 className="text-2xl font-bold mb-3 group-hover:text-emerald-400 transition-colors duration-300 tracking-tight">
                                {post.title}
                            </h3>
                            <p className="text-slate-700 leading-relaxed font-medium">
                                {post.excerpt}
                            </p>
                        </Link>

                        {/* Social Interaction Bar */}
                        <div className="flex items-center justify-between pt-4 border-t border-slate-200/60 mt-auto">
                            <div className="flex items-center space-x-4">
                                {/* Voting Mechanisms */}
                                <div className="flex items-center space-x-1 bg-slate-100 rounded-full px-3 py-1">
                                    <button className="text-slate-500 hover:text-emerald-500 transition-colors p-1">
                                        <FiThumbsUp className="w-4 h-4" />
                                    </button>
                                    <span className="text-sm font-bold text-slate-700 px-1">
                                        {post.upvotes - post.downvotes}
                                    </span>
                                    <button className="text-slate-500 hover:text-red-500 transition-colors p-1">
                                        <FiThumbsDown className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Comment Button */}
                                <Link 
                                    href={`/articles/${post.slug}#comments`}
                                    className="flex items-center space-x-2 text-slate-500 hover:text-emerald-500 transition-colors"
                                >
                                    <FiMessageSquare className="w-4 h-4" />
                                    <span className="text-sm font-semibold">{post.commentCount || 0}</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}