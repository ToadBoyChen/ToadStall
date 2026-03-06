'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

// 1. Define your site's pages (Think of this as your search database)
const SITE_PAGES = [
    { title: 'Migration Flows', href: '/trackers/migration', category: 'Tracker', description: 'Real-time humanitarian data and border crossings.' },
    { title: 'Climate Anomalies', href: '/trackers/climate', category: 'Tracker', description: 'Global temperature shifts and weather events.' },
    { title: 'Food Security', href: '/trackers/food-security', category: 'Tracker', description: 'Caloric deficits and supply chain mapping.' },
    { title: 'Methodology', href: '/methodology', category: 'Resource', description: 'How we source and process HDX HAPI data.' },
    { title: 'API Documentation', href: '/api', category: 'Resource', description: 'Access our datasets programmatically.' },
];

export default function Search() {
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    // 2. Filter the pages based on user input
    const filteredPages = SITE_PAGES.filter(page => 
        page.title.toLowerCase().includes(query.toLowerCase()) || 
        page.description.toLowerCase().includes(query.toLowerCase())
    );

    // 3. Close the dropdown if the user clicks outside of the search bar
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // 4. Handle navigation (closes the dropdown and clears the search)
    const handleSelect = () => {
        setIsOpen(false);
        setQuery('');
    };

    return (
        <div className="relative w-full max-w-sm" ref={searchRef}>
            {/* Search Input */}
            <div className="relative group">
                <svg 
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-400 transition-colors" 
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                    type="text"
                    placeholder="Search trackers, data, articles..."
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-900/50 border border-slate-700/50 rounded-full text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:border-emerald-500/50 focus:bg-slate-900/80 focus:ring-1 focus:ring-emerald-500/50 transition-all backdrop-blur-md shadow-inner"
                />
            </div>

            {/* Dropdown Results */}
            {isOpen && query.length > 0 && (
                <div className="absolute top-full mt-2 w-full bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden shadow-2xl z-50">
                    {filteredPages.length > 0 ? (
                        <ul className="max-h-80 overflow-y-auto py-2">
                            {filteredPages.map((page) => (
                                <li key={page.href}>
                                    <Link 
                                        href={page.href}
                                        onClick={handleSelect}
                                        className="block px-4 py-3 hover:bg-slate-800/50 transition-colors group"
                                    >
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-sm font-bold text-slate-200 group-hover:text-emerald-400 transition-colors">
                                                {page.title}
                                            </span>
                                            <span className="text-[10px] uppercase tracking-widest font-bold text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">
                                                {page.category}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-400 line-clamp-1">
                                            {page.description}
                                        </p>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="px-4 py-6 text-center">
                            <p className="text-sm text-slate-400 font-medium">No results found for "{query}"</p>
                            <p className="text-xs text-slate-500 mt-1">Try searching for "Migration" or "Data"</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}