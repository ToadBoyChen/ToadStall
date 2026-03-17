import HackerText from "@/components/animations/HackerText";
import UserMenu from "@/components/UserMenu";
import Breadcrumb from "@/components/layout/Breadcrumb";
import Link from 'next/link';

import { TbMushroom } from "react-icons/tb";


export default function Nav() {
    return (
        <div className="fixed top-0 left-0 w-full z-50 filter drop-shadow-sm pointer-events-none">
            <nav className="bg-white px-4 py-2 flex flex-row w-full justify-between items-center pointer-events-auto relative z-20">
                <div className="flex flex-row justify-start items-center gap-2">
                    <Link
                        href={"/"}
                    >
                        <TbMushroom
                            className="w-10 h-10"
                        />
                    </Link>
                    <h1 className="font-black text-4xl tracking-tighter select-none">
                        <HackerText text={"ToadStall"} />
                    </h1>
                </div>
                <UserMenu />
            </nav>
            <div
                className={`w-full pointer-events-auto relative z-10 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] overflow-hidden max-h-20 opacity-100"
                }`}
            >
                <div className="relative inline-flex items-center bg-white pl-6 pr-6 pb-1 rounded-br-4xl transition-all duration-300 ease-out">
                    <Breadcrumb />
                </div>
            </div>
        </div>
    );
}