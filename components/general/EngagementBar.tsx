'use client';

import YesNo from '@/components/likes/YesNo';
import CommentSection from '@/components/comments/CommentSection';
import CommentCountBadge from '@/components/comments/CommentCountBadge';

interface EngagementBarProps {
    postId: string;
    variant?: 'minimal' | 'full';
    readOnly?: boolean;
}

export default function EngagementBar({ postId, variant = 'full', readOnly = false }: EngagementBarProps) {
    
    if (variant === 'minimal') {
        return (
            <div className="relative z-10 flex items-center justify-between pt-8">
                <YesNo postId={postId} readOnly={readOnly} />
                <CommentCountBadge postId={postId} subtle={true} />
            </div>
        );
    }

    return (
        <div className="pt-4">
            <div className="flex items-center justify-between mb-8">
                <YesNo postId={postId} readOnly={readOnly} />
            </div>
            <CommentSection postId={postId} />
        </div>
    );
}