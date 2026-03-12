import Link from 'next/link';
import { client } from '@/sanity/lib/client';
import { FiArrowRight } from 'react-icons/fi';
import ContentCard from '@/components/general/ContentCard';

const RECENT_POSTS_QUERY = `
  *[ _type == "article" && defined(slug.current) ] | order(publishedAt desc) [0...6] {
    _id,
    title,
    "slug": slug.current,
    publishedAt,
    "authorName": author->name,
    "fullText": pt::text(body)
  }
`;

export default async function RecentArticles() {
    const posts = await client.fetch(RECENT_POSTS_QUERY);

    if (posts.length === 0) {
        return null;
    }

    return (
        <section className="w-full">
            <div className="flex flex-col md:flex-row justify-between items-baseline mb-4 pb-4">
                <h2 className="text-6xl font-black text-white tracking-tight mb-2">
                    Latest Articles
                </h2>
                <Link
                    href="/articles"
                    className="text-white mix-blend-difference hover:text-emerald-300 text-sm font-bold tracking-widest uppercase mt-4 md:mt-0 transition-colors flex items-center gap-2 group"
                >
                    View All
                    <FiArrowRight className="text-lg group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post: any) => (
                    <ContentCard 
                        key={post._id}
                        id={post._id}
                        title={post.title}
                        href={`/articles/${post.slug}`}
                        text={post.fullText}
                        authorName={post.authorName}
                        readOnlyEngagement={true}
                    />
                ))}
            </div>
        </section>
    );
}