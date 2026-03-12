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
    portableTextComponents,
    headerExtras
}: PageContentProps) {
    return (
        <main className="relative z-10 w-full min-h-screen pt-24 md:pt-32 pb-32 md:pb-48">
            <div className="max-w-4xl mx-auto px-0 sm:px-6 md:px-8">
                <article className="bg-white sm:rounded-3xl pt-8 pb-12 px-5 sm:p-10 md:p-16 sm:shadow-[0_10px_40px_rgba(0,0,0,0.06)]">
                    
                    {mainImage && mainImage.asset && (
                        <div className="relative w-full aspect-16/10 md:h-96 mb-8 md:mb-12 overflow-hidden rounded-xl md:rounded-2xl bg-slate-100">
                            <Image
                                src={urlFor(mainImage).url()}
                                alt={title || 'Article banner'}
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>
                    )}

                    <header className="mb-8 md:mb-12 border-b border-slate-100 pb-8">
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-[1.15] mb-4 sm:mb-6">
                            {title}
                        </h1>
                        
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm md:text-base text-slate-500 font-medium">
                            <time dateTime={publishedAt}>
                                {new Date(publishedAt || Date.now()).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                })}
                            </time>
                            
                            {authorName && (
                                <>
                                    <span className="text-slate-300">•</span>
                                    <span>By <span className="text-slate-700">{authorName}</span></span>
                                </>
                            )}
                            
                            {headerExtras && (
                                <>
                                    <span className="text-slate-300">•</span>
                                    <div>{headerExtras}</div>
                                </>
                            )}
                        </div>
                    </header>

                    <div className="prose prose-slate sm:prose-lg max-w-none 
                                    prose-headings:font-bold prose-headings:tracking-tight 
                                    prose-a:text-emerald-600 prose-a:decoration-emerald-500/30 hover:prose-a:decoration-emerald-500 prose-a:underline-offset-4 prose-a:transition-all
                                    prose-img:rounded-xl">
                        <PortableText
                            value={body}
                            components={portableTextComponents}
                        />
                    </div>
                </article>
                
                <div className="mt-12 sm:mt-16">
                    <EngagementBar postId={id} variant="full" />
                </div>
            </div>
        </main>
    );
}