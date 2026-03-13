'use client';

import { FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

interface VerificationBadgeProps {
    isVerified?: boolean;
}

export default function VerificationBadge({ isVerified }: VerificationBadgeProps) {
    if (isVerified) {
        return (
            <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full shadow-sm backdrop-blur-md">
                <FiCheckCircle className="w-4 h-4" />
                <span>Verified</span>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full shadow-sm backdrop-blur-md">
            <FiAlertCircle className="w-4 h-4" />
            <span>Unverified</span>
        </div>
    );
}