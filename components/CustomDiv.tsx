"use client";
import { useInView, animated, useSpring } from "@react-spring/web";

interface SectionHeaderProps {
    label: string;
    lineColor?: string;
    align?: "left" | "center" | "right";
}

export default function SectionHeader({
    label,
    lineColor = "bg-zinc-900",
    align = "center",
}: SectionHeaderProps) {
    const [ref, inView] = useInView({
        rootMargin: "-15% 0px",
        once: true,
    });

    const leftLineSpring = useSpring({
        from: { transform: "scaleX(0)" },
        to: { transform: inView ? "scaleX(1)" : "scaleX(0)" },
        config: { mass: 1, tension: 140, friction: 35 },
    });

    const rightLineSpring = useSpring({
        from: { transform: "scaleX(0)" },
        to: { transform: inView ? "scaleX(1)" : "scaleX(0)" },
        delay: align === "center" ? 200 : 0,
        config: { mass: 1, tension: 140, friction: 35 },
    });

    const textSpring = useSpring({
        from: { opacity: 0, transform: "translateY(10px)" },
        to: { 
            opacity: inView ? 1 : 0, 
            transform: inView ? "translateY(0px)" : "translateY(10px)" 
        },
        delay: align === "left" ? 0 : 100,
        config: { tension: 280, friction: 25 },
    });

    const lineBase = `h-[0.75px] rounded-full ${lineColor} flex-1`;

    return (
        <div
            ref={ref}
            className="flex items-center gap-6 w-full overflow-visible isolate my-4"
        >
            {(align === "center" || align === "right") && (
                <animated.div 
                    style={{ ...leftLineSpring, transformOrigin: "right" }} 
                    className={lineBase} 
                />
            )}

            <animated.div style={textSpring} className="z-10">
                <span className="relative z-10 pointer-events-none whitespace-nowrap tracking-widest">
                    {label}
                </span>
            </animated.div>

            {(align === "center" || align === "left") && (
                <animated.div 
                    style={{ ...rightLineSpring, transformOrigin: "left" }} 
                    className={lineBase} 
                />
            )}
        </div>
    );
}