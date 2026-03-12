import { client } from '@/sanity/lib/client';
import ContentCard from '@/components/general/ContentCard';
const QUERY = `*[ _type == "community" && defined(slug.current) ] | order(publishedAt desc) {
  _id,
  title,
  "slug": slug.current,
  "authorName": author->name,
  publishedAt,
  "fullText": pt::text(body)
}`;

export default async function CommunityPage() {
  const posts = await client.fetch(QUERY);

  return (
    <main className="relative z-10 w-full min-h-screen pt-32 px-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-5xl font-black text-white tracking-tighter mb-12 drop-shadow-md">
          Community
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {posts.map((posts: any) => (
            <ContentCard 
              key={posts._id}
              id={posts._id}
              title={posts.title}
              href={`/community/${posts.slug}`}
              publishedAt={posts.publishedAt}
              text={posts.fullText}
              authorName={posts.authorName}
              readOnlyEngagement={true}
            />
          ))}
        </div>
      </div>
    </main>
  );
}