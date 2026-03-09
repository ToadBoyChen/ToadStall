import { client } from '@/sanity/lib/client';
import { PortableText } from '@portabletext/react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { urlFor } from '@/sanity/lib/image';
import DynamicChartWrapper from '@/components/DynamicChartWrapper';
import EngagementBar from '@/components/EngagementBar';

// 1. Updated _type to "community" and added the "status" field
const SINGLE_COMMUNITY_QUERY = `*[ _type == "community" && slug.current == $slug ][0] {
    _id,
    title,
    publishedAt,
    status,
    body,
    author
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
                        alt={value.alt || 'Inline community image'}
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

export default async function SingleCommunityPost({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = await params;
    const community = await client.fetch(SINGLE_COMMUNITY_QUERY, { slug: resolvedParams.slug });

    if (!community) notFound();

    return (
        <main className="relative z-10 w-full min-h-screen pt-32 px-6 pb-48">
            <div className="max-w-4xl mx-auto">

                {/* 2. Updated back link */}
                <Link href="/community" className="text-emerald-400 hover:text-emerald-300 font-semibold mb-8 inline-block transition-colors">
                    &larr; Back to Discussions
                </Link>
                <article className="bg-white rounded-3xl p-10 md:p-16 shadow-[0_20px_50px_rgba(0,0,0,0.2)]">

                    <header className="mb-12 border-b border-slate-200 pb-8">
                        <div className="flex justify-between items-start mb-4">
                            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                                {community.title}
                            </h1>
                            {/* Optional: Show status badge on the post itself */}
                            <span className={`mt-2 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-md ${community.status === 'closed' ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-600'}`}>
                                {community.status || 'Open'}
                            </span>
                        </div>
                        <p className="text-slate-500 font-medium">
                            Started on {new Date(community.publishedAt || Date.now()).toLocaleDateString()}
                        </p>
                    </header>

                    <div className="prose prose-lg prose-slate prose-a:text-emerald-600 max-w-none">
                        <PortableText
                            value={community.body}
                            components={myPortableTextComponents}
                        />
                    </div>
                </article>
                <EngagementBar postId={community._id} />
            </div>
        </main>
    );
}