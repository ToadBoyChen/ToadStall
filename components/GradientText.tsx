'use client';

interface GradientTextProps {
    children: React.ReactNode;
    className?: string;
}

export default function GradientText({ children, className = "" }: GradientTextProps) {
    return (
        <span className={`
            bg-linear-to-r from-emerald-500 via-lime-400 to-cyan-500 
            bg-clip-text text-transparent 
            animate-gradient-x
            ${className}
        `}>
            {children}
        </span>
    );
}