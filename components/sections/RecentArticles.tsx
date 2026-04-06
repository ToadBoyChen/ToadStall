import Link from 'next/link';
import { client } from '@/sanity/lib/client';
import { FiArrowRight, FiUser } from 'react-icons/fi';
import ContentCard from '@/components/general/ContentCard';

const RECENT_POSTS_QUERY = `
  *[ _type == "article" && defined(slug.current) ] | order(publishedAt desc) [0...6] {
    _id,
    title,
    "slug": slug.current,
    publishedAt,
    "authorName": author->name,
    "excerpt": coalesce(
      array::join(string::split((pt::text(body)), "")[0..280], "") + "…",
      ""
    ),
    "categories": categories[]->{ _id, title, icon }
  }
`;

export default async function RecentArticles() {
    const posts = await client.fetch(RECENT_POSTS_QUERY);

    if (posts.length === 0) return null;

    const [featured, ...rest] = posts;

    return (
        <section className="w-full">
            <div className="flex items-end justify-between mb-8 sm:mb-10">
                <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight">
                    Recent Articles
                </h2>
                <Link
                    href="/articles"
                    className="hidden sm:flex items-center gap-1.5 text-sm font-bold text-white/50 hover:text-white transition-colors shrink-0 mb-2"
                >
                    View all <FiArrowRight className="w-4 h-4" />
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
                {/* Featured article — left, spans 3 cols */}
                <Link
                    href={`/articles/${featured.slug}`}
                    className="group lg:col-span-3 relative flex flex-col justify-end min-h-72 sm:min-h-80 p-7 bg-white/80 hover:bg-white rounded-3xl transition-all duration-300 border border-transparent hover:border-emerald-100 overflow-hidden"
                >
                    {/* Decorative accent */}
                    <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-400/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-400/20 transition-colors" />
                    <div className="absolute top-6 left-6">
                        <span className="text-xs font-black uppercase tracking-widest text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full">
                            Featured
                        </span>
                    </div>

                    <div className="relative z-10">
                        {featured.categories?.length > 0 && (
                            <div className="flex gap-1.5 mb-3">
                                {featured.categories.filter((c: any) => c.icon).map((cat: any) => (
                                    <span key={cat._id} title={cat.title} className="text-xl leading-none">{cat.icon}</span>
                                ))}
                            </div>
                        )}
                        <h3 className="text-2xl sm:text-3xl font-black text-slate-900 group-hover:text-emerald-600 transition-colors tracking-tight leading-tight mb-3">
                            {featured.title}
                        </h3>
                        {featured.excerpt && (
                            <p className="text-sm text-slate-600 leading-relaxed line-clamp-3 mb-4">
                                {featured.excerpt}
                            </p>
                        )}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold">
                                <FiUser className="w-3 h-3" />
                                <span>{featured.authorName || 'ToadStall'}</span>
                                {featured.publishedAt && (
                                    <>
                                        <span>·</span>
                                        <span>{new Date(featured.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                    </>
                                )}
                            </div>
                            <FiArrowRight className="w-5 h-5 text-emerald-400 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>
                </Link>

                {/* Right column — 2 stacked smaller cards */}
                <div className="lg:col-span-2 flex flex-col gap-4 sm:gap-6">
                    {rest.slice(0, 2).map((post: any) => (
                        <div key={post._id} className="flex-1">
                            <ContentCard
                                id={post._id}
                                title={post.title}
                                href={`/articles/${post.slug}`}
                                publishedAt={post.publishedAt}
                                text={post.excerpt}
                                authorName={post.authorName}
                                readOnlyEngagement={true}
                                categories={post.categories}
                                categoryEmojiOnly={true}
                            />
                        </div>
                    ))}
                </div>

                {/* Bottom row — remaining articles */}
                {rest.slice(2).map((post: any) => (
                    <div key={post._id} className="lg:col-span-1" style={{ gridColumn: 'span 1' }}>
                        <ContentCard
                            id={post._id}
                            title={post.title}
                            href={`/articles/${post.slug}`}
                            publishedAt={post.publishedAt}
                            text={post.excerpt}
                            authorName={post.authorName}
                            readOnlyEngagement={true}
                            categories={post.categories}
                            categoryEmojiOnly={true}
                        />
                    </div>
                ))}
            </div>
        </section>
    );
}
