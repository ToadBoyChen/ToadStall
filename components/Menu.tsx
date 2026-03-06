import Link from 'next/link';

// 1. Define the menu items so it's easy to add more later
const MENU_ITEMS = [
    { 
        title: 'Data Trackers & Tools', 
        href: '/tool', // or /trackers based on your setup
        description: 'Interactive maps, 3D globes, and live humanitarian data visualizations.',
        // A simple map/globe icon
        icon: <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    },
    { 
        title: 'Analysis & Reports', 
        href: '/articles', 
        description: 'In-depth articles, methodology breakdowns, and weekly data briefs.',
        // A simple document/article icon
        icon: <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    },
    { 
        title: 'Methodology', 
        href: '/methodology', 
        description: 'Transparency on how we source and process HDX HAPI open-source data.',
        // A simple clipboard/check icon
        icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
    },
    { 
        title: 'Developer API', 
        href: '/api', 
        description: 'Access our custom datasets programmatically for your own projects.',
        // A simple code/terminal icon
        icon: <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
    }
];

export default function Menu() {
    return (
        <section className="w-full max-w-6xl mx-auto px-6 py-12">
            
            {/* Optional Header for the Menu Section */}
            <div className="mb-12">
                <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-4">
                    Explore Platform
                </h2>
                <p className="text-slate-400 text-lg max-w-2xl">
                    Navigate through our interactive data tools, read our latest humanitarian briefs, or dive into the developer API.
                </p>
            </div>

            {/* The Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {MENU_ITEMS.map((item) => (
                    <Link 
                        key={item.href} 
                        href={item.href}
                        className="group relative flex flex-col justify-between p-8 bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-3xl transition-all duration-300 hover:bg-slate-800/80 hover:border-emerald-500/50 hover:-translate-y-1 hover:shadow-[0_10px_40px_-10px_rgba(16,185,129,0.15)] overflow-hidden"
                    >
                        {/* A subtle glowing gradient that appears on hover */}
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                        <div>
                            {/* Icon Wrapper */}
                            <div className="h-12 w-12 rounded-2xl bg-slate-800 flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 group-hover:bg-emerald-400/10 transition-all duration-300">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    {item.icon}
                                </svg>
                            </div>

                            {/* Text Content */}
                            <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-emerald-400 transition-colors duration-300 tracking-tight">
                                {item.title}
                            </h3>
                            <p className="text-slate-400 leading-relaxed font-medium">
                                {item.description}
                            </p>
                        </div>

                        {/* An animated "Arrow" indicating a link */}
                        <div className="mt-8 flex items-center text-emerald-500 font-bold text-sm tracking-widest uppercase opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                            Explore <span className="ml-2">&rarr;</span>
                        </div>
                    </Link>
                ))}
            </div>
            
        </section>
    );
}