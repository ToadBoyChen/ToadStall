'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function UserMenu() {
    const { user, isLoading, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (isLoading) {
        return <div className="w-10 h-10 rounded-full bg-slate-200 animate-pulse"></div>;
    }

    if (!user) {
        return (
            <Link 
                href="/login" 
                className="text-md font-bold hover:text-emerald-500 rounded-full flex items-center gap-3 p-1 pr-4 transition-all"
            >
                Sign In
            </Link>
        );
    }

    const initial = user.name ? user.name.charAt(0).toUpperCase() : '?';
    
    const avatarUrl = (user as any).profile?.avatarURL || null;

    return (
        <div className="relative" ref={menuRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 p-1 pr-4 transition-all"
            >
                <div className="w-9 h-9 flex items-center justify-center bg-emerald-500 text-white font-bold rounded-full overflow-hidden shrink-0">
                    {avatarUrl ? (
                        <img 
                            src={avatarUrl} 
                            alt={`${user.name}'s avatar`} 
                            className="w-full h-full object-cover" 
                        />
                    ) : (
                        initial
                    )}
                </div>
                <span className="text-sm font-bold text-slate-700 max-w-25 truncate">
                    {user.name}
                </span>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-3 w-48 bg-white rounded-2xl shadow-xl py-2 border border-slate-100 z-50">
                    <div className="px-4 py-2 border-b border-slate-100 mb-2">
                        <p className="text-xs text-slate-500 font-medium">Signed in as</p>
                        <p className="text-sm font-bold text-slate-800 truncate">{user.email}</p>
                    </div>
                    
                    <Link 
                        href="/profile" 
                        onClick={() => setIsOpen(false)}
                        className="block px-4 py-2 text-sm text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 font-medium transition-colors"
                    >
                        My Profile
                    </Link>
                    
                    <button 
                        onClick={() => {
                            logout();
                            setIsOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium transition-colors"
                    >
                        Log Out
                    </button>
                </div>
            )}
        </div>
    );
}