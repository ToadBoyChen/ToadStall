import Link from 'next/link';
import { client } from '@/sanity/lib/client';

const ARTICLES_QUERY = `*[ _type == "data" && defined(slug.current) ] | order(publishedAt desc) {
  _id,
  title,
  slug,
  publishedAt,
  "excerpt": array::join(string::split((pt::text(body)), "")[0..120], "") + "..."
}`;

export default async function DataPage() {
  const articles = await client.fetch(ARTICLES_QUERY);

  return (
    <main className="relative z-10 w-full min-h-screen pt-32 px-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-5xl font-black text-white tracking-tighter mb-12 drop-shadow-md">
          Data
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {articles.map((article: any) => (
            <Link 
              href={`/articles/${article.slug.current}`} 
              key={article._id}
              className="block bg-white rounded-2xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:scale-[1.02] transition-transform duration-300"
            >
              <p className="text-emerald-600 font-bold text-sm tracking-widest uppercase mb-2">
                {new Date(article.publishedAt || Date.now()).toLocaleDateString()}
              </p>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-3">
                {article.title}
              </h2>
              <p className="text-slate-600 font-medium leading-relaxed">
                {article.excerpt}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}