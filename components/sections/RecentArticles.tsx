import Link from 'next/link';
import Image from 'next/image';
import { client } from '@/sanity/lib/client';
import { urlFor } from '@/sanity/lib/image';
import { FiArrowRight, FiUser } from 'react-icons/fi';
import ContentCard from '@/components/general/ContentCard';
import GradientText from '@/components/animations/GradientText';
import FadeIn from '@/components/animations/CustomDiv';

const RECENT_POSTS_QUERY = `
  *[ _type == "article" && defined(slug.current) ] | order(publishedAt desc) [0...6] {
    _id,
    title,
    "slug": slug.current,
    publishedAt,
    "authorName": author->name,
    mainImage,
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
    const featuredImageUrl = featured.mainImage ? urlFor(featured.mainImage).width(900).height(500).fit('crop').url() : null;

    return (
        <section className="w-full">
            <div className="flex items-end justify-between mb-8 sm:mb-10">
                <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight">
                    Recent <GradientText>Articles</GradientText>
                </h2>
                <Link
                    href="/articles"
                    className="hidden sm:flex items-center gap-1.5 text-sm font-bold text-white/50 hover:text-white transition-colors shrink-0 mb-2"
                >
                    View all <FiArrowRight className="w-4 h-4" />
                </Link>
            </div>

            <FadeIn>
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
                    <Link
                        href={`/articles/${featured.slug}`}
                        className="group lg:col-span-3 relative flex flex-col justify-end min-h-72 sm:min-h-80 rounded-3xl overflow-hidden transition-all duration-300"
                    >
                        {featuredImageUrl ? (
                            <>
                                <Image
                                    src={featuredImageUrl}
                                    alt={featured.title}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                    sizes="(max-width: 1024px) 100vw, 60vw"
                                />
                                {/* gradient overlay */}
                                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent" />
                            </>
                        ) : (
                            <>
                                <div className="absolute inset-0 bg-white/80 group-hover:bg-white transition-colors duration-300" />
                                <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-400/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-400/20 transition-colors" />
                            </>
                        )}

                        <div className="absolute top-6 left-6 z-10">
                            <span className="text-xs font-black uppercase tracking-widest text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full">
                                Featured
                            </span>
                        </div>

                        <div className="relative z-10 p-7">
                            {featured.categories?.length > 0 && (
                                <div className="flex gap-1.5 mb-3">
                                    {featured.categories.filter((c: any) => c.icon).map((cat: any) => (
                                        <span key={cat._id} title={cat.title} className="text-xl leading-none">{cat.icon}</span>
                                    ))}
                                </div>
                            )}
                            <h3 className={`text-2xl sm:text-3xl font-black tracking-tight leading-tight mb-3 transition-colors ${featuredImageUrl ? 'text-white group-hover:text-emerald-300' : 'text-slate-900 group-hover:text-emerald-600'}`}>
                                {featured.title}
                            </h3>
                            {featured.excerpt && (
                                <p className={`text-sm leading-relaxed line-clamp-3 mb-4 ${featuredImageUrl ? 'text-white/75' : 'text-slate-600'}`}>
                                    {featured.excerpt}
                                </p>
                            )}
                            <div className="flex items-center justify-between">
                                <div className={`flex items-center gap-2 text-xs font-semibold ${featuredImageUrl ? 'text-white/60' : 'text-slate-400'}`}>
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
                        {rest.slice(0, 2).map((post: any) => {
                            const imageUrl = post.mainImage ? urlFor(post.mainImage).width(500).height(220).fit('crop').url() : null;
                            return (
                                <Link
                                    key={post._id}
                                    href={`/articles/${post.slug}`}
                                    className="group flex-1 flex flex-col bg-white/80 hover:bg-white rounded-2xl overflow-hidden border border-transparent hover:border-emerald-100 transition-all duration-300"
                                >
                                    {imageUrl && (
                                        <div className="relative h-36 w-full shrink-0 overflow-hidden">
                                            <Image
                                                src={imageUrl}
                                                alt={post.title}
                                                fill
                                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                                                sizes="(max-width: 1024px) 100vw, 30vw"
                                            />
                                        </div>
                                    )}
                                    <div className="flex flex-col gap-2 p-5 flex-1">
                                        {post.categories?.length > 0 && (
                                            <div className="flex gap-1">
                                                {post.categories.filter((c: any) => c.icon).map((cat: any) => (
                                                    <span key={cat._id} title={cat.title} className="text-base leading-none">{cat.icon}</span>
                                                ))}
                                            </div>
                                        )}
                                        <h3 className="text-base font-black text-slate-900 group-hover:text-emerald-600 transition-colors tracking-tight leading-snug line-clamp-2">
                                            {post.title}
                                        </h3>
                                        {post.excerpt && !imageUrl && (
                                            <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 flex-1">
                                                {post.excerpt}
                                            </p>
                                        )}
                                        <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold mt-auto pt-1">
                                            <FiUser className="w-3 h-3" />
                                            <span>{post.authorName || 'ToadStall'}</span>
                                            {post.publishedAt && (
                                                <>
                                                    <span>·</span>
                                                    <span>{new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Bottom row — remaining articles */}
                    {rest.slice(2).map((post: any) => (
                        <div key={post._id} className="lg:col-span-1">
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
            </FadeIn>
        </section>
    );
}
