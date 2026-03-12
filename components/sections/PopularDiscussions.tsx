import { client } from '@/sanity/lib/client';
import { databases, appwriteDatabaseId } from '@/lib/appwrite';
import { Query } from 'appwrite';
import ContentCard from '@/components/ContentCard';

export default async function PopularArticles() {
    let topIds: string[] = [];
    const scoreMap: Record<string, number> = {};

    try {
        const votesCollection = process.env.NEXT_PUBLIC_APPWRITE_VOTES_COLLECTION_ID as string;

        const votesRes = await databases.listDocuments(
            appwriteDatabaseId,
            votesCollection,
            [Query.limit(5000)]
        );

        votesRes.documents.forEach((vote: any) => {
            const postId = vote.sanityPostId;
            if (!scoreMap[postId]) scoreMap[postId] = 0;

            if (vote.voteType === 1) scoreMap[postId] += 1;
            if (vote.voteType === -1) scoreMap[postId] -= 1;
        });

        topIds = Object.entries(scoreMap)
            .sort(([, scoreA], [, scoreB]) => scoreB - scoreA)
            .slice(0, 50)
            .map(([id]) => id);

    } catch (error) {
        console.error("Failed to fetch or calculate votes from Appwrite:", error);
    }

    const hasPopularPosts = topIds.length > 0;

    const queryFilter = hasPopularPosts
        ? `_type == "community" && defined(slug.current) && _id in $topIds`
        : `_type == "community" && defined(slug.current)`;

    const POSTS_QUERY = `
        *[ ${queryFilter} ] {
            _id,
            title,
            "slug": slug.current,
            status,
            "authorName": author->name,
            publishedAt,
            "fullText": pt::text(body)
        }
    `;

    const params = hasPopularPosts ? { topIds } : {};
    let posts = await client.fetch(POSTS_QUERY, params);

    if (hasPopularPosts) {
        posts = posts
            .sort((a: any, b: any) => {
                const scoreA = scoreMap[a._id] || 0;
                const scoreB = scoreMap[b._id] || 0;
                return scoreB - scoreA;
            })
            .slice(0, 3);
    } else {
        posts = posts.sort((a: any, b: any) =>
            new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
        ).slice(0, 3);
    }

    if (posts.length === 0) {
        return null;
    }

    return (
        <section className="w-full">
            <div className="flex flex-col md:flex-row justify-center items-baseline mb-4 pb-4">
                <h2 className="text-6xl font-black text-white tracking-tight mb-2">
                    {hasPopularPosts ? "Top Discussions" : "Recent Discussions"}
                </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {posts.map((post: any) => (
                    <ContentCard 
                    key={post._id}
                    id={post._id}
                    title={post.title}
                    href={`/community/${post.slug}`}
                    publishedAt={post.publishedAt}
                    text={post.fullText}
                    authorName={post.authorName}
                    status={post.status}
                />
                ))}
            </div>
        </section>
    );
}