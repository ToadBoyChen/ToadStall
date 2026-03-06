import { client } from '@/sanity/lib/client';
import { PortableText } from '@portabletext/react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Map from '@/components/Map'; 

const SINGLE_POST_QUERY = `*[ _type == "post" && slug.current == $slug ][0] {
  title,
  publishedAt,
  body
}`;

// Define how custom Sanity blocks map to React components
const myPortableTextComponents = {
  types: {
    // The key here matches the 'name' of the object in your Sanity schema
    dataVisualizer: ({ value }: any) => {
      // Switch statement to render different components based on the editor's choice
      switch (value.vizType) {
        case 'migration-map':
          return <Map caption={value.caption} />;
        case 'climate-globe':
          return <div className="h-64 bg-emerald-900 rounded-xl my-8 text-white flex items-center justify-center">3D Globe Placeholder</div>;
        case 'data-card':
          return <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 my-8 shadow-sm">Data Card Placeholder</div>;
        default:
          return null; // Fallback if no visual is selected
      }
    },
  },
};

export default async function SingleArticle({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const post = await client.fetch(SINGLE_POST_QUERY, { slug: resolvedParams.slug });

  if (!post) notFound();

  return (
    <main className="relative z-10 w-full min-h-screen pt-32 px-6 pb-48">
      <div className="max-w-4xl mx-auto">
        
        <Link href="/articles" className="text-emerald-400 hover:text-emerald-300 font-semibold mb-8 inline-block transition-colors">
          &larr; Back to Reports
        </Link>

        {/* Removed max-w restrictions on the article card so your maps can stretch out */}
        <article className="bg-white rounded-3xl p-10 md:p-16 shadow-[0_20px_50px_rgba(0,0,0,0.2)]">
          <header className="mb-12 border-b border-slate-200 pb-8">
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
              {post.title}
            </h1>
            <p className="text-slate-500 font-medium">
              Published on {new Date(post.publishedAt || Date.now()).toLocaleDateString()}
            </p>
          </header>

          <div className="prose prose-lg prose-slate prose-a:text-emerald-600 max-w-none">
            {/* Pass the custom mapping to the renderer here */}
            <PortableText value={post.body} components={myPortableTextComponents} />
          </div>
        </article>

      </div>
    </main>
  );
}