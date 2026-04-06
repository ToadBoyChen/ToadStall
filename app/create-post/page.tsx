'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { FiFeather, FiBarChart2, FiX, FiSmile } from 'react-icons/fi';
import dynamic from 'next/dynamic';
import { sanityClient } from '@/lib/sanity';
import PostChartBuilder, { type ChartConfig } from '@/components/community/PostChartBuilder';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';

const MDEditor = dynamic(
    () => import('@uiw/react-md-editor').then((mod) => mod.default),
    { ssr: false, loading: () => <p className="text-slate-400 p-4">Loading editor...</p> }
);

// ── Emoji picker data ──────────────────────────────────────────────────────────
const EMOJI_CATEGORIES = [
    {
        label: 'Smileys',
        emojis: ['😀', '😄', '😂', '😊', '😎', '🧐', '🤔', '😮', '🤯', '💪', '👏', '🙌'],
    },
    {
        label: 'Nature',
        emojis: ['🌍', '🌏', '🌎', '🌊', '🌋', '🔥', '❄️', '🌿', '🌱', '🌺', '🦁', '🦋'],
    },
    {
        label: 'Science & Tech',
        emojis: ['🔬', '🧬', '💡', '⚡', '🔭', '🤖', '🧪', '🧲', '💻', '📡', '🛸', '🔋'],
    },
    {
        label: 'Economy',
        emojis: ['💰', '📈', '📊', '💹', '🏦', '💵', '💎', '⚖️', '🏗️', '🪙', '🛢️', '💳'],
    },
    {
        label: 'Politics & Society',
        emojis: ['🏛️', '🗳️', '🌐', '🤝', '✊', '🕊️', '⚔️', '🛡️', '🎯', '🗺️', '📜', '🔑'],
    },
    {
        label: 'Education & Culture',
        emojis: ['🎓', '📚', '🏥', '🏘️', '👥', '🎗️', '🏆', '🎨', '🎬', '🎵', '✈️', '🚀'],
    },
    {
        label: 'Symbols',
        emojis: ['⭐', '❤️', '🔴', '🟡', '🟢', '🔵', '⚪', '🟠', '🟣', '⚫', '♻️', '🔖'],
    },
];

