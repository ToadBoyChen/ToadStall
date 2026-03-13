'use client';

import { use } from 'react';
import ProfileSection from '@/components/profile/ProfileSection';

export default function PublicProfilePage({ params }: { params: Promise<{ userId: string }> }) {
    const resolvedParams = use(params);
    
    return (
        <main className="min-h-screen">
            <ProfileSection targetUserId={resolvedParams.userId} />
        </main>
    );
}