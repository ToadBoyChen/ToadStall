'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { FiSearch } from 'react-icons/fi';

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
            <div className="relative group bg-white/80 py-6 px-16 rounded-full active:scale-98 focus-within:scale-103 focus-within:bg-white transition-all duration-100">
                <FiSearch
                    className="absolute z-10 left-8 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-500 transition-colors group-focus-within:text-emerald-600"
                />
                <input
                    type="text"
                    placeholder="Explore ToadStall"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    className="text-black bg-transparent pl-4 placeholder:text-slate-400 focus:outline-none w-full"
                />
            </div>

            {isOpen && query.length > 0 && (
                <div className="absolute top-full mt-4 w-full bg-white/60 backdrop-blur-2xl rounded-2xl overflow-hidden z-50">

                    {isLoading ? (
                        <div className="px-4 py-6 text-center text-slate-500 text-md font-medium">Searching . . . </div>
                    ) : results.length > 0 ? (
                        <ul className="max-h-80 overflow-y-auto py-2">
                            {results.map((page) => (
                                <li key={page.href}>
                                    <Link
                                        href={page.href}
                                        onClick={handleSelect}
                                        className="block group px-4 py-3 hover:bg-white/90 transition-colors group"
                                    >
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-md md:text-lg lg:text-xl font-extrabold tracking-tighter group-hover:text-emerald-600 transition-colors">
                                                {page.title}
                                            </span>
                                            <span className="text-xs tracking-wide font-semibold uppercase text-slate-800 bg-slate-100 group-hover:bg-slate-900 group-hover:text-white px-4 py-1 rounded-full">
                                                {page.category}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-700 line-clamp-1">
                                            {page.description}
                                        </p>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="px-4 py-12 text-center">
                            <p className="text-md md:text-lg lg:text-xl font-bold">No results found for "{query}"</p>
                            <p className="text-sm text-slate-700 mt-4 mb-2">Try searching for "Migration" or "Data"</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}