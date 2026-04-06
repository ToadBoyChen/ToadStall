'use client';

import Link from 'next/link';
import { TbMushroom } from 'react-icons/tb';
import { FiMail, FiGlobe, FiFileText, FiGrid } from 'react-icons/fi';
import { MdOutlinePeopleAlt } from 'react-icons/md';
import { TbTools } from 'react-icons/tb';

const NAV_SECTIONS = [
    {
        label: 'Platform',
        links: [
            { href: '/data', label: 'Data & Analysis', icon: <FiGlobe className="w-3.5 h-3.5" /> },
            { href: '/articles', label: 'Articles & Reports', icon: <FiFileText className="w-3.5 h-3.5" /> },
            { href: '/community', label: 'Community', icon: <MdOutlinePeopleAlt className="w-3.5 h-3.5" /> },
            { href: '/tools-technical', label: 'Tools & Technical', icon: <TbTools className="w-3.5 h-3.5" /> },
        ],
    },
    {
        label: 'Browse',
        links: [
            { href: '/categories', label: 'All Topics', icon: <FiGrid className="w-3.5 h-3.5" /> },
            { href: '/community', label: 'Latest Discussions' },
            { href: '/articles', label: 'Latest Articles' },
            { href: '/create-post', label: 'Write a Post' },
        ],
    },
    {
        label: 'Info',
        links: [
            { href: '/privacy', label: 'Privacy Policy' },
            { href: '/terms', label: 'Terms of Use' },
        ],
    },
];

export default function Footer() {
    return (
        <footer className="relative z-50 w-full bg-white/90 backdrop-blur-sm border-t border-slate-100">
            <div className="max-w-6xl mx-auto px-6 pt-16 pb-8">

                {/* Main grid */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mb-16">

                    {/* Brand — 2 cols */}
                    <div className="md:col-span-2 flex flex-col gap-5">
                        <Link href="/" className="flex items-center gap-2.5 group w-fit">
                            <TbMushroom className="w-9 h-9 text-slate-900 group-hover:text-emerald-600 transition-colors" />
                            <span className="font-black text-2xl tracking-tighter text-slate-900 group-hover:text-emerald-600 transition-colors">
                                ToadStall
                            </span>
                        </Link>

                        <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
                            Independent, non-profit data analytics and discussion platform. Rigorous analysis, open debate.
                        </p>

                        <a
                            href="mailto:toby.chen1337@outlook.com"
                            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-emerald-600 transition-colors w-fit group"
                        >
                            <FiMail className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            toby.chen1337@outlook.com
                        </a>
                    </div>

                    {/* Nav columns — 3 cols */}
                    <div className="md:col-span-3 grid grid-cols-3 gap-8">
                        {NAV_SECTIONS.map((section) => (
                            <div key={section.label}>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-5">
                                    {section.label}
                                </p>
                                <ul className="space-y-3">
                                    {section.links.map((link) => (
                                        <li key={link.href}>
                                            <Link
                                                href={link.href}
                                                className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-emerald-600 transition-colors group"
                                            >
                                                {link.icon && (
                                                    <span className="text-slate-400 group-hover:text-emerald-500 transition-colors">
                                                        {link.icon}
                                                    </span>
                                                )}
                                                {link.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-slate-100 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest">
                        &copy; {new Date().getFullYear()} ToadStall — All rights reserved
                    </p>
                    <p className="text-slate-300 text-[11px] font-medium">
                        Built with Next.js &amp; Sanity
                    </p>
                </div>
            </div>
        </footer>
    );
}
