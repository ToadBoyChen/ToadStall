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
        <div className="px-8 md:px-0">
            <div className="flex flex-wrap w-full justify-between items-center gap-4 mb-10 pb-8">
                <YesNo postId={postId} readOnly={readOnly} />
                <CommentCountBadge postId={postId} />
            </div>
            
            <CommentSection postId={postId} readOnly={readOnly} />
        </div>
    );
}