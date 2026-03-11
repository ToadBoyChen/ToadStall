import { client } from '@/sanity/lib/client';
import { PortableText } from '@portabletext/react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { urlFor } from '@/sanity/lib/image';
import DynamicChartWrapper from '@/components/DynamicChartWrapper';
import EngagementBar from '@/components/EngagementBar';

const SINGLE_DATA_QUERY = `*[ _type == "data" && slug.current == $slug ][0] {
    _id,
    title,
    sourceName,
    sourceUrl,
    lastUpdated,
    body
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
                        alt={value.alt || 'Inline data image'}
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

export default async function SingleDataPage({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = await params;
    const data = await client.fetch(SINGLE_DATA_QUERY, { slug: resolvedParams.slug });

    if (!data) notFound();

    return (
        <main className="relative z-10 w-full min-h-screen pt-32 px-6 pb-48">
            <div className="max-w-4xl mx-auto">

                {/* 2. Updated back link */}
                <Link href="/data" className="text-emerald-400 hover:text-emerald-300 font-semibold mb-8 inline-block transition-colors">
                    &larr; Back to Data Hub
                </Link>

                <article className="bg-white rounded-3xl p-10 md:p-16 shadow-[0_20px_50px_rgba(0,0,0,0.2)]">

                    <header className="mb-12 border-b border-slate-200 pb-8">
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
                            {data.title}
                        </h1>

                        {/* 3. Updated metadata to show Data Source and Last Updated */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-slate-500 font-medium mt-6">
                            {data.lastUpdated && (
                                <p>
                                    Last Updated: <span className="text-slate-700">{new Date(data.lastUpdated).toLocaleDateString()}</span>
                                </p>
                            )}

                            {data.sourceName && (
                                <p className="flex items-center gap-2">
                                    Source:
                                    {data.sourceUrl ? (
                                        <a href={data.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:text-emerald-700 underline underline-offset-4 decoration-emerald-600/30">
                                            {data.sourceName}
                                        </a>
                                    ) : (
                                        <span className="text-slate-700">{data.sourceName}</span>
                                    )}
                                </p>
                            )}
                        </div>
                    </header>

                    <div className="prose prose-lg prose-slate prose-a:text-emerald-600 max-w-none">
                        <PortableText
                            value={data.body}
                            components={myPortableTextComponents}
                        />
                    </div>
                </article>
                <EngagementBar postId={data._id} />
            </div>
        </main>
    );
}