'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { FiFeather } from 'react-icons/fi';
import dynamic from 'next/dynamic';
import { sanityClient } from '@/lib/sanity'; // Adjust path if needed based on your setup
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';

const MDEditor = dynamic(
  () => import('@uiw/react-md-editor').then((mod) => mod.default),
  { ssr: false, loading: () => <p className="text-slate-400 p-4">Loading editor...</p> }
);

interface Category {
    _id: string;
    title: string;
    icon?: string;
}

export default function CreatePostPage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isOpenDiscussion, setIsOpenDiscussion] = useState(false);
    
    const [availableCategories, setAvailableCategories] = useState<Category[]>([]);
    const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
    const [showNewCategoryForm, setShowNewCategoryForm] = useState(false);
    const [newCategoryTitle, setNewCategoryTitle] = useState('');
    const [newCategoryIcon, setNewCategoryIcon] = useState('');
    const [isCreatingCategory, setIsCreatingCategory] = useState(false);
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Fetch Categories from Sanity on load
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const query = `*[_type == "category"] | order(title asc) { _id, title, icon }`;
                const cats = await sanityClient.fetch(query);
                setAvailableCategories(cats);
            } catch (err) {
                console.error("Failed to fetch categories:", err);
            }
        };
        fetchCategories();
    }, []);

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

    const handleToggleCategory = (id: string) => {
        setSelectedCategoryIds(prev =>
            prev.includes(id)
                ? prev.filter(catId => catId !== id)
                : [...prev, id]
        );
    };

    const handleCreateCategory = async () => {
        if (!newCategoryTitle.trim()) return;
        setIsCreatingCategory(true);
        try {
            const res = await fetch('/api/community/category', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: newCategoryTitle.trim(), icon: newCategoryIcon.trim() }),
            });
            if (!res.ok) throw new Error('Failed to create category');
            const { category } = await res.json();
            const newCat: Category = { _id: category._id, title: category.title, icon: category.icon };
            setAvailableCategories(prev => [...prev, newCat].sort((a, b) => a.title.localeCompare(b.title)));
            setSelectedCategoryIds(prev => [...prev, category._id]);
            setNewCategoryTitle('');
            setNewCategoryIcon('');
            setShowNewCategoryForm(false);
        } catch (err) {
            console.error('Failed to create category:', err);
        } finally {
            setIsCreatingCategory(false);
        }
    };

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
                    authorName: user.profile?.username || user.name,
                    status: isOpenDiscussion ? 'open' : undefined,
                    // --- NEW: Send selected categories to the backend ---
                    categoryIds: selectedCategoryIds
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
        <main className="min-h-screen pt-32 pb-24 px-4">
            <div className="max-w-4xl mx-auto">
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

                    <form onSubmit={handleSubmit} className="space-y-8">
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

                        {/* Rich Markdown Editor */}
                        <div data-color-mode="light">
                            <MDEditor
                                value={content}
                                onChange={(val) => setContent(val || '')}
                                preview="live"
                                height={400}
                                textareaProps={{
                                    placeholder: 'What is on your mind? Format with Markdown...'
                                }}
                            />
                        </div>

                        {/* Category Selector */}
                        <div className="space-y-3">
                            <p className="text-sm font-bold text-slate-700 uppercase tracking-widest">Select Topics</p>
                            <div className="flex flex-wrap gap-2">
                                {availableCategories.map((cat) => (
                                    <button
                                        key={cat._id}
                                        type="button"
                                        onClick={() => handleToggleCategory(cat._id)}
                                        className={`px-4 py-2 rounded-full text-sm font-bold transition-all border flex items-center gap-1.5 ${
                                            selectedCategoryIds.includes(cat._id)
                                                ? 'bg-emerald-500 text-white border-emerald-500 hover:bg-emerald-600'
                                                : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-200 hover:bg-emerald-50'
                                        }`}
                                    >
                                        {cat.icon && <span>{cat.icon}</span>}
                                        {cat.title}
                                    </button>
                                ))}

                                {/* New category form or trigger */}
                                {showNewCategoryForm ? (
                                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-full px-3 py-1.5">
                                        <input
                                            type="text"
                                            placeholder="😀"
                                            value={newCategoryIcon}
                                            onChange={(e) => setNewCategoryIcon(e.target.value)}
                                            maxLength={2}
                                            className="w-9 text-center bg-transparent outline-none text-base"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Category name"
                                            value={newCategoryTitle}
                                            onChange={(e) => setNewCategoryTitle(e.target.value)}
                                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleCreateCategory(); } }}
                                            className="bg-transparent outline-none text-sm font-bold text-slate-700 placeholder:text-slate-400 w-32"
                                            autoFocus
                                        />
                                        <button
                                            type="button"
                                            onClick={handleCreateCategory}
                                            disabled={!newCategoryTitle.trim() || isCreatingCategory}
                                            className="text-emerald-600 font-bold text-sm hover:text-emerald-700 disabled:opacity-40"
                                        >
                                            {isCreatingCategory ? '...' : 'Add'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => { setShowNewCategoryForm(false); setNewCategoryTitle(''); setNewCategoryIcon(''); }}
                                            className="text-slate-400 hover:text-slate-600 text-sm font-bold"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => setShowNewCategoryForm(true)}
                                        className="px-4 py-2 rounded-full text-sm font-bold border border-dashed border-slate-300 text-slate-400 hover:border-emerald-400 hover:text-emerald-600 transition-all"
                                    >
                                        + New
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Discussion Toggle */}
                        <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    className="sr-only peer"
                                    checked={isOpenDiscussion}
                                    onChange={(e) => setIsOpenDiscussion(e.target.checked)}
                                    disabled={isSubmitting}
                                />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                            </label>
                            <div>
                                <p className="text-sm font-bold text-slate-700">Open for community discussion</p>
                                <p className="text-xs text-slate-500">Allow other members to reply and interact with this post.</p>
                            </div>
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