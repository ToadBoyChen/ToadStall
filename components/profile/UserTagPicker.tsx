'use client';

import { useState, useEffect, useRef } from 'react';
import { databases, appwriteDatabaseId } from '@/lib/appwrite';
import { ID, Query } from 'appwrite';
import { FiSearch, FiX, FiPlus, FiCheck, FiChevronDown } from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';
import UserTagBadge, { TAG_COLORS, TagColor, UserTag } from './UserTagBadge';

interface UserTagPickerProps {
    selectedTag: UserTag | null;
    onSelect: (tag: UserTag | null) => void;
}

const COLLECTION = process.env.NEXT_PUBLIC_APPWRITE_USER_TAGS_COLLECTION_ID as string;

export default function UserTagPicker({ selectedTag, onSelect }: UserTagPickerProps) {
    const { user } = useAuth();

    const [isOpen, setIsOpen] = useState(false);
    const [tags, setTags] = useState<UserTag[]>([]);
    const [search, setSearch] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [isCreating, setIsCreating] = useState(false);
    const [newLabel, setNewLabel] = useState('');
    const [newEmoji, setNewEmoji] = useState('');
    const [newColor, setNewColor] = useState<TagColor>('slate');
    const [isSaving, setIsSaving] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);

    // Fetch tags when picker opens
    useEffect(() => {
        if (!isOpen || tags.length > 0) return;
        setIsLoading(true);
        databases
            .listDocuments(appwriteDatabaseId, COLLECTION, [Query.orderAsc('label'), Query.limit(200)])
            .then(res => setTags(res.documents as unknown as UserTag[]))
            .catch(console.error)
            .finally(() => setIsLoading(false));
    }, [isOpen, tags.length]);

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const filtered = tags.filter(t =>
        t.label.toLowerCase().includes(search.toLowerCase())
    );

    const handleCreate = async () => {
        if (!newLabel.trim() || !user) return;
        setIsSaving(true);
        try {
            const doc = await databases.createDocument(appwriteDatabaseId, COLLECTION, ID.unique(), {
                label: newLabel.trim(),
                emoji: newEmoji.trim(),
                color: newColor,
                createdByUserId: user.$id,
            });
            const created = doc as unknown as UserTag;
            setTags(prev => [...prev, created].sort((a, b) => a.label.localeCompare(b.label)));
            onSelect(created);
            setIsOpen(false);
            resetCreate();
        } catch (e) {
            console.error('Failed to create tag:', e);
        } finally {
            setIsSaving(false);
        }
    };

    const resetCreate = () => {
        setIsCreating(false);
        setNewLabel('');
        setNewEmoji('');
        setNewColor('slate');
    };

    return (
        <div className="relative" ref={containerRef}>
            {/* Trigger button */}
            <button
                type="button"
                onClick={() => setIsOpen(v => !v)}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-slate-200 bg-white hover:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors text-sm"
            >
                {selectedTag ? (
                    <UserTagBadge label={selectedTag.label} emoji={selectedTag.emoji} color={selectedTag.color} size="md" />
                ) : (
                    <span className="text-slate-400">Select or create a tag…</span>
                )}
                <div className="flex items-center gap-1 shrink-0">
                    {selectedTag && (
                        <span
                            role="button"
                            onClick={e => { e.stopPropagation(); onSelect(null); }}
                            className="p-0.5 rounded text-slate-400 hover:text-slate-700 transition-colors"
                        >
                            <FiX className="w-3.5 h-3.5" />
                        </span>
                    )}
                    <FiChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </div>
            </button>

            {/* Dropdown panel */}
            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-200 shadow-2xl z-50 overflow-hidden">
                    {/* Search */}
                    <div className="p-3 border-b border-slate-100">
                        <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl border border-slate-200">
                            <FiSearch className="w-4 h-4 text-slate-400 shrink-0" />
                            <input
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search tags…"
                                autoFocus
                                className="flex-1 bg-transparent text-sm outline-none text-slate-800 placeholder:text-slate-400"
                            />
                            {search && (
                                <button onClick={() => setSearch('')} className="text-slate-400 hover:text-slate-600">
                                    <FiX className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Existing tags */}
                    <div className="max-h-48 overflow-y-auto p-3">
                        {isLoading ? (
                            <p className="text-xs text-slate-400 text-center py-6">Loading tags…</p>
                        ) : filtered.length === 0 ? (
                            <p className="text-xs text-slate-400 text-center py-6">
                                {search ? `No tags matching "${search}"` : 'No tags yet — create one below.'}
                            </p>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {filtered.map(tag => (
                                    <button
                                        key={tag.$id}
                                        type="button"
                                        onClick={() => { onSelect(tag); setIsOpen(false); setSearch(''); }}
                                        className="flex items-center gap-1 hover:opacity-80 transition-opacity"
                                    >
                                        <UserTagBadge label={tag.label} emoji={tag.emoji} color={tag.color} />
                                        {selectedTag?.$id === tag.$id && (
                                            <FiCheck className="w-3 h-3 text-emerald-500 -ml-0.5" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Create new */}
                    <div className="border-t border-slate-100 p-3">
                        {!isCreating ? (
                            <button
                                type="button"
                                onClick={() => setIsCreating(true)}
                                className="flex items-center gap-2 text-sm font-semibold text-emerald-600 hover:text-emerald-700 px-2 py-1.5 rounded-lg hover:bg-emerald-50 transition-colors w-full"
                            >
                                <FiPlus className="w-4 h-4" />
                                Create new tag
                            </button>
                        ) : (
                            <div className="flex flex-col gap-3">
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">New tag</p>

                                {/* Emoji + label */}
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newEmoji}
                                        onChange={e => setNewEmoji(e.target.value)}
                                        placeholder="🏷️"
                                        maxLength={4}
                                        className="w-14 text-center border border-slate-200 rounded-lg px-2 py-2 text-lg outline-none focus:ring-2 focus:ring-emerald-500"
                                    />
                                    <input
                                        type="text"
                                        value={newLabel}
                                        onChange={e => setNewLabel(e.target.value)}
                                        placeholder="e.g. UK Labour, Centre Left"
                                        maxLength={60}
                                        className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>

                                {/* Color swatches */}
                                <div>
                                    <p className="text-[11px] text-slate-400 mb-1.5">Colour</p>
                                    <div className="flex flex-wrap gap-2">
                                        {(Object.entries(TAG_COLORS) as [TagColor, typeof TAG_COLORS[TagColor]][]).map(([key, val]) => (
                                            <button
                                                key={key}
                                                type="button"
                                                title={val.label}
                                                onClick={() => setNewColor(key)}
                                                className={`w-7 h-7 rounded-full transition-all hover:scale-110 ${
                                                    newColor === key
                                                        ? 'ring-2 ring-offset-2 ring-slate-700 scale-110'
                                                        : 'ring-1 ring-white'
                                                }`}
                                                style={{ backgroundColor: val.swatch }}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Live preview */}
                                {newLabel.trim() && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-[11px] text-slate-400">Preview:</span>
                                        <UserTagBadge label={newLabel} emoji={newEmoji} color={newColor} />
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={resetCreate}
                                        className="flex-1 text-xs font-semibold text-slate-500 hover:text-slate-700 py-2 rounded-lg hover:bg-slate-100 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleCreate}
                                        disabled={!newLabel.trim() || isSaving}
                                        className="flex-1 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSaving ? 'Creating…' : 'Create & select'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
