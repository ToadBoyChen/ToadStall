'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { FiChevronLeft, FiChevronRight, FiDatabase } from 'react-icons/fi';

export default function DataCarousel({ posts }: { posts: any[] }) {
    const trackRef = useRef<HTMLDivElement>(null);
    const [canLeft, setCanLeft] = useState(false);
    const [canRight, setCanRight] = useState(posts.length > 1);

    const updateButtons = useCallback(() => {
        const el = trackRef.current;
        if (!el) return;
        setCanLeft(el.scrollLeft > 4);
        setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
    }, []);

    useEffect(() => {
        updateButtons();
    }, [updateButtons]);

    const scroll = (dir: 'left' | 'right') => {
        const el = trackRef.current;
        if (!el) return;
        const card = el.firstElementChild as HTMLElement;
        const step = card ? card.offsetWidth + 16 : 300;
        el.scrollBy({ left: dir === 'right' ? step : -step, behavior: 'smooth' });
        setTimeout(updateButtons, 400);
    };

    return (
        <div className="relative">
            {/* Nav buttons */}
            <div className="absolute -top-14 right-0 flex items-center gap-2 z-10">
                <button
                    onClick={() => scroll('left')}
                    disabled={!canLeft}
                    className="w-9 h-9 rounded-full bg-white/80 hover:bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:text-emerald-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                    aria-label="Previous"
                >
                    <FiChevronLeft className="w-4 h-4" />
                </button>
                <button
                    onClick={() => scroll('right')}
                    disabled={!canRight}
                    className="w-9 h-9 rounded-full bg-white/80 hover:bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:text-emerald-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                    aria-label="Next"
                >
                    <FiChevronRight className="w-4 h-4" />
                </button>
            </div>

            {/* Card track */}
            <div
                ref={trackRef}
                onScroll={updateButtons}
                className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4 sm:-mx-6 sm:px-6"
            >
                {posts.map((post: any) => (
                    <Link
                        key={post._id}
                        href={`/data/${post.slug}`}
                        className="group shrink-0 w-64 sm:w-72 flex flex-col gap-4 p-5 bg-white/80 hover:bg-white rounded-2xl transition-all duration-200 border border-transparent hover:border-emerald-100"
                    >
                        {/* Icon + date */}
                        <div className="flex items-center justify-between">
                            <div className="w-9 h-9 rounded-xl bg-emerald-50 group-hover:bg-emerald-100 flex items-center justify-center shrink-0 transition-colors text-lg leading-none">
                                {post.categories?.[0]?.icon
                                    ? <span>{post.categories[0].icon}</span>
                                    : <FiDatabase className="w-4 h-4 text-emerald-600" />
                                }
                            </div>
                            {post.publishedAt && (
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    {new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                </span>
                            )}
                        </div>

                        {/* Title */}
                        <h3 className="text-base font-black text-slate-900 group-hover:text-emerald-600 transition-colors tracking-tight leading-snug line-clamp-2">
                            {post.title}
                        </h3>

                        {/* Excerpt */}
                        {post.excerpt && (
                            <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 flex-1">
                                {post.excerpt}
                            </p>
                        )}

                        {/* Footer */}
                        <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-100">
                            <div className="flex gap-1">
                                {post.categories?.slice(1).filter((c: any) => c.icon).map((cat: any) => (
                                    <span key={cat._id} title={cat.title} className="text-sm">{cat.icon}</span>
                                ))}
                            </div>
                            <FiChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
