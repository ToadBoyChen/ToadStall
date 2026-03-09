'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { databases, appwriteDatabaseId } from '@/lib/appwrite';
import { Query } from 'appwrite';

export default function ProfilePage() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();

    const [profile, setProfile] = useState<any>(null);
    const [stats, setStats] = useState({ comments: 0, votes: 0 });
    const [isFetchingData, setIsFetchingData] = useState(true);

    useEffect(() => {
        // If auth finishes loading and there is no user, boot them to login
        if (!authLoading && !user) {
            router.push('/login');
            return;
        }

        // If we have a user, fetch their database info
        if (user) {
            fetchUserData(user.$id);
        }
    }, [user, authLoading, router]);

    const fetchUserData = async (userId: string) => {
        try {
            // 1. Fetch the public profile (for bio and avatar)
            const profileRes = await databases.listDocuments(
                appwriteDatabaseId,
                process.env.NEXT_PUBLIC_APPWRITE_PROFILES_COLLECTION_ID as string,
                [Query.equal('userID', userId), Query.limit(1)]
            );

            if (profileRes.documents.length > 0) {
                setProfile(profileRes.documents[0]);
            }

            // 2. Fetch Comment Count
            const commentsRes = await databases.listDocuments(
                appwriteDatabaseId,
                process.env.NEXT_PUBLIC_APPWRITE_COMMENTS_COLLECTION_ID as string,
                [Query.equal('userId', userId), Query.limit(1)] // We just need the 'total' property from the response
            );

            // 3. Fetch Vote Count
            const votesRes = await databases.listDocuments(
                appwriteDatabaseId,
                process.env.NEXT_PUBLIC_APPWRITE_VOTES_COLLECTION_ID as string,
                [Query.equal('userId', userId), Query.limit(1)]
            );

            setStats({
                comments: commentsRes.total,
                votes: votesRes.total,
            });

        } catch (error) {
            console.error('Error fetching profile data:', error);
        } finally {
            setIsFetchingData(false);
        }
    };

    if (authLoading || isFetchingData) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!user) return null; // Prevent flash of content before redirect

    const joinDate = new Date(user.$createdAt).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
    });

    const initial = user.name ? user.name.charAt(0).toUpperCase() : '?';

    return (
        <main className="max-w-4xl mx-auto w-full px-4 py-12 min-h-screen">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                
                {/* Header Section */}
                <div className="bg-emerald-900 px-8 py-12 text-center md:text-left flex flex-col md:flex-row items-center gap-6">
                    <div className="w-24 h-24 bg-emerald-500 text-white text-4xl font-black rounded-full flex items-center justify-center border-4 border-white shadow-lg shrink-0">
                        {profile?.avatarURL ? (
                            <img src={profile.avatarURL} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                        ) : (
                            initial
                        )}
                    </div>
                    <div className="text-white">
                        <h1 className="text-3xl font-black tracking-tight">{user.name}</h1>
                        <p className="text-emerald-200/80 font-medium mt-1">Joined {joinDate}</p>
                    </div>
                </div>

                {/* Content Section */}
                <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                    
                    {/* Left Column: Bio */}
                    <div className="md:col-span-2 space-y-6">
                        <div>
                            <h2 className="text-sm font-bold tracking-widest uppercase text-slate-400 mb-3">About Me</h2>
                            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                                {profile?.bio ? (
                                    <p className="text-slate-700 leading-relaxed font-medium">
                                        {profile.bio}
                                    </p>
                                ) : (
                                    <p className="text-slate-400 italic font-medium">
                                        This user hasn't written a bio yet.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Stats */}
                    <div className="space-y-4">
                        <h2 className="text-sm font-bold tracking-widest uppercase text-slate-400 mb-3">Community Stats</h2>
                        
                        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 flex items-center justify-between">
                            <span className="font-bold text-slate-600">Discussions</span>
                            <span className="bg-emerald-100 text-emerald-700 font-black px-3 py-1 rounded-lg">
                                {stats.comments}
                            </span>
                        </div>

                        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 flex items-center justify-between">
                            <span className="font-bold text-slate-600">Votes Cast</span>
                            <span className="bg-emerald-100 text-emerald-700 font-black px-3 py-1 rounded-lg">
                                {stats.votes}
                            </span>
                        </div>
                    </div>

                </div>
            </div>
        </main>
    );
}