import AboutMe from "@/components/AboutMe";
import Menu from "@/components/Menu";
import RecentArticles from "@/components/RecentArticles";
import Search from "@/components/Search";

export default function Home() {
    return (
        <main className="relative z-10 w-full min-h-screen flex flex-col items-center">
            <section className="max-w-xl md:max-w-3xl lg:max-w-6xl px-8 my-32">
                <Search />
                <div className="h-32" />
                <Menu />
                <div className="h-32" />
                <RecentArticles />
                <div className="h-32" />
                <AboutMe />
                <div className="h-32" />
            </section>
        </main>
    );
}