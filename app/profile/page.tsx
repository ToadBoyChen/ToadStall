'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { databases, storage, appwriteDatabaseId, appwritePfpsBucketId } from '@/lib/appwrite';
import { Query, ID } from 'appwrite';

export default function ProfilePage() {
    const { user, isLoading: authLoading, checkUser } = useAuth();
    const router = useRouter();

    const [profile, setProfile] = useState<any>(null);
    const [stats, setStats] = useState({ comments: 0, votes: 0 });
    const [isFetchingData, setIsFetchingData] = useState(true);

    // Editing State
    const [isEditing, setIsEditing] = useState(false);
    const [editBio, setEditBio] = useState('');
    const [editFile, setEditFile] = useState<File | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
            return;
        }

        if (user) {
            fetchUserData(user.$id);
        }
    }, [user, authLoading, router]);

    const fetchUserData = async (userId: string) => {
        try {
            const profileRes = await databases.listDocuments(
                appwriteDatabaseId,
                process.env.NEXT_PUBLIC_APPWRITE_PROFILES_COLLECTION_ID as string,
                [Query.equal('userID', userId), Query.limit(1)]
            );

            if (profileRes.documents.length > 0) {
                const fetchedProfile = profileRes.documents[0] as any;
                setProfile(fetchedProfile);
                setEditBio(fetchedProfile.bio || '');
            }

            const commentsRes = await databases.listDocuments(
                appwriteDatabaseId,
                process.env.NEXT_PUBLIC_APPWRITE_COMMENTS_COLLECTION_ID as string,
                [Query.equal('userId', userId), Query.limit(1)] 
            );

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

    const handleSaveProfile = async () => {
        if (!profile) return;
        setIsSaving(true);

        try {
            let newAvatarUrl = profile.avatarURL;

            // 1. Upload new image if selected
            if (editFile) {
                const uploadedFile = await storage.createFile(
                    appwritePfpsBucketId,
                    ID.unique(),
                    editFile
                );
                newAvatarUrl = storage.getFileView(appwritePfpsBucketId, uploadedFile.$id);
            }

            // 2. Update Profile Document
            const updatedProfile = await databases.updateDocument(
                appwriteDatabaseId,
                process.env.NEXT_PUBLIC_APPWRITE_PROFILES_COLLECTION_ID as string,
                profile.$id, // The document ID
                {
                    bio: editBio,
                    avatarURL: newAvatarUrl
                }
            );

            setProfile(updatedProfile);
            setEditFile(null);
            setIsEditing(false);
            
            // Re-sync global user context if you want the nav avatar to update instantly
            await checkUser(); 

        } catch (error) {
            console.error('Failed to update profile:', error);
        } finally {
            setIsSaving(false);
        }
    };

    if (authLoading || isFetchingData) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!user) return null;

    const joinDate = new Date(user.$createdAt).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
    });

    const initial = user.name ? user.name.charAt(0).toUpperCase() : '?';
    // Use local file preview if editing, otherwise database URL, otherwise null
    const displayAvatar = editFile ? URL.createObjectURL(editFile) : profile?.avatarURL;

    return (
        <main className="max-w-4xl mx-auto w-full px-4 py-12 min-h-screen">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                
                {/* Header Section */}
                <div className="bg-emerald-900 px-8 py-12 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="relative group">
                            <div className="w-24 h-24 bg-emerald-500 text-white text-4xl font-black rounded-full flex items-center justify-center border-4 border-white shadow-lg shrink-0 overflow-hidden">
                                {displayAvatar ? (
                                    <img src={displayAvatar} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    initial
                                )}
                            </div>
                            
                            {/* Hidden file input */}
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                onChange={(e) => setEditFile(e.target.files?.[0] || null)}
                                accept="image/png, image/jpeg, image/webp" 
                                className="hidden" 
                            />
                            
                            {isEditing && (
                                <button 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute inset-0 bg-black/50 text-white text-xs font-bold flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    Change
                                </button>
                            )}
                        </div>

                        <div className="text-white">
                            <h1 className="text-3xl font-black tracking-tight">{user.name}</h1>
                            <p className="text-emerald-200/80 font-medium mt-1">Joined {joinDate}</p>
                        </div>
                    </div>

                    {!isEditing ? (
                        <button 
                            onClick={() => setIsEditing(true)}
                            className="bg-white/10 hover:bg-white/20 text-white px-5 py-2 rounded-full font-bold transition-colors border border-white/20"
                        >
                            Edit Profile
                        </button>
                    ) : (
                        <div className="flex gap-3">
                            <button 
                                onClick={() => { setIsEditing(false); setEditFile(null); setEditBio(profile?.bio || ''); }}
                                className="bg-white/10 hover:bg-white/20 text-white px-5 py-2 rounded-full font-bold transition-colors border border-white/20"
                                disabled={isSaving}
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleSaveProfile}
                                disabled={isSaving}
                                className="bg-emerald-500 hover:bg-emerald-400 text-white px-5 py-2 rounded-full font-bold transition-colors shadow-lg disabled:opacity-50"
                            >
                                {isSaving ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    )}
                </div>

                {/* Content Section */}
                <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                    
                    {/* Left Column: Bio */}
                    <div className="md:col-span-2 space-y-6">
                        <div>
                            <h2 className="text-sm font-bold tracking-widest uppercase text-slate-400 mb-3">About Me</h2>
                            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 min-h-30">
                                {isEditing ? (
                                    <textarea 
                                        value={editBio}
                                        onChange={(e) => setEditBio(e.target.value)}
                                        placeholder="Tell the community about yourself..."
                                        className="w-full bg-white border border-slate-200 rounded-xl p-3 text-slate-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                        rows={4}
                                    />
                                ) : profile?.bio ? (
                                    <p className="text-slate-700 leading-relaxed font-medium whitespace-pre-wrap">
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