'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { FiEdit3, FiLock } from 'react-icons/fi';

interface CreatePostButtonProps {
    variant?: 'solid' | 'outline' | 'ghost';
    className?: string;
}

export default function CreatePostButton({ variant = 'solid', className = '' }: CreatePostButtonProps) {
    const { user, isLoading } = useAuth();
    
    if (isLoading) return <div className="w-24 h-10 animate-pulse bg-slate-100 rounded-full" />;

    const isVerified = user?.profile?.isVerified === true;

    // Base styles for the button
    const baseStyles = "inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed";
    
    // Variant styles
    const variants = {
        solid: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:shadow",
        outline: "border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50",
        ghost: "text-emerald-700 hover:bg-emerald-50"
    };

    if (!user) {
        return null; // Hide completely if not logged in
    }

    if (!isVerified) {
        return (
            <Link 
                href="/profile"
                className={`${baseStyles} bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 ${className}`}
                title="Verify your email to create posts"
            >
                <FiLock className="w-4 h-4" />
                <span>Verify to Post</span>
            </Link>
        );
    }

    return (
        <Link 
            href="/create-post"
            className={`${baseStyles} ${variants[variant]} ${className}`}
        >
            <FiEdit3 className="w-4 h-4" />
            <span>Create Post</span>
        </Link>
    );
}