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

export default function Background() {
    const [isMounted, setIsMounted] = useState(false);
    const blobsRef = useRef<BlobData[]>([]);
    const blobElementsRef = useRef<(HTMLDivElement | null)[]>([]);

    useEffect(() => {
        blobsRef.current = generateBlobs(12);
        setIsMounted(true);

        let animationFrameId: number;

        const updatePhysics = () => {
            if (blobElementsRef.current.length === 0) return;
            const scrollHeight = document.documentElement.scrollHeight;
            const windowHeight = window.innerHeight;
            const totalHeightInVh = (scrollHeight / windowHeight) * 100;

            blobsRef.current.forEach((blob, index) => {
                blob.x += blob.vx;
                blob.y += blob.vy;

                if (blob.x <= -20 || blob.x >= 100) blob.vx *= -1;
                if (blob.y <= -20 || blob.y >= totalHeightInVh - 10) blob.vy *= -1;

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
        <div className="absolute inset-0 z-[-1] overflow-hidden bg-slate-950 pointer-events-none">

            {/* Animated colour blobs */}
            <div className="absolute inset-0 opacity-80">
                {isMounted && blobsRef.current.map((blob, index) => (
                    <div
                        key={blob.id}
                        ref={(el) => { blobElementsRef.current[index] = el; }}
                        className={`absolute rounded-full blur-[80px] ${blob.color}`}
                        style={{
                            width: `${blob.size}vw`,
                            height: `${blob.size}vw`,
                            willChange: 'transform'
                        }}
                    />
                ))}
            </div>

            {/* Atmospheric blur */}
            <div className="fixed -inset-32 backdrop-blur-[130px] z-10" />

            {/* Subtle dot-grid texture */}
            <div
                className="fixed inset-0 z-20 pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.045) 1px, transparent 1px)',
                    backgroundSize: '28px 28px',
                }}
            />

            {/* Vignette — darkens the edges, draws eye inward */}
            <div
                className="fixed inset-0 z-20 pointer-events-none"
                style={{
                    background: 'radial-gradient(ellipse 90% 85% at 50% 25%, transparent 35%, rgba(2,6,23,0.55) 80%, rgba(2,6,23,0.85) 100%)',
                }}
            />

            {/* Faint emerald bloom at the top centre */}
            <div
                className="fixed top-0 left-1/2 -translate-x-1/2 w-[70vw] h-[28vh] z-20 pointer-events-none"
                style={{
                    background: 'radial-gradient(ellipse at 50% 0%, rgba(16,185,129,0.10) 0%, transparent 70%)',
                }}
            />
        </div>
    );
}