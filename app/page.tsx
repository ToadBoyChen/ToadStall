import AboutMe from "@/components/AboutMe";
import BestTools from "@/components/BestTools";
import Menu from "@/components/Menu";
import PopularDiscussions from "@/components/PopularDiscussions";
import RecentArticles from "@/components/RecentArticles";
import RecentData from "@/components/RecentData";
import Search from "@/components/Search";

export default function Home() {
    return (
        <main className="relative z-10 w-full min-h-screen flex flex-col items-center">
            <section className="max-w-xl md:max-w-3xl lg:max-w-6xl px-8 my-32 gap-32 flex flex-col">
                <Search />
                <Menu />
                <PopularDiscussions />
                <RecentArticles />
                <RecentData />
                <BestTools />
                <AboutMe />
            </section>
        </main>
    );
}