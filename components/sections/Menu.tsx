'use client';

import Link from 'next/link';
import { FiGlobe, FiFileText, FiArrowRight } from 'react-icons/fi';
import { MdOutlinePeopleAlt } from 'react-icons/md';
import { TbTools } from 'react-icons/tb';
import HackerText from '@/components/animations/HackerText';
import FadeIn from '@/components/animations/CustomDiv';

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
        <section className="w-full">
            <div className="mb-6 sm:mb-10 md:mb-12">
                <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight">
                    <HackerText text="Explore Platform" />
                </h2>
            </div>

            <div className="relative grid grid-cols-2 gap-4 sm:gap-6 md:gap-8">
                {MENU_ITEMS.map((item, i) => (
                    <FadeIn key={item.href} delay={i * 80}>
                        <Link
                            key={item.href}
                            href={item.href}
                            className="group relative flex flex-col justify-between p-6 md:p-8 bg-white/80 rounded-3xl transition-all duration-300 hover:bg-white"
                        >
                            <div className="absolute -top-3 -right-3 h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 p-1 rounded-full bg-emerald-100 flex items-center justify-center text-2xl text-emerald-600">
                                {item.icon}
                            </div>

                            <h3 className="text-lg mb-1 sm:text-xl sm:mb-2 md:text-2xl md:mb-3 font-black group-hover:text-emerald-400 transition-colors duration-300 tracking-tight">
                                {item.title}
                            </h3>
                            <p className="text-slate-700 leading-tight text-sm sm:text-md md:text-lg">
                                {item.description}
                            </p>

                            <div className="mt-8 flex items-center text-emerald-500 font-extrabold text-md sm:text-lg md:text-xl tracking-widest uppercase translate-x-0 group-hover:translate-x-4 transition-all duration-300">
                                Explore <FiArrowRight className="ml-2 text-lg" />
                            </div>
                        </Link>
                    </FadeIn>
                ))}
            </div>

        </section>
    );
}