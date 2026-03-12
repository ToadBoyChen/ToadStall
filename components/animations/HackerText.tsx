"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";

interface IntroTextProps {
    text: string;
}

const GLYPHS = "abcdefghijklmnopqrstuvwxyz0123456789";

export default function HackerText({ text }: IntroTextProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    
    const textArray = useMemo(() => text.split(""), [text]);

    const [displayText, setDisplayText] = useState(textArray);
    const [isScrambling, setIsScrambling] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    const scramble = useCallback(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        
        let iteration = 0;
        setIsScrambling(true);

        intervalRef.current = setInterval(() => {
            setDisplayText(
                textArray.map((char, i) => {
                    if (char === " ") return " ";
                    if (i < Math.floor(iteration)) return char;
                    return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
                })
            );

            if (iteration >= textArray.length) {
                if (intervalRef.current) clearInterval(intervalRef.current);
                setIsScrambling(false);
            }
            iteration += 0.35; 
        }, 30);
    }, [textArray]);

    useEffect(() => {
        if (isVisible) {
            scramble();
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isVisible, scramble]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !isVisible) {
                    setIsVisible(true);
                }
            },
            { threshold: 0.1 }
        );

        if (containerRef.current) observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, [isVisible]);

    return (
        <div ref={containerRef} className="w-fit pointer-events-none">
            <p className={`flex w-fit whitespace-pre`}>
                {displayText.map((char, index) => (
                    <span 
                        key={index} 
                        className={`
                            shrink-0 transition-all duration-300
                            
                            text-white mix-blend-difference

                            ${!isVisible ? "opacity-0" : "opacity-100"} 
                        `}
                    >
                        {char === " " ? "\u00A0" : char}
                    </span>
                ))}
            </p>
        </div>
    );
}