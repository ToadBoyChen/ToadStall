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
    <main className="relative w-full min-h-screen overflow-x-hidden bg-slate-950 font-sans">
      
      {/* 1. Blobs Layer: Kept `absolute` so the blobs can travel up and down the full height of your scrollable page */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-90">
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

      {/* 2. Blur Overlay: Changed to `fixed` and stretched using `-inset-32` to hide the ugly edges */}
      <div className="fixed -inset-32 z-10 backdrop-blur-[120px] pointer-events-none" />

      {/* 3. Content Layer */}
      <nav className="relative z-50 p-6">
         <h1 className="font-black text-4xl tracking-tighter select-none text-white drop-shadow-md">
           ToadStall
         </h1>
      </nav>

      {/* Adding scrolling space and the YouGov-style Data Card */}
      <section className="relative z-50 flex flex-col items-center px-6 pt-12 pb-48">
        
        <div className="text-center mb-12">
            <h2 className="text-5xl font-bold text-white mb-4 tracking-tight drop-shadow-lg">Global Movement Index</h2>
            <p className="text-emerald-50 text-xl font-medium max-w-2xl mx-auto drop-shadow-md">
                Tracking real-time humanitarian data and border crossings.
            </p>
        </div>

        {/* The "YouGov" style white data card */}
        <div className="w-full max-w-5xl bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden">
            {/* Card Header */}
            <div className="border-b border-slate-200 px-10 py-6 bg-slate-50 flex justify-between items-center">
                <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Net Migration Flows</h3>
                    <p className="text-slate-500 font-medium text-sm mt-1">Updated dynamically via live tracking.</p>
                </div>
                {/* Mock Status Indicator */}
                <div className="flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </span>
                    <span className="text-slate-600 font-bold text-sm tracking-wide uppercase">Live</span>
                </div>
            </div>

            {/* Card Body / Map Placeholder */}
            <div className="p-10">
                <div className="w-full h-[500px] bg-slate-100 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center">
                    <span className="text-slate-400 font-bold text-lg">Interactive D3.js Map Layer Goes Here</span>
                </div>
            </div>
        </div>

      </section>

    </main>
  );
}