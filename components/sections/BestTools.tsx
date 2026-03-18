import Link from 'next/link';
import { client } from '@/sanity/lib/client';
import { FiArrowRight } from 'react-icons/fi';
import ContentCard from '@/components/general/ContentCard';

const RECENT_POSTS_QUERY = `
  *[ _type == "tools-technical" && defined(slug.current) ] | order(_createdAt desc) [0...6] {
    _id,
    title,
    "slug": slug.current,
    _createdAt,
    pricing,
    "excerpt": coalesce(excerpt, array::join(string::split((pt::text(body)), "")[0..100], "") + "...")
  }
`;

export default async function BestTools() {
    const posts = await client.fetch(RECENT_POSTS_QUERY);

    if (posts.length === 0) {
        return null;
    }

    return (
        <section className="w-full">
            <div className="mb-6 sm:mb-10 md:mb-12">
                <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight">
                    Tools & Breakdowns
                </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post: any) => (
                    <ContentCard
                        key={post._id}
                        id={post._id}
                        title={post.title}
                        href={`/tools-technical/${post.slug}`}
                        publishedAt={post._createdAt}
                        text={post.excerpt}
                        readOnlyEngagement={true}
                    />
                ))}
            </div>
        </section>
    );
}