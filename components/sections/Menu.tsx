'use client';

import Link from 'next/link';
import { FiGlobe, FiFileText, FiArrowRight } from 'react-icons/fi';
import { MdOutlinePeopleAlt } from 'react-icons/md';
import { TbTools } from 'react-icons/tb';

const MENU_ITEMS = [
    {
        title: 'Data & Analysis',
        href: '/data',
        description: 'Interactive maps and live data with discussions and debate.',
        icon: <FiGlobe />
    },
    {
        title: 'Articles & Reports',
        href: '/articles',
        description: 'Articles, methodology breakdowns, and data briefs.',
        icon: <FiFileText />
    },
    {
        title: 'Tools & Technical',
        href: '/tools-technical',
        description: 'Tools for you to use and comprehensive breakdowns on how ToadStall works.',
        icon: <TbTools />
    },
    {
        title: 'Community & Blog',
        href: '/community',
        description: 'A place for all to have an opinion and say. Join the discussion.',
        icon: <MdOutlinePeopleAlt />
    }
];

export default function Menu() {
    return (
        <section className="">

            <div className="mb-12">
                <h2 className="text-6xl font-black text-white tracking-tight mb-2">
                    Explore Platform
                </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {MENU_ITEMS.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className="group relative flex flex-col justify-between p-8 bg-white/80 rounded-3xl transition-all duration-300 hover:bg-white overflow-hidden"
                    >
                        <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center text-2xl text-emerald-600 mb-6 group-hover:scale-110 group-hover:bg-emerald-100 transition-all duration-300">
                            {item.icon}
                        </div>

                        <h3 className="text-2xl font-bold mb-3 group-hover:text-emerald-400 transition-colors duration-300 tracking-tight">
                            {item.title}
                        </h3>
                        <p className="text-slate-700 leading-relaxed font-medium">
                            {item.description}
                        </p>

                        <div className="mt-8 flex items-center text-emerald-500 font-bold text-sm tracking-widest uppercase translate-x-0 group-hover:translate-x-4 transition-all duration-300">
                            Explore <FiArrowRight className="ml-2 text-lg" />
                        </div>
                    </Link>
                ))}
            </div>

        </section>
    );
}