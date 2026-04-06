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
            <section className="w-full max-w-xl md:max-w-3xl lg:max-w-6xl px-4 sm:px-8 gap-16 sm:gap-24 lg:gap-32 flex flex-col">
                <div className="flex flex-col gap-6 mt-32 md:mt-24 lg:mt-16">
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