'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';
import { useTransition, animated } from '@react-spring/web';

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
        return <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-slate-200 animate-pulse"></div>;
    }

    if (!user) {
        return (
            <Link
                href="/login"
                className="text-sm md:text-lg font-bold text-slate-700 hover:text-emerald-500 rounded-full flex items-center gap-3 p-1 pr-4 transition-all "
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
                className="flex items-center gap-8 pr-0 sm:pr-2 md:pr-4 transition-all p-1"
            >
                <p className="opacity-0 sm:opacity-100 text-sm md:text-lg font-bold text-slate-700 max-w-25 truncate">
                    {user.name}
                </p>
                <div className="w-12 h-12 md:w-14 md:h-14 flex items-center justify-center bg-emerald-500 text-white font-bold rounded-full overflow-hidden shrink-0 border-2 border-emerald-100">
                    {avatarUrl ? (
                        <Image
                            src={avatarUrl}
                            alt={`${user.name}'s profile picture`}
                            width={80}
                            height={80}
                            priority
                            className="object-cover w-full h-full transition-opacity duration-300"
                            onLoadingComplete={(img) => img.classList.remove("opacity-0")}
                        />
                    ) : (
                        initial
                    )}
                </div>
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