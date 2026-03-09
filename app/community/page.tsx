import Link from 'next/link';
import { client } from '@/sanity/lib/client';

const COMMUNITY_QUERY = `*[ _type == "community" && defined(slug.current) ] | order(publishedAt desc) {
  _id,
  title,
  slug,
  status,
  publishedAt,
  "excerpt": array::join(string::split((pt::text(body)), "")[0..120], "") + "..."
}`;

export default async function CommunityPage() {
  const discussions = await client.fetch(COMMUNITY_QUERY);

  return (
    <main className="relative z-10 w-full min-h-screen pt-32 px-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-5xl font-black text-white tracking-tighter mb-12 drop-shadow-md">
          Community Discussions
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {discussions.map((discussion: any) => (
            <Link 
              href={`/community/${discussion.slug.current}`} 
              key={discussion._id}
              className="block bg-white rounded-2xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:scale-[1.02] transition-transform duration-300"
            >
              <div className="flex justify-between items-center mb-2">
                <p className="text-emerald-600 font-bold text-sm tracking-widest uppercase">
                  {new Date(discussion.publishedAt || Date.now()).toLocaleDateString()}
                </p>
                <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-md ${discussion.status === 'closed' ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-600'}`}>
                  {discussion.status || 'Open'}
                </span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-3">
                {discussion.title}
              </h2>
              <p className="text-slate-600 font-medium leading-relaxed">
                {discussion.excerpt}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}