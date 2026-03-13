'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import ProfileSection from '@/components/profile/ProfileSection';

export default function PrivateProfilePage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login');
        }
    }, [user, isLoading, router]);

    if (isLoading || !user) return null;

    return (
        <main className="min-h-screen">
            <ProfileSection targetUserId={user.$id} />
        </main>
    );
}