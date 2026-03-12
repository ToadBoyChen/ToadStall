"use client";

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { HiHome, HiChevronRight } from 'react-icons/hi2';
import { useTransition, animated } from '@react-spring/web';

export default function Breadcrumbs() {
    const pathname = usePathname();
    const segments = (pathname || '').split('/').filter(Boolean).map((segment, index, arr) => ({
        segment,
        href: `/${arr.slice(0, index + 1).join('/')}`,
        isLast: index === arr.length - 1
    }));

    const transitions = useTransition(segments, {
        keys: (item) => item.href,
        from: { opacity: 0, transform: 'translateX(-10px)' },
        enter: { opacity: 1, transform: 'translateX(0px)' },
        leave: { opacity: 0, transform: 'translateX(10px)' },
        config: { tension: 300, friction: 25 }
    });

    return (
        <div aria-label="Breadcrumb" className="flex items-center overflow-hidden h-8 z-9999">
            <ol className="flex items-center gap-1 text-xs sm:text-sm font-medium">
                <li>
                    <Link 
                        href="/" 
                        className="text-slate-400 hover:text-emerald-500 transition-all duration-300 hover:scale-110 active:scale-95 flex items-center"
                    >
                        <HiHome className="w-4 h-4" />
                        <span className="sr-only">Home</span>
                    </Link>
                </li>

                {transitions((style, item) => {
                    const formattedSegment = item.segment
                        .replace(/-/g, ' ')
                        .replace(/\b\w/g, (char) => char.toUpperCase());

                    return (
                        <animated.li 
                            style={style} 
                            className="flex items-center gap-1"
                        >
                            <HiChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                            
                            {item.isLast ? (
                                <span className="text-slate-900 font-bold truncate max-w-25 sm:max-w-50 block">
                                    {formattedSegment}
                                </span>
                            ) : (
                                <Link 
                                    href={item.href} 
                                    className="text-slate-400 hover:text-slate-600 transition-colors duration-200 relative group block"
                                >
                                    {formattedSegment}
                                    <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-emerald-500 transition-all duration-300 group-hover:w-full" />
                                </Link>
                            )}
                        </animated.li>
                    );
                })}
            </ol>
        </div>
    );
}