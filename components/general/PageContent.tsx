import Link from 'next/link';
import Image from 'next/image';
import { PortableText } from '@portabletext/react';
import { urlFor } from '@/sanity/lib/image';
import EngagementBar from '@/components/general/EngagementBar';

interface PageContentProps {
    id: string;
    title: string;
    publishedAt?: string;
    authorName?: string;
    mainImage?: any;
    body: any;
    backLink: string;
    backLabel: string;
    portableTextComponents: any;
    headerExtras?: React.ReactNode;
}

export default function PageContent({
    id,
    title,
    publishedAt,
    authorName,
    mainImage,
    body,
    backLink,
    backLabel,
    portableTextComponents,
    headerExtras
}: PageContentProps) {
    return (
        <main className="relative z-10 w-full min-h-screen pt-32 px-6 pb-48">
            <div className="max-w-4xl mx-auto">

                <Link href={backLink} className="text-emerald-400 hover:text-emerald-300 font-semibold mb-8 inline-block transition-colors">
                    &larr; {backLabel}
                </Link>
                
                <article className="bg-white rounded-3xl p-10 md:p-16 shadow-[0_20px_50px_rgba(0,0,0,0.2)]">
                    
                    {mainImage && mainImage.asset && (
                        <div className="relative w-full h-64 md:h-96 mb-10 overflow-hidden rounded-2xl">
                            <Image
                                src={urlFor(mainImage).url()}
                                alt={title || 'Article banner'}
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>
                    )}

                    <header className="mb-12 border-b border-slate-200 pb-8">
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
                            {title}
                        </h1>
                        
                        <div className="flex flex-col md:flex-row md:items-center gap-4 text-slate-500 font-medium">
                            <p>
                                Published on {new Date(publishedAt || Date.now()).toLocaleDateString()}
                            </p>
                            {authorName && (
                                <>
                                    <span className="hidden md:inline">•</span>
                                    <p>By {authorName}</p>
                                </>
                            )}
                            {headerExtras && (
                                <>
                                    <span className="hidden md:inline">•</span>
                                    <div>{headerExtras}</div>
                                </>
                            )}
                        </div>
                    </header>

                    <div className="prose prose-lg prose-slate prose-a:text-emerald-600 max-w-none">
                        <PortableText
                            value={body}
                            components={portableTextComponents}
                        />
                    </div>
                </article>
                
                <EngagementBar postId={id} variant="full" />
            </div>
        </main>
    );
}