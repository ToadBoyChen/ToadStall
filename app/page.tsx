import AboutMe from "@/components/AboutMe";
import Menu from "@/components/Menu";
import RecentArticles from "@/components/RecentArticles";
import Search from "@/components/Search";

export default function Home() {
    return (
        <main className="relative z-10 w-full min-h-screen">
            <section className="p-24">
                <Search />
                <Menu />
                <RecentArticles />
                <AboutMe />
            </section>
        </main>
    );
}