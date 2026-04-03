import Link from 'next/link';
import { client } from '@/sanity/lib/client';

const QUERY = `
    *[_type == "category" && defined(icon) && defined(slug.current)] {
        _id,
        title,
        icon,
        "slug": slug.current,
        "count": count(*[
            _type in ["article", "community", "data", "tools-technical"]
            && references(^._id)
        ])
    } | order(count desc) [0...14]
`;

export default async function CategoryBar() {
    const categories = await client.fetch(QUERY);

    const populated = categories.filter((c: any) => c.count > 0);

    if (populated.length === 0) return null;

    return (
        <div className="w-full">
            <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-hide">
                {populated.map((cat: any) => (
                    <Link
                        key={cat._id}
                        href={`/category/${cat.slug}`}
                        className="group flex flex-col items-center gap-1.5 shrink-0 w-16 sm:w-20"
                    >
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/80 group-hover:bg-white group-hover:scale-105 group-hover:shadow-md transition-all duration-200 flex items-center justify-center text-2xl sm:text-3xl">
                            {cat.icon}
                        </div>
                        <span className="text-[10px] sm:text-xs font-semibold text-white/70 group-hover:text-white transition-colors text-center leading-tight line-clamp-2">
                            {cat.title}
                        </span>
                    </Link>
                ))}
            </div>
        </div>
    );
}
