"use client";

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import React from 'react';
import { Home, ChevronRight } from 'lucide-react';

export default function Breadcrumbs() {
    const pathname = usePathname();
    if (pathname === '/') return null;
    const segments = pathname.split('/').filter((segment) => segment !== '');

    return (
        <nav aria-label="Breadcrumb" className="relative z-20 w-full max-w-5xl mx-auto px-6 pt-24 pb-4">
            <ol className="flex items-center space-x-1.5 flex-wrap">
                <li>
                    <Link 
                        href="/" 
                        className="flex items-center gap-1.5 px-2 py-1.5 rounded-md text-sm font-medium text-white mix-blend-difference hover:text-emerald-400 hover:bg-emerald-400/10 transition-all duration-200"
                    >
                        <Home className="w-4 h-4" />
                        <span className="hidden sm:inline">Home</span>
                    </Link>
                </li>

                {segments.map((segment, index) => {
                    const href = `/${segments.slice(0, index + 1).join('/')}`;
                    const isLast = index === segments.length - 1;
                    
                    const formattedSegment = segment
                        .replace(/-/g, ' ')
                        .replace(/\b\w/g, (char) => char.toUpperCase());

                    return (
                        <React.Fragment key={href}>
                            <li>
                                <ChevronRight className="w-4 h-4 text-white mix-blend-difference shrink-0" />
                            </li>
                            
                            <li>
                                {isLast ? (
                                    <div className="flex items-center px-3 py-1.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-sm font-semibold text-emerald-400 shadow-sm backdrop-blur-sm cursor-default">
                                        {formattedSegment}
                                    </div>
                                ) : (
                                    <Link 
                                        href={href} 
                                        className="flex items-center px-2 py-1.5 rounded-md text-sm font-medium text-white mix-blend-difference hover:text-emerald-400 hover:bg-emerald-400/10 transition-all duration-200"
                                    >
                                        {formattedSegment}
                                    </Link>
                                )}
                            </li>
                        </React.Fragment>
                    );
                })}
            </ol>
        </nav>
    );
}