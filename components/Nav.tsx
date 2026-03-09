import HackerText from "./HackerText";
import UserMenu from "./UserMenu";

export default function Nav() {
    return (
        <nav className="z-50 p-6 flex flex-row w-full justify-between fixed">
            <h1 className="font-black text-4xl tracking-tighter select-none">
                <HackerText text={"ToadStall"} spacing={false} color="text-white" />
            </h1>
            <UserMenu />
        </nav>
    );
};