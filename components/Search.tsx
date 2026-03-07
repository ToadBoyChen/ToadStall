'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

interface SearchResult {
    title: string;
    href: string;
    category: string;
    description: string;
}

export default function Search() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (query.trim().length < 2) {
            setResults([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);

        const fetchResults = async () => {
            try {
                const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
                const data = await res.json();
                setResults(data);
            } catch (error) {
                console.error("Search failed", error);
            } finally {
                setIsLoading(false);
            }
        };

        const timeoutId = setTimeout(fetchResults, 300);
        return () => clearTimeout(timeoutId);
    }, [query]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = () => {
        setIsOpen(false);
        setQuery('');
    };

    return (
        <div className="relative w-full" ref={searchRef}>
            <div className="relative group bg-white/50 py-6 px-16 rounded-full text-black active:scale-98 transition-all duration-100 focus-within:scale-103">
                <svg
                    className="absolute z-10 left-8 top-1/2 -translate-y-1/2 w-6 h-6"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                    type="text"
                    placeholder="Explore ToadStall"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    className="pl-4 focus:outline-none w-full"
                />
            </div>

            {/* White Dropdown Results */}
            {isOpen && query.length > 0 && (
                <div className="absolute top-full mt-4 w-full bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.15)] z-50">

                    {isLoading ? (
                        <div className="px-4 py-6 text-center text-slate-500 text-sm font-medium">Searching global data...</div>
                    ) : results.length > 0 ? (
                        <ul className="max-h-80 overflow-y-auto py-2">
                            {results.map((page) => (
                                <li key={page.href}>
                                    <Link
                                        href={page.href}
                                        onClick={handleSelect}
                                        // Light gray hover effect
                                        className="block px-4 py-3 hover:bg-slate-50 border-b border-slate-50 last:border-0 transition-colors group"
                                    >
                                        <div className="flex justify-between items-center mb-1">
                                            {/* Dark text that turns green on hover */}
                                            <span className="text-sm font-black text-slate-900 group-hover:text-emerald-600 transition-colors">
                                                {page.title}
                                            </span>
                                            {/* Light pill background */}
                                            <span className="text-[10px] uppercase tracking-widest font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                                                {page.category}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 line-clamp-1 font-medium">
                                            {page.description}
                                        </p>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="px-4 py-6 text-center">
                            <p className="text-sm text-slate-900 font-bold">No results found for "{query}"</p>
                            <p className="text-xs text-slate-500 mt-1">Try searching for "Migration" or "Data"</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}