'use client';
import { useEffect, useRef, useState } from 'react';

interface BlobData {
    id: number;
    color: string;
    size: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
}

const generateBlobs = (count: number): BlobData[] => {
    const colors = [
        'bg-emerald-600', 'bg-lime-400', 'bg-teal-600',
        'bg-green-500', 'bg-cyan-600', 'bg-emerald-700',
    ];

    return Array.from({ length: count }).map((_, i) => ({
        id: i,
        color: colors[i % colors.length],
        size: 40 + Math.random() * 40,
        x: Math.random() * 60,
        y: Math.random() * 80,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
    }));
};

export default function Home() {
    const [isMounted, setIsMounted] = useState(false);
    const blobsRef = useRef<BlobData[]>([]);
    const blobElementsRef = useRef<(HTMLDivElement | null)[]>([]);

    useEffect(() => {
        blobsRef.current = generateBlobs(7);
        setIsMounted(true);

        let animationFrameId: number;

        const updatePhysics = () => {
            if (blobElementsRef.current.length === 0) {
                animationFrameId = requestAnimationFrame(updatePhysics);
                return;
            }

            const scrollHeight = document.documentElement.scrollHeight;
            const windowHeight = window.innerHeight;
            const heightInVh = (scrollHeight / windowHeight) * 100;

            blobsRef.current.forEach((blob, index) => {
                blob.x += blob.vx;
                blob.y += blob.vy;

                if (blob.x <= -20 || blob.x >= 80) blob.vx *= -1;
                if (blob.y <= -20 || blob.y >= heightInVh - 30) blob.vy *= -1;

                const el = blobElementsRef.current[index];
                if (el) {
                    el.style.transform = `translate3d(${blob.x}vw, ${blob.y}vh, 0)`;
                }
            });

            animationFrameId = requestAnimationFrame(updatePhysics);
        };

        animationFrameId = requestAnimationFrame(updatePhysics);
        return () => cancelAnimationFrame(animationFrameId);
    }, []);

    return (
        <main className="relative w-full min-h-screen overflow-x-clip bg-slate-950 font-sans">
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-90">
                {isMounted && blobsRef.current.map((blob, index) => (
                    <div
                        key={blob.id}
                        ref={(el) => { blobElementsRef.current[index] = el; }}
                        className={`absolute rounded-full blur-[60px] ${blob.color}`}
                        style={{
                            width: `${blob.size}vw`,
                            height: `${blob.size}vw`,
                            transform: `translate3d(${blob.x}vw, ${blob.y}vh, 0)`,
                            willChange: 'transform'
                        }}
                    />
                ))}
            </div>
            <div className="fixed -inset-32 z-10 backdrop-blur-[120px] pointer-events-none" />
        </main>
    );
}