'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useTransition, animated } from '@react-spring/web';
import ProfilePfp from '@/components/profile/ProfilePfp';

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

    const menuTransitions = useTransition(isOpen, {
        from: { opacity: 0, transform: 'translateY(-10px) scale(0.95)' },
        enter: { opacity: 1, transform: 'translateY(0px) scale(1)' },
        leave: { opacity: 0, transform: 'translateY(-10px) scale(0.95)' },
        config: { tension: 350, friction: 25 },
    });

    if (isLoading) {
        return <div className="w-8 h-8 rounded-full bg-slate-200 animate-pulse" />;
    }

    if (!user) {
        return (
            <Link
                href="/login"
                className="text-sm font-semibold text-slate-600 hover:text-emerald-600 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
            >
                Sign in
            </Link>
        );
    }

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center p-0.5 rounded-full cursor-pointer hover:ring-2 hover:ring-emerald-200 transition-all"
                aria-label="Account menu"
            >
                <ProfilePfp
                    userId={user.$id}
                    fallbackName={user.name || '?'}
                    className="w-8 h-8 border border-emerald-100 shadow-sm transition-opacity duration-300"
                />
            </button>
            {menuTransitions((style, item) =>
                item ? (
                    <animated.div
                        style={style}
                        className="absolute right-0 mt-3 w-48 bg-white rounded-2xl shadow-xl py-2 border border-slate-100 z-50 origin-top-right"
                    >
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
                    </animated.div>
                ) : null
            )}
        </div>
    );
}