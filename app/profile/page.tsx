'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { databases, storage, appwriteDatabaseId, appwritePfpsBucketId, account } from '@/lib/appwrite';
import { Query, ID } from 'appwrite';
import CommentItem from '@/components/comments/CommentItem';
import VerificationBadge from '@/components/verification/VerificationBadge';
import { FiAlertCircle, FiCheckCircle } from 'react-icons/fi';

export default function ProfilePage() {
    const { user, isLoading: authLoading, checkUser } = useAuth();
    const router = useRouter();

    const [profile, setProfile] = useState<any>(null);
    const [stats, setStats] = useState({ comments: 0, votes: 0 });
    const [userComments, setUserComments] = useState<any[]>([]);
    const [isFetchingData, setIsFetchingData] = useState(true);

    const [isEditing, setIsEditing] = useState(false);
    const [editBio, setEditBio] = useState('');
    const [editFile, setEditFile] = useState<File | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Verification States
    const [isSendingVerification, setIsSendingVerification] = useState(false);
    const [verificationStatus, setVerificationStatus] = useState<'idle' | 'success' | 'error'>('idle');

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

                // Sync Auth status with Database status
                if (user?.emailVerification && !fetchedProfile.isVerified) {
                    const updated = await databases.updateDocument(
                        appwriteDatabaseId,
                        process.env.NEXT_PUBLIC_APPWRITE_PROFILES_COLLECTION_ID as string,
                        fetchedProfile.$id,
                        { isVerified: true }
                    );
                    setProfile(updated);
                } else {
                    setProfile(fetchedProfile);
                }

                setEditBio(fetchedProfile.bio || '');
            }

            const commentsRes = await databases.listDocuments(
                appwriteDatabaseId,
                process.env.NEXT_PUBLIC_APPWRITE_COMMENTS_COLLECTION_ID as string,
                [
                    Query.equal('userId', userId),
                    Query.orderDesc('$createdAt'),
                    Query.limit(5)
                ]
            );
            setUserComments(commentsRes.documents);

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
            if (editFile) {
                const uploadedFile = await storage.createFile(appwritePfpsBucketId, ID.unique(), editFile);
                newAvatarUrl = storage.getFileView(appwritePfpsBucketId, uploadedFile.$id);
            }
            const updatedProfile = await databases.updateDocument(
                appwriteDatabaseId,
                process.env.NEXT_PUBLIC_APPWRITE_PROFILES_COLLECTION_ID as string,
                profile.$id,
                { bio: editBio, avatarURL: newAvatarUrl }
            );
            setProfile(updatedProfile);
            setEditFile(null);
            setIsEditing(false);
            await checkUser();
        } catch (error) {
            console.error('Failed to update profile:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleSendVerification = async () => {
        setIsSendingVerification(true);
        setVerificationStatus('idle');
        try {
            await account.createVerification(`${window.location.origin}/verify-email`);
            setVerificationStatus('success');
        } catch (error) {
            console.error('Failed to send verification email:', error);
            setVerificationStatus('error');
        } finally {
            setIsSendingVerification(false);
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

    const displayAvatar = editFile ? URL.createObjectURL(editFile) : profile?.avatarURL;
    const initial = user.name ? user.name.charAt(0).toUpperCase() : '?';

    return (
        <main className="max-w-4xl mx-auto w-full px-4 py-12 min-h-screen">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden mb-8">
                
                {/* Profile Header */}
                <div className="bg-emerald-900 px-8 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="relative group">
                            <div className='flex flex-col items-center'>
                                <div className="w-24 h-24 bg-emerald-500 text-white text-4xl font-black rounded-full flex items-center justify-center border-4 border-white shadow-lg overflow-hidden shrink-0 mb-4">
                                    {displayAvatar ? <img src={displayAvatar} alt="Avatar" className="w-full h-full object-cover" /> : initial}
                                </div>
                                <VerificationBadge isVerified={profile?.isVerified} />
                            </div>
                            <input type="file" ref={fileInputRef} onChange={(e) => setEditFile(e.target.files?.[0] || null)} className="hidden" accept="image/*" />
                            {isEditing && (
                                <button onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-black/50 text-white text-xs font-bold flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                    Change
                                </button>
                            )}
                        </div>
                        <div className="text-white text-center md:text-left">
                            <div className="flex items-center justify-center md:justify-start gap-3">
                                <h1 className="text-3xl font-black tracking-tight">
                                    {user.name}
                                </h1>
                            </div>
                            <p className="text-emerald-200/80 font-medium mt-1">Community Member</p>
                        </div>
                    </div>

                    {!isEditing ? (
                        <button onClick={() => setIsEditing(true)} className="bg-white/10 hover:bg-white/20 text-white px-5 py-2 rounded-full font-bold border border-white/20 transition-colors">Edit Profile</button>
                    ) : (
                        <div className="flex gap-3">
                            <button onClick={() => { setIsEditing(false); setEditFile(null); }} className="text-white font-bold px-4">Cancel</button>
                            <button onClick={handleSaveProfile} disabled={isSaving} className="bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-2 rounded-full font-bold transition-colors">{isSaving ? 'Saving...' : 'Save'}</button>
                        </div>
                    )}
                </div>

                {/* Unverified Banner */}
                {!profile?.isVerified && (
                    <div className="bg-amber-50/80 border-b border-amber-100 px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3 text-amber-800">
                            <FiAlertCircle className="w-5 h-5 shrink-0" />
                            <p className="text-sm font-medium">
                                Your account is unverified. Please verify your email to unlock all features.
                            </p>
                        </div>
                        
                        <button 
                            onClick={handleSendVerification}
                            disabled={isSendingVerification || verificationStatus === 'success'}
                            className={`shrink-0 px-4 py-2 rounded-full text-sm font-bold transition-colors flex items-center gap-2
                                ${verificationStatus === 'success' 
                                    ? 'bg-emerald-100 text-emerald-700 cursor-default' 
                                    : 'bg-amber-200 hover:bg-amber-300 text-amber-900'
                                }`}
                        >
                            {isSendingVerification ? (
                                'Sending...'
                            ) : verificationStatus === 'success' ? (
                                <>
                                    <FiCheckCircle className="w-4 h-4" /> Email Sent!
                                </>
                            ) : (
                                'Send Verification Email'
                            )}
                        </button>
                    </div>
                )}
                
                {verificationStatus === 'error' && (
                    <div className="bg-red-50 text-red-600 text-xs font-bold text-center py-2">
                        Failed to send verification email. Please try again later.
                    </div>
                )}

                {/* Content Grid */}
                <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2">
                        <h2 className="text-sm font-bold tracking-widest uppercase text-slate-400 mb-3">About Me</h2>
                        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                            {isEditing ? (
                                <textarea value={editBio} onChange={(e) => setEditBio(e.target.value)} className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none" rows={4} />
                            ) : (
                                <p className="text-slate-700 font-medium whitespace-pre-wrap">{profile?.bio || "No bio yet."}</p>
                            )}
                        </div>
                    </div>
                    <div>
                        <h2 className="text-sm font-bold tracking-widest uppercase text-slate-400 mb-3">Stats</h2>
                        <div className="space-y-3">
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex justify-between font-bold text-slate-600">
                                <span>Comments</span><span className="text-emerald-600">{stats.comments}</span>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex justify-between font-bold text-slate-600">
                                <span>Votes Cast</span><span className="text-emerald-600">{stats.votes}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-6 mt-24">
                <h2 className="text-3xl font-black text-slate-900">Your Recent Comments</h2>
                {userComments.length === 0 ? (
                    <div className="bg-white p-12 rounded-3xl text-center border border-slate-100 shadow-sm">
                        <p className="text-slate-400 font-medium">You haven't joined any discussions yet.</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {userComments.map(comment => (
                            <CommentItem key={comment.$id} comment={comment} />
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}