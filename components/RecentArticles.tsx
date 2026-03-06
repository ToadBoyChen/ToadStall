import Link from 'next/link';
import { client } from '@/sanity/lib/client';

// 1. The GROQ Query
// We filter for "post", order by newest first, and slice [0...4] to get exactly 4 items.
const RECENT_POSTS_QUERY = `
  *[ _type == "post" && defined(slug.current) ] | order(publishedAt desc) [0...4] {
    _id,
    title,
    "slug": slug.current,
    publishedAt,
    "excerpt": array::join(string::split((pt::text(body)), "")[0..100], "") + "..."
  }
`;

export default async function RecentArticles() {
    // 2. Fetch the data directly on the server
    const posts = await client.fetch(RECENT_POSTS_QUERY);

    if (posts.length === 0) {
        return null; // Don't render the section if there are no articles yet
    }

    return (
        <section className="w-full max-w-6xl mx-auto px-6 py-12">
            
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-baseline mb-10 border-b border-slate-800 pb-4">
                <h2 className="text-3xl font-black text-white tracking-tight">
                    Latest Analysis
                </h2>
                <Link 
                    href="/articles" 
                    className="text-emerald-400 hover:text-emerald-300 text-sm font-bold tracking-widest uppercase mt-4 md:mt-0 transition-colors flex items-center gap-1 group"
                >
                    View All Reports 
                    <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
                </Link>
            </div>

            {/* The Grid (2x2 on Desktop) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {posts.map((post: any) => (
                    <Link 
                        key={post._id} 
                        href={`/articles/${post.slug}`}
                        className="group flex flex-col justify-between p-6 bg-slate-900/40 backdrop-blur-sm border border-slate-800/80 rounded-2xl hover:bg-slate-800/60 hover:border-emerald-500/30 transition-all duration-300"
                    >
                        <div>
                            {/* Date Pill */}
                            <div className="mb-4">
                                <span className="text-[10px] font-bold tracking-widest uppercase text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-md">
                                    {new Date(post.publishedAt || Date.now()).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric'
                                    })}
                                </span>
                            </div>

                            {/* Title & Excerpt */}
                            <h3 className="text-xl font-bold text-slate-100 mb-2 group-hover:text-white transition-colors line-clamp-2 leading-tight">
                                {post.title}
                            </h3>
                            <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed">
                                {post.excerpt}
                            </p>
                        </div>
                    </Link>
                ))}
            </div>
            
        </section>
    );
}