export default function Page() {
    return (
        <section className="relative z-50 flex flex-col items-center px-6 pt-12 pb-48">

            <div className="text-center mt-24 mb-12">
                <h2 className="text-6xl font-black text-white tracking-tighter mb-4 text-left">Migration Tracker</h2>
                <h3 className="text-2xl font-semibold text-white mb-4 text-left">
                    Using <a
                        href="https://data.humdata.org/hapi"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-400 hover:text-emerald-300 underline underline-offset-4 decoration-emerald-400/40 hover:decoration-emerald-300 transition-all duration-200"
                    >
                        HDX HAPI
                    </a> from OCHA
                </h3>
            </div>
        </section>
    );
};