"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";

const GLYPHS = "abcdefghijklmnopqrstuvwxyz0123456789";

interface HackerTextProps {
    text: string;
    className?: string;
}

export default function HackerText({ text, className = "" }: HackerTextProps) {
    const spanRef = useRef<HTMLSpanElement>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const textArray = useMemo(() => text.split(""), [text]);
    const [displayText, setDisplayText] = useState(textArray);
    const [triggered, setTriggered] = useState(false);

    const scramble = useCallback(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        let iteration = 0;

        intervalRef.current = setInterval(() => {
            setDisplayText(
                textArray.map((char, i) => {
                    if (char === " ") return " ";
                    if (i < Math.floor(iteration)) return char;
                    return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
                })
            );
            if (iteration >= textArray.length) {
                clearInterval(intervalRef.current!);
                setDisplayText(textArray);
            }
            iteration += 0.5;
        }, 25);
    }, [textArray]);

    // Trigger once on scroll into view
    useEffect(() => {
        const el = spanRef.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !triggered) {
                    setTriggered(true);
                    scramble();
                }
            },
            { threshold: 0.1 }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, [scramble, triggered]);

    // Re-scramble on hover
    const handleMouseEnter = useCallback(() => scramble(), [scramble]);

    useEffect(() => {
        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }, []);

    return (
        <span
            ref={spanRef}
            className={`whitespace-pre cursor-default ${className}`}
            onMouseEnter={handleMouseEnter}
        >
            {displayText.map((char, i) => (
                <span key={i} className="inline-block">
                    {char === " " ? "\u00A0" : char}
                </span>
            ))}
        </span>
    );
}
