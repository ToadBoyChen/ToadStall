'use client';

import { useEffect, useState } from 'react';
import { databases, appwriteDatabaseId } from '@/lib/appwrite';
import { Query } from 'appwrite';

const avatarCache = new Map<string, string | null>();
const pendingRequests = new Map<string, Promise<string | null>>();

interface ProfilePfpProps {
    userId: string;
    fallbackName?: string;
    className?: string;
}

export default function ProfilePfp({ userId, fallbackName = '?', className = "w-10 h-10" }: ProfilePfpProps) {
    const [avatarUrl, setAvatarUrl] = useState<string | null>(avatarCache.get(userId) || null);
    const [isLoading, setIsLoading] = useState(!avatarCache.has(userId));

    useEffect(() => {
        if (!userId) return;

        if (avatarCache.has(userId)) {
            setAvatarUrl(avatarCache.get(userId) || null);
            setIsLoading(false);
            return;
        }

        const fetchAvatar = async () => {
            try {
                if (pendingRequests.has(userId)) {
                    const url = await pendingRequests.get(userId);
                    setAvatarUrl(url || null);
                    setIsLoading(false);
                    return;
                }

                const requestPromise = databases.listDocuments(
                    appwriteDatabaseId,
                    process.env.NEXT_PUBLIC_APPWRITE_PROFILES_COLLECTION_ID as string,
                    [Query.equal('userID', userId), Query.limit(1)]
                ).then(res => {
                    const url = res.documents.length > 0 ? res.documents[0].avatarURL : null;
                    avatarCache.set(userId, url);
                    return url;
                });

                pendingRequests.set(userId, requestPromise);

                const url = await requestPromise;
                setAvatarUrl(url || null);
            } catch (error) {
                console.error('Failed to fetch avatar for user:', userId, error);
                avatarCache.set(userId, null);
            } finally {
                setIsLoading(false);
                pendingRequests.delete(userId);
            }
        };

        fetchAvatar();
    }, [userId]);

    const initial = fallbackName.charAt(0).toUpperCase();

    return (
        <div className={`bg-emerald-100 text-emerald-700 font-bold rounded-full flex items-center justify-center shrink-0 overflow-hidden ${className}`}>
            {isLoading ? (
                <div className="w-full h-full animate-pulse bg-emerald-200" />
            ) : avatarUrl ? (
                <img src={avatarUrl} alt={`${fallbackName}'s avatar`} className="w-full h-full object-cover" />
            ) : (
                initial
            )}
        </div>
    );
}