"use client";

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { HiChevronRight } from 'react-icons/hi2';
import { useTransition, animated } from '@react-spring/web';

export default function Breadcrumb() {
    const pathname = usePathname();

    const segments = (pathname || '').split('/').filter(Boolean).map((segment, index, arr) => {
        let formattedSegment = segment
            .replace(/-/g, ' ')
            .replace(/\b\w/g, (char) => char.toUpperCase());

        const isProfileId = index > 0 && arr[index - 1].toLowerCase() === 'profile';
        if (isProfileId) {
            formattedSegment = "User Profile";
        }

        return {
            segment: formattedSegment,
            href: `/${arr.slice(0, index + 1).join('/')}`,
            isLast: index === arr.length - 1
        };
    });

    const transitions = useTransition(segments, {
        keys: (item) => item.href,
        from: {
            opacity: 0,
            transform: 'translateX(-15px)',
            maxWidth: '0px',
        },
        enter: {
            opacity: 1,
            transform: 'translateX(0px)',
            maxWidth: '250px',
        },
        leave: {
            opacity: 0,
            transform: 'translateX(10px)',
            maxWidth: '0px',
        },
        config: { tension: 400, friction: 30, clamp: true },
        trail: 50
    });

    return (
        <div aria-label="Breadcrumb" className="flex items-center h-8 z-50 text-xs md:text-sm lg:text-md font-bold tracking-tighter text-slate-300">
            <ol className="flex items-center">
                <li className="pr-1 shrink-0">
                    <Link
                        href="/"
                        className="hover:text-emerald-500 transition-all duration-300 flex items-center"
                    >
                        Home
                        <span className="sr-only">Home</span>
                    </Link>
                </li>
                {transitions((style, item) => (
                    <animated.li
                        style={{
                            ...style,
                            overflow: 'hidden',
                            whiteSpace: 'nowrap'
                        }}
                        className="flex items-center"
                    >
                        <div className="flex items-center gap-1 pr-1 w-max">
                            <HiChevronRight className="w-3.5 h-3.5 shrink-0" />

                            {item.isLast ? (
                                <span className="font-bold truncate max-w-25 sm:max-w-50 md:max-w-75 lg:max-w-100 block hover:text-emerald-500 cursor-pointer transition-colors duration-200 text-black">
                                    {item.segment}
                                </span>
                            ) : (
                                <Link
                                    href={item.href}
                                    className="transition-colors duration-200 relative group block hover:text-emerald-500"
                                >
                                    {item.segment}
                                    <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-emerald-500 transition-all duration-300 group-hover:w-full" />
                                </Link>
                            )}
                        </div>
                    </animated.li>
                ))}
            </ol>
        </div>
    );
}