import { client } from '@/sanity/lib/client';
import { notFound } from 'next/navigation';
import ContentCard from '@/components/general/ContentCard';

const CATEGORY_QUERY = `
    *[_type == "category" && slug.current == $slug][0] {
        _id,
        title,
        icon,
        description
    }
`;

const CONTENT_QUERY = `
    *[
        _type in ["article", "community", "data", "tools-technical"]
        && defined(slug.current)
        && $categoryId in categories[]._ref
    ] | order(publishedAt desc, _createdAt desc) {
        _id,
        _type,
        title,
        "slug": slug.current,
        publishedAt,
        _createdAt,
        "authorName": coalesce(authorName, author->name),
        status,
        "text": coalesce(
            pt::text(body),
            excerpt,
            description
        ),
        "categories": categories[]->{ _id, title, icon }
    }
`;

const TYPE_LABELS: Record<string, string> = {
    article: 'Article',
    community: 'Discussion',
    data: 'Data',
    'tools-technical': 'Tool',
};

const TYPE_HREFS: Record<string, string> = {
    article: 'articles',
    community: 'community',
    data: 'data',
    'tools-technical': 'tools-technical',
};

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const category = await client.fetch(CATEGORY_QUERY, { slug });

    if (!category) notFound();

    const posts = await client.fetch(CONTENT_QUERY, { categoryId: category._id });

    return (
        <main className="relative z-10 w-full min-h-screen pt-32 pb-24 px-6">
            <div className="max-w-5xl mx-auto">

                {/* Header */}
                <div className="mb-12">
                    <div className="flex items-center gap-4 mb-3">
                        {category.icon && (
                            <span className="text-5xl">{category.icon}</span>
                        )}
                        <h1 className="text-5xl font-black text-white tracking-tighter">
                            {category.title}
                        </h1>
                    </div>
                    <div className="flex items-center gap-3 mt-4">
                        <span className="text-sm font-bold text-white/50 uppercase tracking-widest">
                            {posts.length} {posts.length === 1 ? 'result' : 'results'}
                        </span>
                    </div>
                    {category.description && (
                        <p className="text-white/60 mt-2 max-w-xl">{category.description}</p>
                    )}
                </div>

                {posts.length === 0 ? (
                    <div className="text-center py-24 text-white/40 font-semibold">
                        No content in this category yet.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {posts.map((post: any) => (
                            <ContentCard
                                key={post._id}
                                id={post._id}
                                title={post.title}
                                href={`/${TYPE_HREFS[post._type]}/${post.slug}`}
                                publishedAt={post.publishedAt || post._createdAt}
                                text={post.text}
                                authorName={post.authorName}
                                status={post.status}
                                badgeLabel={TYPE_LABELS[post._type]}
                                categories={post.categories}
                                readOnlyEngagement={true}
                            />
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
