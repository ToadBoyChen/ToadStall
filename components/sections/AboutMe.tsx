import Image from 'next/image';
import { FiExternalLink } from 'react-icons/fi';

export default function AboutMe() {
    return (
        <section className="">
            <div className="flex flex-col md:flex-row items-center justify-between p-8 bg-white/80 rounded-3xl relative overflow-hidden group">
                <div className="relative z-10 max-w-2xl">
                    <h2 className="text-4xl font-black tracking-tight mb-4">
                        About Me
                    </h2>
                    <p className="text-slate-700 text-lg leading-relaxed mb-8">
                        ToadStall is designed and engineered by Toby Chen. It serves as an independent data visualization platform focused on humanitarian tracking, open-source datasets, and interactive web architecture.
                    </p>
                    <a
                        href="https://tobychen.tech"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-slate-900 hover:text-emerald-300 font-bold text-sm tracking-widest uppercase rounded-full transition-all duration-300"
                    >
                        Visit tobychen.tech
                        <FiExternalLink className="w-4 h-4" />
                    </a>
                </div>

                {/* Photo Container */}
                <div className="relative z-10 hidden md:block w-48 h-48 shrink-0 rounded-full bg-slate-100 border-2 border-white overflow-hidden">
                    <Image
                        src="/kewfinger.jpg"
                        alt="Toby Chen"
                        fill
                        className="object-cover"
                    />
                </div>
            </div>
        </section>
    );
}