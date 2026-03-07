"use client"

import { useTransition, animated } from "@react-spring/web";
import { usePathname } from "next/navigation";

export default function TransitionWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    const transitions = useTransition(children, {
        keys: pathname,
        from: { opacity: 0, y: 400 },
        enter: { opacity: 1, y: 0 },
        leave: { opacity: 0, y: -400 },
        config: { tension: 150, friction: 20, mass: 1 },
    });

    return (
        <div className="grid grid-cols-1 grid-rows-1 w-full">
            {transitions((style, item) => (
                <animated.div
                    style={style}
                    className="col-start-1 row-start-1 w-full"
                >
                    {item}
                </animated.div>
            ))}
        </div>
    );
}