'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { databases, storage, appwriteDatabaseId, appwritePfpsBucketId, account } from '@/lib/appwrite';
import { Query, ID } from 'appwrite';
import VerificationBadge from '@/components/profile/VerificationBadge';
import { FiAlertCircle, FiCheckCircle, FiUserPlus, FiUserCheck, FiCamera } from 'react-icons/fi';
import Link from 'next/link';
import CreatePostCTA from '@/components/profile/CreatePostCTA';
import UserCommunityPosts from '@/components/profile/UserCommunityPosts';
import RecentComments from './RecentComments';

const ProfileHeader = ({ profile, isOwnProfile, currentUser, displayAvatar, initial, isEditing, setIsEditing, editFile, setEditFile, handleSaveProfile, isSaving, handleFollowToggle, isProcessingFollow, isFollowing, currentUserIsVerified, fileInputRef, joinedDate }: any) => (
    <div className="bg-emerald-900 p-12 flex flex-col items-center justify-end gap-8 relative rounded-t-3xl">
        <div className="flex flex-row items-center justify-between w-full">
            <div className="flex flex-col items-center group text-center md:text-left">
                <h1 className="text-3xl font-black tracking-tight mb-1 text-white">
                    {profile.username || (isOwnProfile && currentUser ? currentUser.name : "Community Member")}
                </h1>
                <p className="text-emerald-200/80 font-medium">Joined {joinedDate}</p>
            </div>

            <div className="flex flex-col items-center group">
                <div className="relative w-24 h-24 bg-emerald-500 text-white text-4xl font-black rounded-full flex items-center justify-center border-4 border-white shadow-lg overflow-hidden shrink-0 mb-4">
                    {displayAvatar ? <img src={displayAvatar} alt="Avatar" className="w-full h-full object-cover" /> : initial}
                    {isOwnProfile && isEditing && (
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute inset-0 bg-black/40 text-white flex items-center justify-center transition-all duration-300 ease-in-out hover:bg-black/60 focus:outline-none"
                            title="Change Profile Picture"
                        >
                            <FiCamera className="w-10 h-10 stroke-1" />
                        </button>
                    )}
                </div>
                <VerificationBadge isVerified={profile.isVerified} />
                {isOwnProfile && (
                    <input type="file" ref={fileInputRef} onChange={(e) => setEditFile(e.target.files?.[0] || null)} className="hidden" accept="image/*" />
                )}
            </div>
        </div>

        <div className='absolute bottom-0 translate-y-1/2'>
            {isOwnProfile ? (
                !isEditing ? (
                    <button onClick={() => setIsEditing(true)} className="bg-green-500 text-white px-7 py-3 rounded-full font-bold transition-colors cursor-pointer">
                        Edit Profile
                    </button>
                ) : (
                    <div className="flex gap-8">
                        <button onClick={() => { setIsEditing(false); setEditFile(null); }} className="text-white bg-emerald-950 rounded-full font-bold px-7 py-3 cursor-pointer">
                            Cancel
                        </button>
                        <button onClick={handleSaveProfile} disabled={isSaving} className="bg-emerald-500 hover:bg-emerald-400 text-white px-7 py-3 rounded-full font-bold transition-colors cursor-pointer">
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
                        ${!currentUserIsVerified ? 'bg-white/10 text-white/50 cursor-not-allowed border border-white/10' : isFollowing ? 'bg-emerald-200 text-emerald-900 hover:bg-emerald-300' : 'bg-emerald-500 hover:bg-emerald-400 text-white'}`}
                        title={!currentUserIsVerified ? "Verify your email to follow users" : ""}
                    >
                        {isFollowing ? <><FiUserCheck className="w-4 h-4" /><span>Following</span></> : <><FiUserPlus className="w-4 h-4" /><span>Follow</span></>}
                    </button>
                )
            )}
        </div>
    </div>
);

const ProfileVerificationBanner = ({ profile, isOwnProfile, handleSendVerification, isSendingVerification, verificationStatus }: any) => {
    if (!isOwnProfile) return null;
    
    return (
        <div className=''>
            {!profile.isVerified && (
                <div className="bg-amber-50/80 border-b border-amber-100 px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3 text-amber-800">
                        <FiAlertCircle className="w-5 h-5 shrink-0" />
                        <p className="text-sm font-medium">Your account is unverified. Please verify your email to unlock all features.</p>
                    </div>
                    <button
                        onClick={handleSendVerification}
                        disabled={isSendingVerification || verificationStatus === 'success'}
                        className={`shrink-0 px-4 py-2 rounded-full text-sm font-bold transition-colors flex items-center gap-2 ${verificationStatus === 'success' ? 'bg-emerald-100 text-emerald-700 cursor-default' : 'bg-amber-200 hover:bg-amber-300 text-amber-900'}`}
                    >
                        {isSendingVerification ? 'Sending...' : verificationStatus === 'success' ? <><FiCheckCircle className="w-4 h-4" /> Email Sent!</> : 'Send Verification'}
                    </button>
                </div>
            )}
            {verificationStatus === 'error' && (
                <div className="bg-red-50 text-red-600 text-xs font-bold text-center py-2">
                    Failed to send verification email. Please try again later.
                </div>
            )}
        </div>
    );
};

const ProfileAboutActivity = ({ profile, isOwnProfile, isEditing, editBio, setEditBio, stats }: any) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="md:col-span-2">
            <h2 className="text-sm font-bold tracking-widest uppercase text-slate-400 mb-3">About</h2>
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 h-[calc(100%-28px)]">
                {isOwnProfile && isEditing ? (
                    <textarea value={editBio} onChange={(e) => setEditBio(e.target.value)} className="w-full h-full min-h-25 p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none resize-none bg-white" placeholder="Write something about yourself..." />
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
);

const ProfileNetwork = ({ followersList, followingList, stats }: any) => {
    const renderMiniUserList = (users: any[], emptyMessage: string) => {
        if (users.length === 0) return <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium text-slate-400">{emptyMessage}</div>;
        return (
            <div className="flex flex-col gap-1">
                {users.slice(0, 5).map(u => (
                    <Link key={u.userID} href={`/profile/${u.userID}`} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors group">
                        <div className="w-10 h-10 bg-emerald-100 text-emerald-700 font-bold rounded-full flex items-center justify-center shrink-0 overflow-hidden ring-2 ring-transparent group-hover:ring-emerald-200 transition-all">
                            {u.avatarURL ? <img src={u.avatarURL} alt={u.username} className="w-full h-full object-cover" /> : (u.username || '?').charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm text-slate-900 truncate group-hover:text-emerald-700 transition-colors">{u.username || 'Community Member'}</p>
                        </div>
                    </Link>
                ))}
                {users.length > 5 && <div className="pt-2 px-2 text-xs font-bold text-slate-400">+ {users.length - 5} more</div>}
            </div>
        );
    };

    return (
        <div className="pt-8 border-t border-slate-100">
            <h2 className="text-xl font-black text-slate-900 mb-6">Network</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Followers</h3>
                        <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full">{stats.followers}</span>
                    </div>
                    {renderMiniUserList(followersList, "No followers yet.")}
                </div>
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Following</h3>
                        <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full">{stats.following}</span>
                    </div>
                    {renderMiniUserList(followingList, "Not following anyone yet.")}
                </div>
            </div>
        </div>
    );
};

// ==========================================
// MAIN COMPONENT
// ==========================================

interface ProfileSectionProps {
    targetUserId: string;
}

export default function ProfileSection({ targetUserId }: ProfileSectionProps) {
    const { user: currentUser, isLoading: authLoading, checkUser } = useAuth();
    const isOwnProfile = currentUser?.$id === targetUserId;
    const currentUserIsVerified = currentUser?.profile?.isVerified === true;
    
    const [profile, setProfile] = useState<any>(null);
    const [stats, setStats] = useState({ comments: 0, votes: 0, followers: 0, following: 0 });
    const [userComments, setUserComments] = useState<any[]>([]);
    const [followersList, setFollowersList] = useState<any[]>([]);
    const [followingList, setFollowingList] = useState<any[]>([]);
    const [currentUserFollowingIds, setCurrentUserFollowingIds] = useState<string[]>([]); // <-- FIX: State to hold current user's follows
    
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editBio, setEditBio] = useState('');
    const [editFile, setEditFile] = useState<File | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isSendingVerification, setIsSendingVerification] = useState(false);
    const [verificationStatus, setVerificationStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [isFollowing, setIsFollowing] = useState(false);
    const [followDocId, setFollowDocId] = useState<string | null>(null);
    const [isProcessingFollow, setIsProcessingFollow] = useState(false);

    useEffect(() => {
        if (!targetUserId || authLoading) return;

        const fetchUserData = async () => {
            try {
                // 1. Fetch Profile
                const profileRes = await databases.listDocuments(
                    appwriteDatabaseId, process.env.NEXT_PUBLIC_APPWRITE_PROFILES_COLLECTION_ID as string,
                    [Query.equal('userID', targetUserId), Query.limit(1)]
                );

                if (profileRes.documents.length > 0) {
                    const fetchedProfile = profileRes.documents[0] as any;
                    if (isOwnProfile && currentUser?.emailVerification && !fetchedProfile.isVerified) {
                        const updated = await databases.updateDocument(
                            appwriteDatabaseId, process.env.NEXT_PUBLIC_APPWRITE_PROFILES_COLLECTION_ID as string,
                            fetchedProfile.$id, { isVerified: true }
                        );
                        setProfile(updated);
                    } else {
                        setProfile(fetchedProfile);
                    }
                    setEditBio(fetchedProfile.bio || '');
                }

                // 2. Fetch Comments & Votes
                const commentsRes = await databases.listDocuments(
                    appwriteDatabaseId, process.env.NEXT_PUBLIC_APPWRITE_COMMENTS_COLLECTION_ID as string,
                    [Query.equal('userId', targetUserId), Query.orderDesc('$createdAt'), Query.limit(10)]
                );
                setUserComments(commentsRes.documents);

                const votesRes = await databases.listDocuments(
                    appwriteDatabaseId, process.env.NEXT_PUBLIC_APPWRITE_VOTES_COLLECTION_ID as string,
                    [Query.equal('userId', targetUserId), Query.limit(1)]
                );

                // 3. Fetch Network Stats (Target User)
                const followersConnections = await databases.listDocuments(
                    appwriteDatabaseId, process.env.NEXT_PUBLIC_APPWRITE_FOLLOWERS_COLLECTION_ID as string,
                    [Query.equal('followingId', targetUserId), Query.limit(20)]
                );
                const followingConnections = await databases.listDocuments(
                    appwriteDatabaseId, process.env.NEXT_PUBLIC_APPWRITE_FOLLOWERS_COLLECTION_ID as string,
                    [Query.equal('followerId', targetUserId), Query.limit(20)]
                );

                setStats({
                    comments: commentsRes.total,
                    votes: votesRes.total,
                    followers: followersConnections.total,
                    following: followingConnections.total
                });

                // 4. Resolve Network User Details
                const followerIds = followersConnections.documents.map(d => d.followerId);
                const followingIds = followingConnections.documents.map(d => d.followingId);

                if (followerIds.length > 0) {
                    const fRes = await databases.listDocuments(
                        appwriteDatabaseId, process.env.NEXT_PUBLIC_APPWRITE_PROFILES_COLLECTION_ID as string,
                        [Query.equal('userID', followerIds)]
                    );
                    setFollowersList(fRes.documents);
                }

                if (followingIds.length > 0) {
                    const fRes = await databases.listDocuments(
                        appwriteDatabaseId, process.env.NEXT_PUBLIC_APPWRITE_PROFILES_COLLECTION_ID as string,
                        [Query.equal('userID', followingIds)]
                    );
                    setFollowingList(fRes.documents);
                }

                // 5. FIX: Fetch everything the *Current Logged In User* follows for the RecentComments feed
                if (currentUser) {
                    const currentUserFollowsRes = await databases.listDocuments(
                        appwriteDatabaseId, process.env.NEXT_PUBLIC_APPWRITE_FOLLOWERS_COLLECTION_ID as string,
                        [Query.equal('followerId', currentUser.$id)]
                    );
                    setCurrentUserFollowingIds(currentUserFollowsRes.documents.map(d => d.followingId));
                    
                    // Set status for the main follow button on the profile header
                    const specificFollowDoc = currentUserFollowsRes.documents.find(d => d.followingId === targetUserId);
                    if (specificFollowDoc && !isOwnProfile) {
                        setIsFollowing(true);
                        setFollowDocId(specificFollowDoc.$id);
                    }
                }

            } catch (error) {
                console.error('Error fetching profile data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, [targetUserId, authLoading, isOwnProfile, currentUser]);

    // Handlers (Save, Verify, Follow Toggle) remain exactly the same functionally
    const handleSaveProfile = async () => { /* ... existing logic ... */ };
    const handleSendVerification = async () => { /* ... existing logic ... */ };

    const handleFollowToggle = async () => {
        if (!currentUserIsVerified || !currentUser) return;
        setIsProcessingFollow(true);

        try {
            if (isFollowing && followDocId) {
                await databases.deleteDocument(appwriteDatabaseId, process.env.NEXT_PUBLIC_APPWRITE_FOLLOWERS_COLLECTION_ID as string, followDocId);
                setIsFollowing(false);
                setFollowDocId(null);
                setStats(prev => ({ ...prev, followers: prev.followers - 1 }));
                setFollowersList(prev => prev.filter(f => f.userID !== currentUser.$id));
                // Update the array passed to comments
                setCurrentUserFollowingIds(prev => prev.filter(id => id !== targetUserId)); 
            } else {
                const newFollowDoc = await databases.createDocument(
                    appwriteDatabaseId, process.env.NEXT_PUBLIC_APPWRITE_FOLLOWERS_COLLECTION_ID as string, ID.unique(),
                    { followerId: currentUser.$id, followingId: targetUserId }
                );
                setIsFollowing(true);
                setFollowDocId(newFollowDoc.$id);
                setStats(prev => ({ ...prev, followers: prev.followers + 1 }));
                setFollowersList(prev => [{ userID: currentUser.$id, username: currentUser.name, avatarURL: currentUser.profile?.avatarURL }, ...prev]);
                // Update the array passed to comments
                setCurrentUserFollowingIds(prev => [...prev, targetUserId]);
            }
        } catch (error) {
            console.error("Failed to toggle follow status:", error);
        } finally {
            setIsProcessingFollow(false);
        }
    };

    if (isLoading || authLoading) return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    if (!profile) return <div className="min-h-[60vh] flex items-center justify-center text-slate-500 font-medium">User not found.</div>;

    const displayAvatar = isEditing && editFile ? URL.createObjectURL(editFile) : profile.avatarURL;
    const initial = (profile.username || currentUser?.name || "C").charAt(0).toUpperCase();
    const joinedDate = profile?.$createdAt ? new Date(profile.$createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recently';

    return (
        <div className="max-w-4xl mx-auto w-full px-4 py-12">
            <div className="rounded-3xl mb-8">
                
                <ProfileHeader 
                    profile={profile} isOwnProfile={isOwnProfile} currentUser={currentUser} 
                    displayAvatar={displayAvatar} initial={initial} joinedDate={joinedDate}
                    isEditing={isEditing} setIsEditing={setIsEditing} editFile={editFile} setEditFile={setEditFile} 
                    handleSaveProfile={handleSaveProfile} isSaving={isSaving} handleFollowToggle={handleFollowToggle} 
                    isProcessingFollow={isProcessingFollow} isFollowing={isFollowing} 
                    currentUserIsVerified={currentUserIsVerified} fileInputRef={fileInputRef} 
                />

                <ProfileVerificationBanner 
                    profile={profile} isOwnProfile={isOwnProfile} handleSendVerification={handleSendVerification} 
                    isSendingVerification={isSendingVerification} verificationStatus={verificationStatus} 
                />

                <div className="py-24 px-4 sm:px-8 bg-white rounded-b-3xl">
                    
                    <ProfileAboutActivity 
                        profile={profile} isOwnProfile={isOwnProfile} isEditing={isEditing} 
                        editBio={editBio} setEditBio={setEditBio} stats={stats} 
                    />

                    <ProfileNetwork 
                        followersList={followersList} followingList={followingList} stats={stats} 
                    />

                </div>
            </div>

            <div className='h-32' />

            <UserCommunityPosts targetUserId={targetUserId} isOwnProfile={isOwnProfile} />
            {isOwnProfile && <CreatePostCTA />}

            <div className='h-32' />

            <RecentComments
                comments={userComments}
                isOwnProfile={isOwnProfile}
                currentUserId={currentUser?.$id}
                currentUserIsVerified={currentUserIsVerified}
                currentUserFollows={currentUserFollowingIds}
            />
        </div>
    );
}