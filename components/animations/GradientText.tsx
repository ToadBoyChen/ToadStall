interface GradientTextProps {
    children: React.ReactNode;
    className?: string;
}

// No 'use client' needed — purely static markup + CSS animation
export default function GradientText({ children, className = "" }: GradientTextProps) {
    return (
        <span
            className={`animate-gradient bg-linear-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent inline-block ${className}`}
            style={{ backgroundSize: "200% auto" }}
        >
            {children}
        </span>
    );
}
