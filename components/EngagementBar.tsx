'use client';

import YesNo from './YesNo';
import CommentSection from './CommentSection';

export default function EngagementBar({ postId }: { postId: string }) {
    return (
        <div className="pt-4">
            <div className="flex items-center justify-between mb-8">
                <YesNo postId={postId} />
            </div>
            <CommentSection postId={postId} />
        </div>
    );
}