import Image from 'next/image';
import { PortableText } from '@portabletext/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { urlFor } from '@/sanity/lib/image';
import EngagementBar from '@/components/general/EngagementBar';
import PostChartDisplay from '@/components/community/PostChartDisplay';
import { FiLock } from 'react-icons/fi';

interface Category {
    _id: string;
    title: string;
    icon?: string;
}

interface ChartConfig {
    indicator: string;
    countries: string[];
    startYear: string;
    endYear: string;
    chartType: 'line' | 'bar' | 'pie';
    smartYAxis: boolean;
}

interface PageContentProps {
    id: string;
    title: string;
    publishedAt?: string;
    authorName?: string;
    mainImage?: any;
    body: any;
    portableTextComponents: any;
    headerExtras?: React.ReactNode;
    status?: string;
    categories?: Category[];
    chart?: ChartConfig;
}

function getMarkdownString(bodyData: any): string | null {
    if (typeof bodyData === 'string') return bodyData;
    
    if (Array.isArray(bodyData)) {
        const extractedText = bodyData
            .map(block => block.children?.map((child: any) => child.text).join('') || '')
            .join('\n\n');
            
        if (extractedText.trim().length > 0) return extractedText;
    }
    
    return null;
}

export default function PageContent({
    id,
    title,
    publishedAt,
    authorName,
    mainImage,
    body,
    portableTextComponents,
    headerExtras,
    status,
    categories,
    chart,
}: PageContentProps) {
    
    // 2. Check if the post is closed
    const isClosed = status?.toLowerCase() === 'closed';

    const markdownString = getMarkdownString(body);

    const looksLikeMarkdown = markdownString && (
        markdownString.includes('#') || 
        markdownString.includes('```') || 
        markdownString.includes('**') ||
        markdownString.includes('> ') ||
        markdownString.includes('- ')
    );

    return (
        <main className="relative z-10 w-full min-h-screen pt-24 md:pt-32 pb-32 md:pb-48">
            <div className="max-w-7xl mx-auto px-0 sm:px-6 md:px-8">
                {/* Optional: Add a subtle grayscale effect to the main card if it's closed */}
                <article className={`bg-white sm:rounded-3xl pt-8 pb-12 px-5 sm:p-4 md:p-16 sm:shadow-[0_10px_40px_rgba(0,0,0,0.06)] transition-all ${isClosed ? 'border-t-4 border-slate-300' : ''}`}>
                    
                    {mainImage && mainImage.asset && (
                        <div className={`relative w-full aspect-16/10 md:h-96 mb-8 md:mb-12 overflow-hidden rounded-xl md:rounded-2xl bg-slate-100 ${isClosed ? 'grayscale-[0.5] opacity-90' : ''}`}>
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
                        {(isClosed || (categories && categories.length > 0)) && (
                            <div className="flex flex-wrap items-center gap-2 mb-6">
                                {isClosed && (
                                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-sm font-bold tracking-wide uppercase">
                                        <FiLock className="w-4 h-4" />
                                        Closed Discussion
                                    </div>
                                )}
                                {categories && categories.map((cat) => (
                                    <span
                                        key={cat._id}
                                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100"
                                    >
                                        {cat.icon && <span>{cat.icon}</span>}
                                        {cat.title}
                                    </span>
                                ))}
                            </div>
                        )}

                        <h1 className={`text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-[1.15] mb-4 sm:mb-6 ${isClosed ? 'text-slate-700' : 'text-slate-900'}`}>
                            {title}
                        </h1>

                        {/* Note: I added a quick sanity check here so we don't crash if publishedAt is missing */}
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm md:text-base text-slate-500 font-medium">
                            {publishedAt && (
                                <time dateTime={publishedAt}>
                                    {new Date(publishedAt).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric'
                                    })}
                                </time>
                            )}
                            
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

                    {chart?.indicator && (
                        <PostChartDisplay config={chart} />
                    )}

                    <div className="prose prose-slate sm:prose-lg max-w-none
                                    prose-headings:font-bold prose-headings:tracking-tight 
                                    prose-a:text-emerald-600 prose-a:decoration-emerald-500/30 hover:prose-a:decoration-emerald-500 prose-a:underline-offset-4 prose-a:transition-all
                                    prose-img:rounded-xl">
                  
                        {looksLikeMarkdown ? (
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {markdownString}
                            </ReactMarkdown>
                        ) : (
                            <PortableText
                                value={body}
                                components={portableTextComponents}
                            />
                        )}
                        
                    </div>

                    {/* 4. The Bottom Callout Alert */}
                    {isClosed && (
                        <div className="mt-16 p-6 sm:p-8 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
                            <div className="w-12 h-12 bg-white shadow-sm text-slate-400 rounded-full flex items-center justify-center shrink-0 border border-slate-100 mt-1">
                                <FiLock className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-slate-800">This discussion is closed</h4>
                                <p className="text-slate-500 mt-1 leading-relaxed">
                                    The author has archived this post. The content remains visible for historical context, but new replies and reactions have been disabled.
                                </p>
                            </div>
                        </div>
                    )}
                </article>
                
                <div className="mt-12 sm:mt-16">
                    <EngagementBar 
                        postId={id} 
                        variant="full" 
                        readOnly={isClosed} 
                    />
                </div>
            </div>
        </main>
    );
}