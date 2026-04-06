import { client } from '@/sanity/lib/client';
import Link from 'next/link';

const QUERY = `
    *[_type == "category" && defined(slug.current)] {
        _id,
        title,
        icon,
        description,
        "slug": slug.current,
        "count": count(*[
            _type in ["article", "community", "data", "tools-technical"]
            && references(^._id)
        ]),
        "types": array::unique(*[
            _type in ["article", "community", "data", "tools-technical"]
            && references(^._id)
        ]._type)
    } | order(count desc)
`;

const TYPE_LABELS: Record<string, string> = {
    article: 'Articles',
    community: 'Discussions',
    data: 'Data',
    'tools-technical': 'Tools',
};

const TYPE_HREFS: Record<string, string> = {
    article: 'articles',
    community: 'community',
    data: 'data',
    'tools-technical': 'tools-technical',
};

export default async function CategoriesPage() {
    const categories = await client.fetch(QUERY);
    const populated = categories.filter((c: any) => c.count > 0);
    const empty = categories.filter((c: any) => c.count === 0);

    return (
        <main className="relative z-10 w-full min-h-screen pt-32 pb-24 px-6">
            <div className="max-w-5xl mx-auto">

                {/* Header */}
                <div className="mb-14">
                    <h1 className="text-5xl font-black text-white tracking-tighter mb-3">
                        Browse Topics
                    </h1>
                    <p className="text-white/50 text-lg font-medium max-w-xl">
                        Every piece of content, organised by topic. Find what you care about.
                    </p>
                </div>

                {/* Active categories */}
                {populated.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
                        {populated.map((cat: any) => (
                            <Link
                                key={cat._id}
                                href={`/category/${cat.slug}`}
                                className="group relative bg-white/80 hover:bg-white rounded-2xl p-6 transition-all duration-200 hover:shadow-lg border border-transparent hover:border-emerald-100 flex flex-col gap-4"
                            >
                                {/* Icon + count */}
                                <div className="flex items-start justify-between">
                                    <div className="text-4xl leading-none">
                                        {cat.icon || '📁'}
                                    </div>
                                    <span className="text-xs font-black text-emerald-600 bg-emerald-50 group-hover:bg-emerald-100 px-2.5 py-1 rounded-full transition-colors">
                                        {cat.count} {cat.count === 1 ? 'item' : 'items'}
                                    </span>
                                </div>

                                {/* Title + description */}
                                <div>
                                    <h2 className="text-lg font-black text-slate-900 group-hover:text-emerald-600 transition-colors tracking-tight leading-snug">
                                        {cat.title}
                                    </h2>
                                    {cat.description && (
                                        <p className="text-sm text-slate-500 mt-1 leading-snug line-clamp-2">
                                            {cat.description}
                                        </p>
                                    )}
                                </div>

                                {/* Content type chips */}
                                {cat.types?.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 mt-auto">
                                        {cat.types.map((t: string) => (
                                            <span
                                                key={t}
                                                className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-slate-100 text-slate-500"
                                            >
                                                {TYPE_LABELS[t] ?? t}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </Link>
                        ))}
                    </div>
                )}

                {/* Empty categories (no content yet) */}
                {empty.length > 0 && (
                    <div>
                        <p className="text-xs font-bold text-white/30 uppercase tracking-widest mb-4">
                            No content yet
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {empty.map((cat: any) => (
                                <span
                                    key={cat._id}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 text-white/40 text-sm font-semibold"
                                >
                                    {cat.icon && <span>{cat.icon}</span>}
                                    {cat.title}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {categories.length === 0 && (
                    <div className="text-center py-24 text-white/30 font-semibold">
                        No categories yet.
                    </div>
                )}
            </div>
        </main>
    );
}
