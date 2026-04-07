'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { TbMushroom } from 'react-icons/tb';
import { FiMenu, FiX } from 'react-icons/fi';
import UserMenu from '@/components/UserMenu';
import HackerText from '@/components/animations/HackerText';

const NAV_LINKS = [
    { label: 'Data', href: '/data' },
    { label: 'Articles', href: '/articles' },
    { label: 'Tools', href: '/tools-technical' },
    { label: 'Community', href: '/community' },
];

export default function Nav() {
    const [open, setOpen] = useState(false);
    const pathname = usePathname();

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-100">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 h-14 flex items-center justify-between gap-4">

                {/* Logo */}
                <Link
                    href="/"
                    className="flex items-center gap-1.5 shrink-0 group"
                    onClick={() => setOpen(false)}
                >
                    <TbMushroom 
                        className="w-6 h-6 text-emerald-600 transition-transform duration-200 -translate-y-0.5
                    
                        group-hover:rotate-12
                        " 
                    />
                    <HackerText text="ToadStall" className="text-md font-black tracking-tighter text-slate-900 font-mono" />
                </Link>

                {/* Desktop nav links */}
                <nav className="hidden md:flex items-center gap-0.5 flex-1 justify-center">
                    {NAV_LINKS.map(({ label, href }) => {
                        const active = pathname === href || pathname.startsWith(href + '/');
                        return (
                            <Link
                                key={href}
                                href={href}
                                className={`px-3.5 py-1.5 rounded-full text-sm transition-colors ${active
                                        ? 'text-emerald-600 bg-emerald-50'
                                        : 'text-slate-500 hover:text-white hover:bg-emerald-500/60'
                                    }`}
                            >
                                {label}
                            </Link>
                        );
                    })}
                </nav>

                {/* Right: user + mobile hamburger */}
                <div className="flex items-center gap-1 shrink-0">
                    <UserMenu />
                    <button
                        onClick={() => setOpen(!open)}
                        className="md:hidden p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                        aria-label="Toggle menu"
                    >
                        {open ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            {open && (
                <nav className="md:hidden border-t border-slate-100 bg-white px-4 py-3 flex flex-col gap-1">
                    {NAV_LINKS.map(({ label, href }) => {
                        const active = pathname === href || pathname.startsWith(href + '/');
                        return (
                            <Link
                                key={href}
                                href={href}
                                onClick={() => setOpen(false)}
                                className={`px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${active
                                        ? 'text-emerald-600 bg-emerald-50'
                                        : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
                                    }`}
                            >
                                {label}
                            </Link>
                        );
                    })}
                </nav>
            )}
        </header>
    );
}
