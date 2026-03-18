'use client';

import { FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

interface VerificationBadgeProps {
    isVerified?: boolean;
}

export default function VerificationBadge({ isVerified }: VerificationBadgeProps) {
    if (isVerified) {
        return (
            <div className="flex items-center gap-1.5 bg-emerald-100/90 text-emerald-500 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full">
                <FiCheckCircle className="w-4 h-4" />
                <span>Verified</span>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-1.5 bg-amber-100/90 text-amber-500 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full">
            <FiAlertCircle className="w-4 h-4" />
            <span>Unverified</span>
        </div>
    );
}