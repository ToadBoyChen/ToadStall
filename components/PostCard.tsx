'use client';

import Link from 'next/link';
import { useState } from 'react';
import { FiMessageSquare } from 'react-icons/fi';
import YesNo from './YesNo';
import CommentCountBadge from './CommentCountBadge';

export default function PostCard({ post }: { post: any }) {
    const [isExpanded, setIsExpanded] = useState(false);

    const text = post.fullText || "";
    const characterLimit = 100;
    const needsTruncation = text.length > characterLimit;

    const displayText = isExpanded
        ? text
        : (needsTruncation ? text.slice(0, characterLimit) + "..." : text);

    return (
        <div className="group relative flex flex-col justify-between p-6 bg-white/80 rounded-2xl hover:bg-white hover:border-emerald-500/30 transition-all duration-300 border border-transparent overflow-hidden">
            <Link
                href={`/community/${post.slug}`}
                className="absolute inset-0 z-0"
                aria-label={`View full post: ${post.title}`}
            />
            <div className='flex flex-row justify-between mb-4 pointer-events-none'>
                <h3 className="text-2xl font-bold group-hover:text-emerald-400 transition-colors duration-300 tracking-tight">
                    {post.title}
                </h3>
                <p className="flex justify-center items-center transition-all duration-200 text-xs font-bold tracking-widest uppercase text-emerald-400 bg-emerald-100 group-hover:bg-emerald-800 group-hover:text-emerald-100 px-6 rounded-lg whitespace-nowrap ml-4 h-fit py-2">
                    {new Date(post.publishedAt || Date.now()).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                    })}
                </p>
            </div>
            <div className="mb-6 pointer-events-none">
                <p className="text-slate-700 leading-relaxed font-medium">
                    {displayText}
                </p>
                {needsTruncation && (
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            setIsExpanded(!isExpanded);
                        }}
                        className="relative z-10 text-emerald-500 font-bold mt-2 hover:text-emerald-600 focus:outline-none transition-colors pointer-events-auto"
                    >
                        {isExpanded ? "Read Less" : "Read More"}
                    </button>
                )}
            </div>
            <div className="relative z-10 flex items-center justify-between border-t border-slate-200/60 pt-4 mt-auto">
                <YesNo postId={post._id} />
                <CommentCountBadge postId={post._id} />

            </div>
        </div>
    );
}