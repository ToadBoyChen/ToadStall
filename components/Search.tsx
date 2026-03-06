'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

// Define the shape of our API response
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
    const [isLoading, setIsLoading] = useState(false); // To show a loading state
    const searchRef = useRef<HTMLDivElement>(null);

    // Debounced API Fetch
    useEffect(() => {
        // Don't search if the query is too short
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

        // Wait 300ms after the user stops typing to fire the request
        const timeoutId = setTimeout(fetchResults, 300); 
        return () => clearTimeout(timeoutId);
    }, [query]);

    // Close on outside click
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
        <div className="relative w-full max-w-sm" ref={searchRef}>
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

            {isOpen && query.length > 0 && (
                <div className="absolute top-full mt-2 w-full bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden shadow-2xl z-50">
                    
                    {isLoading ? (
                        <div className="px-4 py-6 text-center text-slate-400 text-sm">Searching global data...</div>
                    ) : results.length > 0 ? (
                        <ul className="max-h-80 overflow-y-auto py-2">
                            {results.map((page) => (
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
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}