'use client';

import { useState } from 'react';

export default function ExpandableText({ text }: { text: string }) {
    const [isExpanded, setIsExpanded] = useState(false);

    if (!text) return null;

    const characterLimit = 200;
    const needsTruncation = text.length > characterLimit;

    const displayText = isExpanded
        ? text
        : (needsTruncation ? text.slice(0, characterLimit) + "..." : text);

    return (
        <div className="mb-6 pointer-events-none">
            <p className="text-slate-700 leading-relaxed font-medium">
                {displayText}
            </p>
            {needsTruncation && (
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        setIsExpanded(!isExpanded);
                    }}
                    className="relative z-10 text-emerald-500 font-bold mt-2 hover:text-emerald-600 focus:outline-none transition-colors pointer-events-auto"
                >
                    {isExpanded ? "Read Less" : "Read More"}
                </button>
            )}
        </div>
    );
}