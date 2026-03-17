"use client";

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { HiChevronRight } from 'react-icons/hi2';
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
        from: {
            opacity: 0,
            transform: 'translateX(-10px) scale(0.9)',
            gridTemplateColumns: '0fr'
        },
        enter: {
            opacity: 1,
            transform: 'translateX(0px) scale(1)',
            gridTemplateColumns: '1fr'
        },
        leave: {
            opacity: 0,
            transform: 'translateX(-10px) scale(0.9)',
            gridTemplateColumns: '0fr'
        },
        config: { tension: 350, friction: 25 }
    });

    return (
        <div aria-label="Breadcrumb" className="flex items-center overflow-hidden h-8 z-9999 text-xs font-bold tracking-tighter text-slate-300">
            <ol className="flex items-center">
                <li className="pr-1">
                    <Link
                        href="/"
                        className="hover:text-emerald-500 transition-all duration-300 flex items-center"
                    >
                        Home
                        <span className="sr-only">Home</span>
                    </Link>
                </li>

                {transitions((style, item) => {
                    const formattedSegment = item.segment
                        .replace(/-/g, ' ')
                        .replace(/\b\w/g, (char) => char.toUpperCase());

                    return (
                        <animated.li
                            style={{
                                ...style,
                                display: 'grid',
                            }}
                        >
                            <div className="overflow-hidden min-w-0">
                                <div className="flex items-center gap-1 pr-1 w-max">
                                    <HiChevronRight className="w-3.5 h-3.5 shrink-0" />

                                    {item.isLast ? (
                                        <span className="font-bold truncate max-w-25 sm:max-w-50 block hover:text-emerald-500 cursor-pointer transition-colors duration-200 text-black">
                                            {formattedSegment}
                                        </span>
                                    ) : (
                                        <Link
                                            href={item.href}
                                            className="transition-colors duration-200 relative group block hover:text-emerald-500"
                                        >
                                            {formattedSegment}
                                            <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-emerald-500 transition-all duration-300 group-hover:w-full" />
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </animated.li>
                    );
                })}
            </ol>
        </div>
    );
}