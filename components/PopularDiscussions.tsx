import { client } from '@/sanity/lib/client';
import PostCard from './PostCard';

const RECENT_POSTS_QUERY = `
  *[ _type == "community" && defined(slug.current) ] | order(publishedAt desc) [0...6] {
    _id,
    title,
    "slug": slug.current,
    publishedAt,
    "fullText": pt::text(body), // Fetch the full plain text here
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
                    <PostCard key={post._id} post={post} />
                ))}
            </div>
        </section>
    );
}