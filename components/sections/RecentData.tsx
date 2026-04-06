import Link from 'next/link';
import { client } from '@/sanity/lib/client';
import { FiArrowRight } from 'react-icons/fi';
import DataCarousel from './DataCarousel';

const RECENT_POSTS_QUERY = `
  *[ _type == "data" && defined(slug.current) ] | order(publishedAt desc) [0...8] {
    _id,
    title,
    "slug": slug.current,
    publishedAt,
    "excerpt": coalesce(
      array::join(string::split((pt::text(body)), "")[0..120], "") + "…",
      ""
    ),
    "categories": categories[]->{ _id, title, icon }
  }
`;

export default async function RecentData() {
    const posts = await client.fetch(RECENT_POSTS_QUERY);

    if (posts.length === 0) return null;

    return (
        <section className="w-full">
            <div className="flex items-end justify-between mb-8 sm:mb-10">
                <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight">
                    Key Data Points
                </h2>
                <Link
                    href="/data"
                    className="hidden sm:flex items-center gap-1.5 text-sm font-bold text-white/50 hover:text-white transition-colors shrink-0 mb-2"
                >
                    View all <FiArrowRight className="w-4 h-4" />
                </Link>
            </div>

            <DataCarousel posts={posts} />
        </section>
    );
}
