'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { FiArrowLeft, FiFeather } from 'react-icons/fi';
import Link from 'next/link';

export default function CreatePostPage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Route Protection
    useEffect(() => {
        if (!isLoading) {
            if (!user) {
                router.push('/login');
            } else if (user.profile?.isVerified !== true) {
                router.push('/profile');
            }
        }
    }, [user, isLoading, router]);

    if (isLoading || !user || user.profile?.isVerified !== true) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) return;

        setIsSubmitting(true);
        setError('');

        try {
            const res = await fetch('/api/community/post', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: title.trim(),
                    content: content.trim(),
                    authorId: user.$id,
                    authorName: user.profile?.username || user.name
                })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to create post');
            }

            router.push('/community'); 

        } catch (err: any) {
            console.error('Submission error:', err);
            setError(err.message || 'Something went wrong. Please try again.');
            setIsSubmitting(false);
        }
    };

    return (
        <main className="min-h-screen bg-slate-50/50 pt-32 pb-24 px-4">
            <div className="max-w-3xl mx-auto">
                
                <Link href="/community" className="inline-flex items-center gap-2 text-slate-500 hover:text-emerald-600 font-bold mb-8 transition-colors">
                    <FiArrowLeft className="w-4 h-4" />
                    Back to Community
                </Link>

                <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8 sm:p-12">
                    <div className="flex items-center gap-4 mb-8 border-b border-slate-100 pb-8">
                        <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
                            <FiFeather className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Create a Post</h1>
                            <p className="text-slate-500 font-medium">Share your insights with the network.</p>
                        </div>
                    </div>

                    {error && (
                        <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold border border-red-100">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <input
                                type="text"
                                placeholder="Give your post a title..."
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                disabled={isSubmitting}
                                className="w-full text-2xl sm:text-3xl font-black text-slate-900 placeholder:text-slate-300 outline-none border-b-2 border-transparent focus:border-emerald-500 bg-transparent transition-colors py-2"
                                autoFocus
                                maxLength={100}
                            />
                        </div>

                        <div>
                            <textarea
                                placeholder="What's on your mind? (Markdown supported)"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                disabled={isSubmitting}
                                className="w-full min-h-75 text-lg text-slate-700 placeholder:text-slate-400 outline-none resize-y bg-transparent leading-relaxed"
                            />
                        </div>

                        <div className="pt-6 flex items-center justify-between border-t border-slate-100">
                            <p className="text-sm font-medium text-slate-400">
                                Posting as <span className="text-slate-700 font-bold">{user.profile?.username || user.name}</span>
                            </p>
                            
                            <button
                                type="submit"
                                disabled={!title.trim() || !content.trim() || isSubmitting}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow"
                            >
                                {isSubmitting ? 'Publishing...' : 'Publish Post'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </main>
    );
}