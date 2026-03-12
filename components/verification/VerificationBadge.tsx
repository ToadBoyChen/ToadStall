'use client';

interface VerificationBadgeProps {
    isVerified: boolean;
}

export default function VerificationBadge({ isVerified }: VerificationBadgeProps) {
    if (isVerified) {
        return (
            <div className="bg-blue-500 text-[10px] uppercase tracking-widest font-black px-2 py-1 rounded-md flex items-center gap-1 shadow-lg border border-blue-400 self-center">
                <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                </svg>
                Verified
            </div>
        );
    }

    return (
        <div className="bg-black/30 border-2 border-green-900/50 text-sm font-semibold px-4 py-2 rounded-md text-red-100 self-center">
            Unverified
        </div>
    );
}