// Takes any string and returns only the first grapheme cluster (one emoji / letter)
function toSingleGlyph(str: string): string {
    if (!str) return '';
    if (typeof Intl !== 'undefined' && (Intl as any).Segmenter) {
        const segmenter = new (Intl as any).Segmenter();
        const segments = [...segmenter.segment(str)];
        return segments[0]?.segment ?? '';
    }
    return Array.from(str)[0] ?? '';
}

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

    // Chart
    const [showChartBuilder, setShowChartBuilder] = useState(false);
    const chartConfigRef = useRef<ChartConfig | null>(null);
    const handleChartConfigChange = useCallback((config: ChartConfig | null) => {
        chartConfigRef.current = config;
    }, []);

    // Categories
    const [availableCategories, setAvailableCategories] = useState<Category[]>([]);
    const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
    const [showNewCategoryForm, setShowNewCategoryForm] = useState(false);
    const [newCategoryTitle, setNewCategoryTitle] = useState('');
    const [newCategoryIcon, setNewCategoryIcon] = useState('');
    const [isCreatingCategory, setIsCreatingCategory] = useState(false);

    // Emoji picker
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const emojiPickerRef = useRef<HTMLDivElement>(null);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Fetch categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const query = `*[_type == "category"] | order(title asc) { _id, title, icon }`;
                const cats = await sanityClient.fetch(query);
                setAvailableCategories(cats);
            } catch (err) {
                console.error('Failed to fetch categories:', err);
            }
        };
        fetchCategories();
    }, []);

    // Route protection
    useEffect(() => {
        if (!isLoading) {
            if (!user) router.push('/login');
            else if (user.profile?.isVerified !== true) router.push('/profile');
        }
    }, [user, isLoading, router]);

    // Close emoji picker on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target as Node)) {
                setShowEmojiPicker(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    if (isLoading || !user || user.profile?.isVerified !== true) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const handleToggleCategory = (id: string) => {
        setSelectedCategoryIds(prev =>
            prev.includes(id) ? prev.filter(catId => catId !== id) : [...prev, id]
        );
    };

    const handleCreateCategory = async () => {
        if (!newCategoryTitle.trim()) return;
        setIsCreatingCategory(true);
        try {
            const res = await fetch('/api/community/category', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: newCategoryTitle.trim(),
                    icon: toSingleGlyph(newCategoryIcon.trim()),
                }),
            });
            if (!res.ok) throw new Error('Failed to create category');
            const { category } = await res.json();
            setAvailableCategories(prev =>
                [...prev, { _id: category._id, title: category.title, icon: category.icon }]
                    .sort((a, b) => a.title.localeCompare(b.title))
            );
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
                    categoryIds: selectedCategoryIds,
                    chart: showChartBuilder ? chartConfigRef.current : null,
                }),
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
        <main className="min-h-screen pt-28 pb-24 px-4">
            <div className="max-w-3xl mx-auto">

                {/* Page header */}
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
                        <FiFeather className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Create a Post</h1>
                        <p className="text-sm text-slate-500 font-medium">Share your insights with the network.</p>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold border border-red-100">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* ── Title ──────────────────────────────────────────────── */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                        <input
                            type="text"
                            placeholder="Give your post a title…"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            disabled={isSubmitting}
                            className="w-full text-2xl sm:text-3xl font-black text-slate-900 placeholder:text-slate-300 outline-none bg-transparent"
                            autoFocus
                            maxLength={100}
                        />
                        {title.length > 0 && (
                            <p className="text-xs text-slate-400 mt-2 text-right">{title.length}/100</p>
                        )}
                    </div>

                    {/* ── Content ────────────────────────────────────────────── */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="px-5 pt-4 pb-1 border-b border-slate-100">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Content</p>
                        </div>
                        <div data-color-mode="light">
                            <MDEditor
                                value={content}
                                onChange={(val) => setContent(val || '')}
                                preview="live"
                                height={380}
                                textareaProps={{ placeholder: 'What is on your mind? Markdown is supported…' }}
                            />
                        </div>
                    </div>

                    {/* ── Chart ──────────────────────────────────────────────── */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="px-5 py-4 flex items-center justify-between border-b border-slate-100">
                            <div className="flex items-center gap-2">
                                <FiBarChart2 className="w-4 h-4 text-slate-400" />
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Data Chart</p>
                                {showChartBuilder && chartConfigRef.current?.indicator && (
                                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">Added</span>
                                )}
                            </div>
                            {showChartBuilder ? (
                                <button
                                    type="button"
                                    onClick={() => { setShowChartBuilder(false); chartConfigRef.current = null; }}
                                    className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-red-500 transition-colors"
                                >
                                    <FiX className="w-3.5 h-3.5" /> Remove chart
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => setShowChartBuilder(true)}
                                    className="text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
                                >
                                    + Add chart
                                </button>
                            )}
                        </div>

                        {showChartBuilder ? (
                            <div className="p-5 sm:p-6">
                                <PostChartBuilder onConfigChange={handleChartConfigChange} />
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setShowChartBuilder(true)}
                                className="w-full px-5 py-8 flex flex-col items-center gap-2 text-slate-400 hover:bg-slate-50 transition-colors group"
                            >
                                <div className="w-10 h-10 rounded-full bg-slate-100 group-hover:bg-emerald-100 flex items-center justify-center transition-colors">
                                    <FiBarChart2 className="w-5 h-5 group-hover:text-emerald-600 transition-colors" />
                                </div>
                                <span className="text-sm font-semibold group-hover:text-emerald-600 transition-colors">
                                    Embed a live World Bank data chart
                                </span>
                                <span className="text-xs text-slate-400">GDP, population, inflation, CO₂ and more</span>
                            </button>
                        )}
                    </div>

                    {/* ── Categories ─────────────────────────────────────────── */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 sm:p-6">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Topics</p>
                        <div className="flex flex-wrap gap-2">
                            {availableCategories.map((cat) => (
                                <button
                                    key={cat._id}
                                    type="button"
                                    onClick={() => handleToggleCategory(cat._id)}
                                    className={`px-3.5 py-1.5 rounded-full text-sm font-bold transition-all border flex items-center gap-1.5 ${
                                        selectedCategoryIds.includes(cat._id)
                                            ? 'bg-emerald-500 text-white border-emerald-500 hover:bg-emerald-600'
                                            : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-200 hover:bg-emerald-50'
                                    }`}
                                >
                                    {cat.icon && <span>{cat.icon}</span>}
                                    {cat.title}
                                </button>
                            ))}

                            {/* New category form */}
                            {showNewCategoryForm ? (
                                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-full px-3 py-1.5 relative">
                                    {/* Emoji trigger */}
                                    <div className="relative" ref={emojiPickerRef}>
                                        <button
                                            type="button"
                                            onClick={() => setShowEmojiPicker(v => !v)}
                                            className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-slate-200 hover:border-emerald-300 transition-colors text-base"
                                            title="Pick an emoji"
                                        >
                                            {newCategoryIcon || <FiSmile className="w-4 h-4 text-slate-400" />}
                                        </button>

                                        {showEmojiPicker && (
                                            <div className="absolute bottom-full mb-2 left-0 z-50 bg-white rounded-2xl shadow-2xl border border-slate-100 w-72 p-3">
                                                <div className="space-y-3 max-h-64 overflow-y-auto">
                                                    {EMOJI_CATEGORIES.map(cat => (
                                                        <div key={cat.label}>
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 px-1">
                                                                {cat.label}
                                                            </p>
                                                            <div className="grid grid-cols-12 gap-0.5">
                                                                {cat.emojis.map(emoji => (
                                                                    <button
                                                                        key={emoji}
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setNewCategoryIcon(emoji);
                                                                            setShowEmojiPicker(false);
                                                                        }}
                                                                        className="text-lg leading-none p-1 rounded hover:bg-slate-100 transition-colors"
                                                                        title={emoji}
                                                                    >
                                                                        {emoji}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                {/* Custom emoji input */}
                                                <div className="mt-2 pt-2 border-t border-slate-100">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 px-1">Or type one</p>
                                                    <input
                                                        type="text"
                                                        placeholder="Type any emoji or letter…"
                                                        value={newCategoryIcon}
                                                        onChange={(e) => setNewCategoryIcon(toSingleGlyph(e.target.value))}
                                                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm outline-none focus:border-emerald-300"
                                                        maxLength={4}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <input
                                        type="text"
                                        placeholder="Category name"
                                        value={newCategoryTitle}
                                        onChange={(e) => setNewCategoryTitle(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') { e.preventDefault(); handleCreateCategory(); }
                                        }}
                                        className="bg-transparent outline-none text-sm font-bold text-slate-700 placeholder:text-slate-400 w-32"
                                        autoFocus
                                    />
                                    <button
                                        type="button"
                                        onClick={handleCreateCategory}
                                        disabled={!newCategoryTitle.trim() || isCreatingCategory}
                                        className="text-emerald-600 font-bold text-sm hover:text-emerald-700 disabled:opacity-40 transition-colors"
                                    >
                                        {isCreatingCategory ? '…' : 'Add'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowNewCategoryForm(false);
                                            setNewCategoryTitle('');
                                            setNewCategoryIcon('');
                                            setShowEmojiPicker(false);
                                        }}
                                        className="text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        <FiX className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => setShowNewCategoryForm(true)}
                                    className="px-3.5 py-1.5 rounded-full text-sm font-bold border border-dashed border-slate-300 text-slate-400 hover:border-emerald-400 hover:text-emerald-600 transition-all"
                                >
                                    + New topic
                                </button>
                            )}
                        </div>
                    </div>

                    {/* ── Settings ───────────────────────────────────────────── */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 sm:p-6">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Settings</p>
                        <label className="flex items-center gap-4 cursor-pointer group">
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={isOpenDiscussion}
                                    onChange={(e) => setIsOpenDiscussion(e.target.checked)}
                                    disabled={isSubmitting}
                                />
                                <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-700">Open for community discussion</p>
                                <p className="text-xs text-slate-500 mt-0.5">Allow other members to reply and react to this post.</p>
                            </div>
                        </label>
                    </div>

                    {/* ── Footer ─────────────────────────────────────────────── */}
                    <div className="flex items-center justify-between pt-2">
                        <p className="text-sm font-medium text-slate-400">
                            Posting as <span className="text-slate-700 font-bold">{user.profile?.username || user.name}</span>
                        </p>
                        <button
                            type="submit"
                            disabled={!title.trim() || !content.trim() || isSubmitting}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow"
                        >
                            {isSubmitting ? 'Publishing…' : 'Publish Post'}
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
}
