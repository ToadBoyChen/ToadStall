"use client";

import { useEffect, useRef, useState } from "react";

interface FadeInProps {
    children: React.ReactNode;
    delay?: number;
    className?: string;
}

/**
 * FadeIn — wraps children in a scroll-triggered fade + slide-up entrance.
 * Starts invisible and animates in when the element enters the viewport.
 * Safe for use inside server components.
 */
export default function FadeIn({ children, delay = 0, className = "" }: FadeInProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.04, rootMargin: "0px 0px -32px 0px" }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return (
        <div
            ref={ref}
            className={className}
            style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(20px)",
                transition: `opacity 0.55s ease ${delay}ms, transform 0.55s ease ${delay}ms`,
            }}
        >
            {children}
        </div>
    );
}
