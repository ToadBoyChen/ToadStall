import { client } from '@/sanity/lib/client';
import { PortableText } from '@portabletext/react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { urlFor } from '@/sanity/lib/image';
import DynamicChartWrapper from '@/components/DynamicChartWrapper';
import EngagementBar from '@/components/EngagementBar';

const SINGLE_ARTICLE_QUERY = `*[ _type == "article" && slug.current == $slug ][0] {
  title,
  publishedAt,
  body,
  author,
  mainImage
}`;

const myPortableTextComponents = {
    types: {
        dataVisualizer: ({ value }: any) => {
            return <DynamicChartWrapper blockData={value} />;
        },

        image: ({ value }: any) => {
            if (!value?.asset?._ref) return null;
            return (
                <div className="relative w-full h-100 my-8 overflow-hidden rounded-xl">
                    <Image
                        src={urlFor(value).url()}
                        alt={value.alt || 'Inline article image'}
                        fill
                        className="object-cover"
                    />
                </div>
            );
        },
    },

    list: {
        alpha: ({ children }: any) => (
            <ol className="list-[lower-alpha] pl-6 my-6 space-y-2 marker:font-medium">
                {children}
            </ol>
        ),
    },
};

export default async function SingleArticle({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = await params;

    const article = await client.fetch(SINGLE_ARTICLE_QUERY, { slug: resolvedParams.slug });

    if (!article) notFound();

    return (
        <main className="relative z-10 w-full min-h-screen pt-32 px-6 pb-48">
            <div className="max-w-4xl mx-auto">

                <Link href="/articles" className="text-emerald-400 hover:text-emerald-300 font-semibold mb-8 inline-block transition-colors">
                    &larr; Back to Reports
                </Link>
                <article className="bg-white rounded-3xl p-10 md:p-16 shadow-[0_20px_50px_rgba(0,0,0,0.2)]">
                    {article.mainImage && (
                        <div className="relative w-full h-64 md:h-96 mb-10 overflow-hidden rounded-2xl">
                            <Image
                                src={urlFor(article.mainImage).url()}
                                alt={article.title || 'Article banner'}
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>
                    )}

                    <header className="mb-12 border-b border-slate-200 pb-8">
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
                            {article.title}
                        </h1>
                        <p className="text-slate-500 font-medium">
                            Published on {new Date(article.publishedAt || Date.now()).toLocaleDateString()}
                        </p>
                    </header>

                    <div className="prose prose-lg prose-slate prose-a:text-emerald-600 max-w-none">
                        <PortableText
                            value={article.body}
                            components={myPortableTextComponents}
                        />
                    </div>
                </article>
                <EngagementBar postId={article._id} />
            </div>
        </main>
    );
}