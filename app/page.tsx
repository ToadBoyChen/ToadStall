import BestTools from "@/components/sections/BestTools";
import CategoryBar from "@/components/sections/CategoryBar";
import Menu from "@/components/sections/Menu";
import PopularDiscussions from "@/components/sections/PopularDiscussions";
import RecentArticles from "@/components/sections/RecentArticles";
import RecentData from "@/components/sections/RecentData";
import Search from "@/components/sections/Search";

export default function Home() {
    return (
        <main className="relative z-10 w-full min-h-screen flex flex-col items-center">
            <section className="max-w-xl md:max-w-3xl lg:max-w-6xl px-8 my-32 gap-32 flex flex-col">
                <div className="flex flex-col gap-6">
                    <Search />
                    <CategoryBar />
                </div>
                <Menu />
                <PopularDiscussions />
                <RecentArticles />
                <RecentData />
                <BestTools />
            </section>
        </main>
    );
}