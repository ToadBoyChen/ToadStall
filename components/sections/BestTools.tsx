import Link from 'next/link';
import { client } from '@/sanity/lib/client';
import { FiArrowRight } from 'react-icons/fi';
import { TbTools, TbZoomQuestion } from 'react-icons/tb';

const RECENT_POSTS_QUERY = `
  *[ _type == "tools-technical" && defined(slug.current) ] | order(_createdAt desc) [0...6] {
    _id,
    title,
    "slug": slug.current,
    _createdAt,
    pricing,
    contentType,
    "excerpt": coalesce(excerpt, array::join(string::split((pt::text(body)), "")[0..100], "") + "…"),
    "categories": categories[]->{ _id, title, icon }
  }
`;

function TypeBadge({ contentType }: { contentType?: string }) {
    const isBreakdown = contentType === 'breakdown';
    return (
        <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
            isBreakdown
                ? 'bg-indigo-50 text-indigo-500'
                : 'bg-emerald-50 text-emerald-600'
        }`}>
            {isBreakdown
                ? <TbZoomQuestion className="w-3 h-3" />
                : <TbTools className="w-3 h-3" />
            }
            {isBreakdown ? 'Breakdown' : 'Tool'}
        </span>
    );
}

export default async function BestTools() {
    const posts = await client.fetch(RECENT_POSTS_QUERY);

    if (posts.length === 0) return null;

    return (
        <section className="w-full">
            <div className="flex items-end justify-between mb-8 sm:mb-10">
                <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight">
                    Tools & Breakdowns
                </h2>
                <Link
                    href="/tools-technical"
                    className="hidden sm:flex items-center gap-1.5 text-sm font-bold text-white/50 hover:text-white transition-colors shrink-0 mb-2"
                >
                    View all <FiArrowRight className="w-4 h-4" />
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {posts.map((post: any, i: number) => {
                    const isBreakdown = post.contentType === 'breakdown';
                    return (
                        <Link
                            key={post._id}
                            href={`/tools-technical/${post.slug}`}
                            className="group flex items-center gap-4 p-4 sm:p-5 bg-white/80 hover:bg-white rounded-2xl transition-all duration-200 border border-transparent hover:border-emerald-100"
                        >
                            {/* Index */}
                            <span className="text-xs font-black text-slate-300 group-hover:text-emerald-300 transition-colors w-5 shrink-0 tabular-nums">
                                {String(i + 1).padStart(2, '0')}
                            </span>

                            {/* Type icon */}
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                                isBreakdown
                                    ? 'bg-indigo-50 group-hover:bg-indigo-100 text-indigo-500'
                                    : 'bg-emerald-50 group-hover:bg-emerald-100 text-emerald-600'
                            }`}>
                                {isBreakdown
                                    ? <TbZoomQuestion className="w-4.5 h-4.5" />
                                    : <TbTools className="w-4.5 h-4.5" />
                                }
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-black text-slate-900 group-hover:text-emerald-600 transition-colors tracking-tight leading-snug truncate">
                                    {post.title}
                                </h3>
                                {post.excerpt && (
                                    <p className="text-xs text-slate-500 mt-0.5 leading-snug line-clamp-1">
                                        {post.excerpt}
                                    </p>
                                )}
                            </div>

                            {/* Badges + arrow */}
                            <div className="flex items-center gap-2 shrink-0">
                                <TypeBadge contentType={post.contentType} />
                                {post.pricing && (
                                    <span className="hidden sm:block text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                                        {post.pricing}
                                    </span>
                                )}
                                <FiArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all" />
                            </div>
                        </Link>
                    );
                })}
            </div>
        </section>
    );
}
