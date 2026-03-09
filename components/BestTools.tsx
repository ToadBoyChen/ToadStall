import Link from 'next/link';
import { client } from '@/sanity/lib/client';
import { FiArrowRight } from 'react-icons/fi'

const RECENT_POSTS_QUERY = `
  *[ _type == "tools-technical" && defined(slug.current) ] | order(publishedAt desc) [0...6] {
    _id,
    title,
    "slug": slug.current,
    publishedAt,
    "excerpt": array::join(string::split((pt::text(body)), "")[0..100], "") + "..."
  }
`;

export default async function BestTools() {
    const posts = await client.fetch(RECENT_POSTS_QUERY);

    if (posts.length === 0) {
        return null;
    }

    return (
        <section className="w-full">
            <div className="flex flex-col md:flex-row justify-between items-baseline mb-4 pb-4">
                <h2 className="text-6xl font-black text-white tracking-tight mb-2">
                    Tools & Breakdowns
                </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post: any) => (
                    <Link
                        key={post._id}
                        href={`/articles/${post.slug}`}
                        className="group flex flex-col justify-between p-6 bg-white/80 rounded-2xl hover:bg-white hover:border-emerald-500/30 transition-all duration-300"
                    >
                        <div>
                            <div className="group mb-4">
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
                        </div>
                    </Link>
                ))}
            </div>

        </section>
    );
}