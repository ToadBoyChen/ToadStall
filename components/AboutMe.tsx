export default function AboutMe() {
    return (
        <section className="w-full max-w-6xl mx-auto px-6 py-12">
            <div className="flex flex-col md:flex-row items-center justify-between p-8 md:p-12 bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-3xl relative overflow-hidden group hover:border-emerald-500/30 transition-colors duration-500">
                
                {/* Subtle background glow on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                <div className="relative z-10 max-w-2xl mb-8 md:mb-0">
                    <h2 className="text-3xl font-black text-white tracking-tight mb-4">
                        About the Developer
                    </h2>
                    <p className="text-slate-400 text-lg leading-relaxed mb-8">
                        ToadStall is designed and engineered by Toby Chen. It serves as an independent data visualization platform focused on humanitarian tracking, open-source datasets, and interactive web architecture.
                    </p>
                    
                    {/* The External Link Button */}
                    <a 
                        href="https://tobychen.tech" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-slate-800/80 hover:bg-slate-800 text-emerald-400 hover:text-emerald-300 font-bold text-sm tracking-widest uppercase rounded-full transition-all duration-300 border border-slate-700 hover:border-emerald-500/50 shadow-lg hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]"
                    >
                        Visit tobychen.tech 
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                    </a>
                </div>

                {/* A minimalist monogram graphic for the right side */}
                <div className="relative z-10 hidden md:flex items-center justify-center w-32 h-32 rounded-full bg-slate-900/80 border border-slate-800 shadow-inner group-hover:border-emerald-500/20 transition-colors duration-500">
                    <span className="text-4xl font-black text-slate-800 group-hover:text-emerald-500/20 transition-colors duration-500 tracking-tighter">
                        TC
                    </span>
                </div>

            </div>
        </section>
    );
}