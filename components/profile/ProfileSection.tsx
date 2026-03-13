'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { databases, storage, appwriteDatabaseId, appwritePfpsBucketId, account } from '@/lib/appwrite';
import { Query, ID } from 'appwrite';
import CommentItem from '@/components/comments/CommentItem';
import VerificationBadge from '@/components/profile/VerificationBadge';
import { FiAlertCircle, FiCheckCircle, FiUserPlus, FiUserCheck } from 'react-icons/fi';
import Link from 'next/link';

interface ProfileSectionProps {
    targetUserId: string;
}

export default function ProfileSection({ targetUserId }: ProfileSectionProps) {
    const { user: currentUser, isLoading: authLoading, checkUser } = useAuth();
    
    // Determine context
    const isOwnProfile = currentUser?.$id === targetUserId;
    const currentUserIsVerified = currentUser?.profile?.isVerified === true;

    // Data States
    const [profile, setProfile] = useState<any>(null);
    const [stats, setStats] = useState({ comments: 0, votes: 0, followers: 0, following: 0 });
    const [userComments, setUserComments] = useState<any[]>([]);
    
    // Network States (Actual user profiles)
    const [followersList, setFollowersList] = useState<any[]>([]);
    const [followingList, setFollowingList] = useState<any[]>([]);

    const [isLoading, setIsLoading] = useState(true);

    // Editing States
    const [isEditing, setIsEditing] = useState(false);
    const [editBio, setEditBio] = useState('');
    const [editFile, setEditFile] = useState<File | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Verification States
    const [isSendingVerification, setIsSendingVerification] = useState(false);
    const [verificationStatus, setVerificationStatus] = useState<'idle' | 'success' | 'error'>('idle');

    // Follow States
    const [isFollowing, setIsFollowing] = useState(false);
    const [followDocId, setFollowDocId] = useState<string | null>(null);
    const [isProcessingFollow, setIsProcessingFollow] = useState(false);

    useEffect(() => {
        if (!targetUserId || authLoading) return;

        const fetchUserData = async () => {
            try {
                // 1. Fetch Profile
                const profileRes = await databases.listDocuments(
                    appwriteDatabaseId,
                    process.env.NEXT_PUBLIC_APPWRITE_PROFILES_COLLECTION_ID as string,
                    [Query.equal('userID', targetUserId), Query.limit(1)]
                );

                if (profileRes.documents.length > 0) {
                    const fetchedProfile = profileRes.documents[0] as any;

                    if (isOwnProfile && currentUser?.emailVerification && !fetchedProfile.isVerified) {
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

                // 2. Fetch Comments
                const commentsRes = await databases.listDocuments(
                    appwriteDatabaseId,
                    process.env.NEXT_PUBLIC_APPWRITE_COMMENTS_COLLECTION_ID as string,
                    [
                        Query.equal('userId', targetUserId),
                        Query.orderDesc('$createdAt'),
                        Query.limit(10)
                    ]
                );
                setUserComments(commentsRes.documents);

                // 3. Fetch Votes
                const votesRes = await databases.listDocuments(
                    appwriteDatabaseId,
                    process.env.NEXT_PUBLIC_APPWRITE_VOTES_COLLECTION_ID as string,
                    [Query.equal('userId', targetUserId), Query.limit(1)]
                );

                // 4. Fetch Follower Connections
                const followersConnections = await databases.listDocuments(
                    appwriteDatabaseId,
                    process.env.NEXT_PUBLIC_APPWRITE_FOLLOWERS_COLLECTION_ID as string,
                    [Query.equal('followingId', targetUserId), Query.limit(20)]
                );

                const followingConnections = await databases.listDocuments(
                    appwriteDatabaseId,
                    process.env.NEXT_PUBLIC_APPWRITE_FOLLOWERS_COLLECTION_ID as string,
                    [Query.equal('followerId', targetUserId), Query.limit(20)]
                );

                // 5. Fetch Actual Profiles for the Network lists
                const followerIds = followersConnections.documents.map(d => d.followerId);
                const followingIds = followingConnections.documents.map(d => d.followingId);

                let fetchedFollowers: any[] = [];
                let fetchedFollowing: any[] = [];

                if (followerIds.length > 0) {
                    const fRes = await databases.listDocuments(
                        appwriteDatabaseId, process.env.NEXT_PUBLIC_APPWRITE_PROFILES_COLLECTION_ID as string,
                        [Query.equal('userID', followerIds)]
                    );
                    fetchedFollowers = fRes.documents;
                }

                if (followingIds.length > 0) {
                    const fRes = await databases.listDocuments(
                        appwriteDatabaseId, process.env.NEXT_PUBLIC_APPWRITE_PROFILES_COLLECTION_ID as string,
                        [Query.equal('userID', followingIds)]
                    );
                    fetchedFollowing = fRes.documents;
                }

                setFollowersList(fetchedFollowers);
                setFollowingList(fetchedFollowing);

                // 6. Check if current user is following this profile
                if (currentUser && !isOwnProfile) {
                    const checkFollowRes = await databases.listDocuments(
                        appwriteDatabaseId,
                        process.env.NEXT_PUBLIC_APPWRITE_FOLLOWERS_COLLECTION_ID as string,
                        [
                            Query.equal('followerId', currentUser.$id),
                            Query.equal('followingId', targetUserId)
                        ]
                    );
                    if (checkFollowRes.total > 0) {
                        setIsFollowing(true);
                        setFollowDocId(checkFollowRes.documents[0].$id);
                    }
                }

                // Update Stats
                setStats({
                    comments: commentsRes.total,
                    votes: votesRes.total,
                    followers: followersConnections.total,
                    following: followingConnections.total
                });

            } catch (error) {
                console.error('Error fetching profile data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, [targetUserId, authLoading, isOwnProfile, currentUser]);

    // Action: Save Profile (Own Profile Only)
    const handleSaveProfile = async () => {
        if (!profile || !isOwnProfile) return;
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
                { 
                    bio: editBio, 
                    avatarURL: newAvatarUrl, 
                    username: currentUser?.name // <--- Maps Auth name to Database username
                }
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

    // Action: Send Verification (Own Profile Only)
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

    // Action: Toggle Follow (Public Profiles Only)
    const handleFollowToggle = async () => {
        if (!currentUserIsVerified || !currentUser) return;
        setIsProcessingFollow(true);

        try {
            if (isFollowing && followDocId) {
                // UNFOLLOW
                await databases.deleteDocument(appwriteDatabaseId, process.env.NEXT_PUBLIC_APPWRITE_FOLLOWERS_COLLECTION_ID as string, followDocId);
                setIsFollowing(false);
                setFollowDocId(null);
                setStats(prev => ({ ...prev, followers: prev.followers - 1 }));
                setFollowersList(prev => prev.filter(f => f.userID !== currentUser.$id));
            } else {
                // FOLLOW
                const newFollowDoc = await databases.createDocument(
                    appwriteDatabaseId, process.env.NEXT_PUBLIC_APPWRITE_FOLLOWERS_COLLECTION_ID as string, ID.unique(),
                    { followerId: currentUser.$id, followingId: targetUserId }
                );
                setIsFollowing(true);
                setFollowDocId(newFollowDoc.$id);
                setStats(prev => ({ ...prev, followers: prev.followers + 1 }));
                
                // Optimistically add current user to follower list UI
                const mockCurrentUserProfile = { 
                    userID: currentUser.$id, 
                    username: currentUser.name, // <--- Using username here for the UI mock
                    avatarURL: currentUser.profile?.avatarURL,
                    isVerified: currentUserIsVerified 
                };
                setFollowersList(prev => [mockCurrentUserProfile, ...prev]);
            }
        } catch (error) {
            console.error("Failed to toggle follow status:", error);
        } finally {
            setIsProcessingFollow(false);
        }
    };

    // Helper to render mini user lists
    const renderMiniUserList = (users: any[], emptyMessage: string) => {
        if (users.length === 0) {
            return <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium text-slate-400">{emptyMessage}</div>;
        }
        return (
            <div className="flex flex-col gap-1">
                {users.slice(0, 5).map(u => (
                    <Link key={u.userID} href={`/profile/${u.userID}`} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors group">
                        <div className="w-10 h-10 bg-emerald-100 text-emerald-700 font-bold rounded-full flex items-center justify-center shrink-0 overflow-hidden ring-2 ring-transparent group-hover:ring-emerald-200 transition-all">
                            {u.avatarURL ? <img src={u.avatarURL} alt={u.username} className="w-full h-full object-cover" /> : (u.username || '?').charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm text-slate-900 truncate group-hover:text-emerald-700 transition-colors">
                                {u.username || 'Community Member'}
                            </p>
                        </div>
                    </Link>
                ))}
                {users.length > 5 && (
                    <div className="pt-2 px-2 text-xs font-bold text-slate-400">
                        + {users.length - 5} more
                    </div>
                )}
            </div>
        );
    };

    if (isLoading || authLoading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center text-slate-500 font-medium">
                User not found.
            </div>
        );
    }

    const displayAvatar = isEditing && editFile ? URL.createObjectURL(editFile) : profile.avatarURL;
    // Uses profile.username, falls back to Auth name if looking at your own profile, then Community Member
    const displayName = profile.username || (isOwnProfile && currentUser ? currentUser.name : "Community Member");
    const initial = displayName.charAt(0).toUpperCase();

    return (
        <div className="max-w-4xl mx-auto w-full px-4 py-12">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden mb-8">
                
                {/* Header */}
                <div className="bg-emerald-900 px-8 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="relative group">
                            <div className='flex flex-col items-center'>
                                <div className="w-24 h-24 bg-emerald-500 text-white text-4xl font-black rounded-full flex items-center justify-center border-4 border-white shadow-lg overflow-hidden shrink-0 mb-4">
                                    {displayAvatar ? <img src={displayAvatar} alt="Avatar" className="w-full h-full object-cover" /> : initial}
                                </div>
                                <VerificationBadge isVerified={profile.isVerified} />
                            </div>
                            
                            {isOwnProfile && (
                                <>
                                    <input type="file" ref={fileInputRef} onChange={(e) => setEditFile(e.target.files?.[0] || null)} className="hidden" accept="image/*" />
                                    {isEditing && (
                                        <button onClick={() => fileInputRef.current?.click()} className="absolute top-0 w-24 h-24 bg-black/50 text-white text-xs font-bold flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                            Change
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                        
                        <div className="text-white text-center md:text-left">
                            <h1 className="text-3xl font-black tracking-tight mb-1">
                                {displayName}
                            </h1>
                            <p className="text-emerald-200/80 font-medium">
                                {profile.isVerified ? 'Verified Member' : 'Community Member'}
                            </p>
                        </div>
                    </div>

                    {/* Action Area */}
                    {isOwnProfile ? (
                        !isEditing ? (
                            <button onClick={() => setIsEditing(true)} className="bg-white/10 hover:bg-white/20 text-white px-5 py-2 rounded-full font-bold border border-white/20 transition-colors">
                                Edit Profile
                            </button>
                        ) : (
                            <div className="flex gap-3">
                                <button onClick={() => { setIsEditing(false); setEditFile(null); }} className="text-white font-bold px-4">Cancel</button>
                                <button onClick={handleSaveProfile} disabled={isSaving} className="bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-2 rounded-full font-bold transition-colors">
                                    {isSaving ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        )
                    ) : (
                        currentUser && (
                            <button 
                                onClick={handleFollowToggle}
                                disabled={!currentUserIsVerified || isProcessingFollow}
                                className={`px-6 py-2.5 rounded-full font-bold flex items-center gap-2 transition-colors
                                    ${!currentUserIsVerified 
                                        ? 'bg-white/10 text-white/50 cursor-not-allowed border border-white/10'
                                        : isFollowing
                                            ? 'bg-white text-emerald-900 hover:bg-slate-100'
                                            : 'bg-emerald-500 hover:bg-emerald-400 text-white' 
                                    }`}
                                title={!currentUserIsVerified ? "Verify your email to follow users" : ""}
                            >
                                {isFollowing ? (
                                    <>
                                        <FiUserCheck className="w-4 h-4" />
                                        <span>Following</span>
                                    </>
                                ) : (
                                    <>
                                        <FiUserPlus className="w-4 h-4" />
                                        <span>Follow</span>
                                    </>
                                )}
                            </button>
                        )
                    )}
                </div>

                {/* Unverified Banner (Own Profile Only) */}
                {isOwnProfile && !profile.isVerified && (
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
                                ${verificationStatus === 'success' ? 'bg-emerald-100 text-emerald-700 cursor-default' : 'bg-amber-200 hover:bg-amber-300 text-amber-900'}`}
                        >
                            {isSendingVerification ? 'Sending...' : verificationStatus === 'success' ? <><FiCheckCircle className="w-4 h-4" /> Email Sent!</> : 'Send Verification'}
                        </button>
                    </div>
                )}
                {isOwnProfile && verificationStatus === 'error' && (
                    <div className="bg-red-50 text-red-600 text-xs font-bold text-center py-2">
                        Failed to send verification email. Please try again later.
                    </div>
                )}

                {/* Content Area - Split into About/Stats and Network */}
                <div className="p-8">
                    {/* Top Row: About & Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                        <div className="md:col-span-2">
                            <h2 className="text-sm font-bold tracking-widest uppercase text-slate-400 mb-3">About</h2>
                            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 h-[calc(100%-28px)]">
                                {isOwnProfile && isEditing ? (
                                    <textarea value={editBio} onChange={(e) => setEditBio(e.target.value)} className="w-full h-full min-h-[100px] p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none resize-none bg-white" placeholder="Write something about yourself..." />
                                ) : (
                                    <p className="text-slate-700 font-medium whitespace-pre-wrap">{profile.bio || "No bio yet."}</p>
                                )}
                            </div>
                        </div>
                        
                        <div>
                            <h2 className="text-sm font-bold tracking-widest uppercase text-slate-400 mb-3">Activity</h2>
                            <div className="grid grid-cols-2 md:grid-cols-1 gap-3">
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col sm:flex-row sm:justify-between sm:items-center font-bold text-slate-600">
                                    <span className="text-xs uppercase tracking-wider text-slate-400 mb-1 sm:mb-0">Comments</span>
                                    <span className="text-emerald-600 text-lg sm:text-base">{stats.comments}</span>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col sm:flex-row sm:justify-between sm:items-center font-bold text-slate-600">
                                    <span className="text-xs uppercase tracking-wider text-slate-400 mb-1 sm:mb-0">Votes Cast</span>
                                    <span className="text-emerald-600 text-lg sm:text-base">{stats.votes}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Row: Network */}
                    <div className="pt-8 border-t border-slate-100">
                        <h2 className="text-xl font-black text-slate-900 mb-6">Network</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            
                            {/* Followers Column */}
                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Followers</h3>
                                    <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full">{stats.followers}</span>
                                </div>
                                {renderMiniUserList(followersList, "No followers yet.")}
                            </div>

                            {/* Following Column */}
                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Following</h3>
                                    <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full">{stats.following}</span>
                                </div>
                                {renderMiniUserList(followingList, "Not following anyone yet.")}
                            </div>

                        </div>
                    </div>

                </div>
            </div>

            {/* Comments List */}
            <div className="space-y-6 mt-16">
                <h2 className="text-3xl font-black text-slate-900">
                    {isOwnProfile ? "Your Recent Comments" : "Recent Comments"}
                </h2>
                {userComments.length === 0 ? (
                    <div className="bg-white p-12 rounded-3xl text-center border border-slate-100 shadow-sm">
                        <p className="text-slate-400 font-medium">No discussions joined yet.</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {userComments.map(comment => (
                            <CommentItem 
                                key={comment.$id} 
                                comment={comment} 
                                currentUserId={currentUser?.$id}
                                currentUserIsVerified={currentUserIsVerified}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}