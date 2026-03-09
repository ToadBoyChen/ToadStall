"use client";

import { useEffect, useState, useRef } from "react";

export default function ScrollIndicator() {
    const [scale, setScale] = useState(0);
    const ticking = useRef(false);

    useEffect(() => {
        const handleScroll = () => {
            if (!ticking.current) {
                window.requestAnimationFrame(() => {
                    const scrollTop = window.scrollY;
                    const totalDocScrollLength = 
                        document.documentElement.scrollHeight - window.innerHeight;

                    if (totalDocScrollLength === 0) {
                        setScale(0);
                    } else {
                        setScale(scrollTop / totalDocScrollLength);
                    }
                    
                    ticking.current = false;
                });
                
                ticking.current = true;
            }
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll();

        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div className="fixed top-0 left-0 w-full h-1 z-100 bg-transparent pointer-events-none">
            <div
                className="h-full bg-emerald-400 origin-left"
                style={{ 
                    transform: `scaleX(${scale})`,
                    transition: 'transform 75ms ease-out' 
                }}
            />
        </div>
    );
}