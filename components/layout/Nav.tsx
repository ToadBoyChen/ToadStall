"use client";

import { usePathname } from "next/navigation";
import HackerText from "@/components/animations/HackerText";
import UserMenu from "@/components/UserMenu";
import Breadcrumb from "@/components/layout/Breadcrumb";

export default function Nav() {
    const pathname = usePathname();
    
    const showBreadcrumbs = pathname !== '/';

    return (
        <div className="fixed top-0 left-0 w-full z-50 filter drop-shadow-sm pointer-events-none">
            <nav className="bg-white px-6 py-4 flex flex-row w-full justify-between items-center pointer-events-auto relative z-20">
                <div className="flex flex-col justify-start">
                    <h1 className="font-black text-4xl tracking-tighter select-none">
                        <HackerText text={"ToadStall"} />
                    </h1>
                </div>
                <UserMenu />
            </nav>
            <div
                className={`w-full pointer-events-auto relative z-10 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] overflow-hidden ${
                    showBreadcrumbs ? "max-h-20 opacity-100" : "max-h-0 opacity-0"
                }`}
            >
                <div className="relative inline-flex items-center bg-white pl-6 pr-6 pb-2 pt-1 rounded-br-4xl transition-all duration-300 ease-out
                                before:absolute before:top-0 before:left-full before:w-5 before:h-5 before:bg-transparent
                                before:rounded-tl-xl before:shadow-[-8px_-8px_0_0_#ffffff]">
                    <Breadcrumb />
                </div>
            </div>
        </div>
    );
}