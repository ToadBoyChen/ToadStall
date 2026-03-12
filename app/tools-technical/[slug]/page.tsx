import { client } from '@/sanity/lib/client';
import { PortableText } from '@portabletext/react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { urlFor } from '@/sanity/lib/image';
import DynamicChartWrapper from '@/components/charts/DynamicChartWrapper';
import EngagementBar from '@/components/general/EngagementBar';

const SINGLE_TOOL_QUERY = `*[ _type == "tools-technical" && slug.current == $slug ][0] {
    _id,
    title,
    _createdAt,
    body,
    url,
    pricing
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
                        alt={value.alt || 'Inline tool image'}
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

export default async function SingleToolPage({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = await params;
    const tool = await client.fetch(SINGLE_TOOL_QUERY, { slug: resolvedParams.slug });

    if (!tool) notFound();

    return (
        <main className="relative z-10 w-full min-h-screen pt-32 px-6 pb-48">
            <div className="max-w-4xl mx-auto">
                <Link href="/tools-technical" className="text-emerald-400 hover:text-emerald-300 font-semibold mb-8 inline-block transition-colors">
                    &larr; Back to Technical Tools
                </Link>
                <article className="bg-white rounded-3xl p-10 md:p-16 shadow-[0_20px_50px_rgba(0,0,0,0.2)]">

                    <header className="mb-12 border-b border-slate-200 pb-8">
                        <div className="flex justify-between items-start mb-4">
                            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                                {tool.title}
                            </h1>
                        </div>

                        <div className="flex items-center gap-4 mt-6">
                            <p className="text-slate-500 font-medium">
                                Added on {new Date(tool._createdAt || Date.now()).toLocaleDateString()}
                            </p>

                            {tool.url && (
                                <a
                                    href={tool.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-emerald-600 text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
                                >
                                    Visit Tool &nearr;
                                </a>
                            )}
                        </div>
                    </header>

                    <div className="prose prose-lg prose-slate prose-a:text-emerald-600 max-w-none">
                        <PortableText
                            value={tool.body}
                            components={myPortableTextComponents}
                        />
                    </div>
                </article>
                <EngagementBar postId={tool._id} />
            </div>
        </main>
    );
}