'use client';

import Link from 'next/link';
import { FiGlobe, FiFileText, FiClipboard, FiCode, FiArrowRight } from 'react-icons/fi';

// 1. Define the menu items with React Icon components
const MENU_ITEMS = [
    {
        title: 'Data Trackers & Tools',
        href: '/tool',
        description: 'Interactive maps, 3D globes, and live humanitarian data visualizations.',
        icon: <FiGlobe />
    },
    {
        title: 'Analysis & Reports',
        href: '/articles',
        description: 'In-depth articles, methodology breakdowns, and weekly data briefs.',
        icon: <FiFileText />
    },
    {
        title: 'Methodology',
        href: '/methodology',
        description: 'Transparency on how we source and process HDX HAPI open-source data.',
        icon: <FiClipboard />
    },
    {
        title: 'Developer API',
        href: '/api',
        description: 'Access our custom datasets programmatically for your own projects.',
        icon: <FiCode />
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

                        <div className="mt-8 flex items-center text-emerald-500 font-bold text-sm tracking-widest uppercase opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                            Explore <FiArrowRight className="ml-2 text-lg" />
                        </div>
                    </Link>
                ))}
            </div>

        </section>
    );
}