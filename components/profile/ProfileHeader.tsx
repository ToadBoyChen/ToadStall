import { FiCamera } from "react-icons/fi";
import VerificationBadge from "./VerificationBadge";
import ProfilePfp from "./ProfilePfp"; 
import FollowButton from "./FollowButton"; // <-- Import new component

export default function ProfileHeader({ 
    profile, 
    isOwnProfile, 
    currentUser, 
    displayAvatar, 
    initial, 
    isEditing, 
    setIsEditing,
    editFile, 
    setEditFile, 
    handleSaveProfile, 
    isSaving, 
    handleFollowToggle, 
    isProcessingFollow, 
    isFollowing, 
    currentUserIsVerified, 
    fileInputRef, 
    joinedDate 
}: any) {
    return (
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
                        
                        {isEditing && editFile ? (
                            <img src={displayAvatar} alt="Avatar Preview" className="w-full h-full object-cover" />
                        ) : (
                            <ProfilePfp 
                                userId={profile.userID || profile.$id} 
                                fallbackName={profile.username || currentUser?.name || "C"} 
                                className="w-full h-full"
                            />
                        )}

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
                        <FollowButton
                            variant="profile"
                            targetUserId={profile.userID || profile.$id}
                            currentUserId={currentUser.$id}
                            currentUserIsVerified={currentUserIsVerified}
                            
                            isFollowingOverride={isFollowing}
                            isProcessingOverride={isProcessingFollow}
                            onToggleOverride={handleFollowToggle}
                        />
                    )
                )}
            </div>
        </div>
    );
}