'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { account, databases, appwriteDatabaseId } from '@/lib/appwrite';
import { Models, Query } from 'appwrite';

// 1. Added username here, where it belongs in your database
interface ProfileDocument extends Models.Document {
    userID: string;
    bio?: string;
    avatarURL?: string;
    isVerified: boolean;
    username: string; 
}

// 2. Cleaned this up. It just extends the base user and adds the optional profile
interface UserWithProfile extends Models.User<Models.Preferences> {
    profile?: ProfileDocument;
}

interface AuthContextType {
    user: UserWithProfile | null;
    isLoading: boolean;
    logout: () => Promise<void>;
    checkUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    isLoading: true,
    logout: async () => { },
    checkUser: async () => { },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<UserWithProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        checkUser();
    }, []);

    async function checkUser() {
        try {
            const currentAccount = await account.get();

            try {
                const profileRes = await databases.listDocuments(
                    appwriteDatabaseId,
                    process.env.NEXT_PUBLIC_APPWRITE_PROFILES_COLLECTION_ID as string,
                    [Query.equal('userID', currentAccount.$id)]
                );

                let userProfile = (profileRes.documents[0] as unknown as ProfileDocument) || null;

                if (currentAccount.emailVerification && userProfile && !userProfile.isVerified) {
                    userProfile = await databases.updateDocument(
                        appwriteDatabaseId,
                        process.env.NEXT_PUBLIC_APPWRITE_PROFILES_COLLECTION_ID as string,
                        userProfile.$id,
                        { isVerified: true }
                    ) as unknown as ProfileDocument;
                }

                // 3. TypeScript is happy now because profile is optional and we aren't missing a required username!
                setUser({
                    ...currentAccount,
                    profile: userProfile
                });
            } catch (profileError) {
                console.error("Failed to load user profile data", profileError);
                // Cast fallback to UserWithProfile
                setUser(currentAccount as UserWithProfile); 
            }

        } catch (error) {
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }

    async function logout() {
        try {
            await account.deleteSession('current');
            setUser(null);
        } catch (error) {
            console.error('Logout failed', error);
        }
    }

    return (
        <AuthContext.Provider value={{ user, isLoading, logout, checkUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);