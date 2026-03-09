import Link from 'next/link';
import { client } from '@/sanity/lib/client';

const TOOLS_QUERY = `*[ _type == "tools-technical" && defined(slug.current) ] | order(_createdAt desc) {
  _id,
  title,
  slug,
  pricing,
  excerpt,
  _createdAt
}`;

export default async function ToolsPage() {
  const tools = await client.fetch(TOOLS_QUERY);

  return (
    <main className="relative z-10 w-full min-h-screen pt-32 px-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-5xl font-black text-white tracking-tighter mb-12 drop-shadow-md">
          Tools
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tools.map((tool: any) => (
            <Link 
              href={`/tools-technical/${tool.slug.current}`} 
              key={tool._id}
              className="block bg-white rounded-2xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:scale-[1.02] transition-transform duration-300"
            >
              <div className="flex justify-between items-center mb-2">
                 <p className="text-emerald-600 font-bold text-sm tracking-widest uppercase">
                  {new Date(tool._createdAt || Date.now()).toLocaleDateString()}
                 </p>
                 {tool.pricing && (
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                      {tool.pricing}
                    </span>
                 )}
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-3">
                {tool.title}
              </h2>
              <p className="text-slate-600 font-medium leading-relaxed">
                {tool.excerpt || 'Click to view tool details...'}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}