import Link from 'next/link';
import { client } from '@/sanity/lib/client';
import { FiGrid } from 'react-icons/fi';

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
    } | order(count desc) [0...7]
`;

export default async function CategoryBar() {
    const categories = await client.fetch(QUERY);

    const populated = categories.filter((c: any) => c.count > 0);

    if (populated.length === 0) return null;

    return (
        <div className="w-full">
            <div className="flex items-start justify-between">
                {populated.map((cat: any) => (
                    <Link
                        key={cat._id}
                        href={`/category/${cat.slug}`}
                        className="group flex flex-col items-center gap-1.5 flex-1 min-w-0"
                    >
                        <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-xl sm:rounded-2xl bg-white/60 group-hover:bg-white transition-all duration-200 flex items-center justify-center text-xl sm:text-2xl lg:text-3xl">
                            {cat.icon}
                        </div>
                        <span className="text-xs font-semibold text-white/70 group-hover:text-white transition-colors text-center leading-tight line-clamp-1 w-full px-0.5">
                            {cat.title}
                        </span>
                    </Link>
                ))}

                {/* Browse all */}
                <Link
                    href="/categories"
                    className="group flex flex-col items-center gap-1.5 flex-1 min-w-0"
                >
                    <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-xl sm:rounded-2xl bg-white/60 group-hover:bg-white transition-all duration-200 flex items-center justify-center">
                        <FiGrid className="w-4 h-4 sm:w-5 sm:h-5 text-white group-hover:text-black transition-colors" />
                    </div>
                    <span className="text-xs font-semibold text-white/50 group-hover:text-white transition-colors text-center leading-tight">
                        All Topics
                    </span>
                </Link>
            </div>
        </div>
    );
}
