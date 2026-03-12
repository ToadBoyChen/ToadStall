'use client';

import Link from 'next/link';
import { FiUser, FiLock, FiUnlock } from 'react-icons/fi';
import ExpandableText from './ExpandableText';
import EngagementBar from './EngagementBar';

interface ContentCardProps {
    id?: string;
    title: string;
    href: string;
    publishedAt?: string;
    text?: string;
    authorName?: string;
    status?: string;
    badgeLabel?: string;
    readOnlyEngagement?: boolean;
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
    readOnlyEngagement = false
}: ContentCardProps) {
    
    const isClosed = status?.toLowerCase() === 'closed';

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

            {(authorName || status) && (
                <div className="flex items-center gap-4 mb-4 mt-2 pointer-events-none">
                    {authorName && (
                        <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-500">
                            <FiUser className="w-4 h-4" />
                            <span>{authorName}</span>
                        </div>
                    )}

                    {status && (
                        <div className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wider ${
                            isClosed ? 'bg-slate-100 text-slate-500' : 'bg-emerald-50 text-emerald-600'
                        }`}>
                            {isClosed ? <FiLock className="w-3 h-3" /> : <FiUnlock className="w-3 h-3" />}
                            <span>{isClosed ? 'Closed' : 'Open'}</span>
                        </div>
                    )}
                </div>
            )}

            {text && <ExpandableText text={text} />}
            
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