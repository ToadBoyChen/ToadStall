'use client';

import Link from 'next/link';
import { FiUser, FiLock, FiUnlock } from 'react-icons/fi';
import ExpandableText from '@/components/general/ExpandableText';
import EngagementBar from '@/components/general/EngagementBar';
import { getCleanExcerpt } from '@/lib/utils';

interface Category {
    _id: string;
    title: string;
    icon?: string;
}

interface ContentCardProps {
    id?: string;
    title: string;
    href: string;
    publishedAt?: string;
    text?: any;
    authorName?: string;
    status?: string;
    badgeLabel?: string;
    readOnlyEngagement?: boolean;
    visualElement?: React.ReactNode;
    categories?: Category[];
    categoryEmojiOnly?: boolean;
}

export default function ContentCard({
    id,
    title,
    href,
    publishedAt,
    text,
    authorName,
    status,
    badgeLabel,
    readOnlyEngagement = false,
    visualElement,
    categories,
    categoryEmojiOnly = false
}: ContentCardProps) {
    
    const normalizedStatus = status?.toLowerCase();
    const showStatusBadge = normalizedStatus === 'open' || normalizedStatus === 'closed';
    const isClosed = normalizedStatus === 'closed';
    
    const cleanTextExcerpt = getCleanExcerpt(text);

    return (
        <div className="group relative flex flex-col justify-between p-6 bg-white/80 rounded-2xl hover:bg-white hover:border-emerald-500/30 transition-all duration-300 border border-transparent overflow-hidden h-full">
            
            <Link
                href={href}
                className="absolute inset-0 z-0"
                aria-label={`View full details for: ${title}`}
            />
            
            <div className='flex flex-row justify-between pointer-events-none'>
                <h3 className="text-2xl font-bold group-hover:text-emerald-400 transition-colors duration-300 tracking-tight">
                    {title}
                </h3>
                
                {(badgeLabel || publishedAt) && (
                    <p className="flex justify-center items-center transition-all duration-200 text-xs font-bold tracking-widest uppercase text-emerald-400 bg-emerald-100 group-hover:bg-emerald-800 group-hover:text-emerald-100 px-6 rounded-lg whitespace-nowrap ml-4 h-fit py-2">
                        {badgeLabel || new Date(publishedAt || Date.now()).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                        })}
                    </p>
                )}
            </div>

            <div className="flex items-center gap-3 mb-4 mt-2 pointer-events-none">
                <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-500">
                    <FiUser className="w-3.5 h-3.5 shrink-0" />
                    <span>{authorName || 'ToadStall'}</span>
                </div>

                {showStatusBadge && (
                    <div className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wider ${
                        isClosed ? 'bg-slate-100 text-slate-500' : 'bg-emerald-50 text-emerald-600'
                    }`}>
                        {isClosed ? <FiLock className="w-3 h-3" /> : <FiUnlock className="w-3 h-3" />}
                        <span>{isClosed ? 'Closed' : 'Open'}</span>
                    </div>
                )}
            </div>

            {categories && categories.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3 pointer-events-none">
                    {categoryEmojiOnly ? (
                        categories.filter(cat => cat.icon).map((cat) => (
                            <span key={cat._id} title={cat.title} className="text-base leading-none">
                                {cat.icon}
                            </span>
                        ))
                    ) : (
                        categories.map((cat) => (
                            <span
                                key={cat._id}
                                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100"
                            >
                                {cat.icon && <span>{cat.icon}</span>}
                                {cat.title}
                            </span>
                        ))
                    )}
                </div>
            )}

            {visualElement && (
                <div className="relative z-10 w-full my-4 pointer-events-auto">
                    {visualElement}
                </div>
            )}

            {cleanTextExcerpt && <ExpandableText text={cleanTextExcerpt} />}
            
            {id && (
                <EngagementBar 
                    postId={id} 
                    variant="minimal" 
                    readOnly={readOnlyEngagement}
                />
            )}
        </div>
    );
}