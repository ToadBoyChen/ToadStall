import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="relative z-50 w-full border-t border-white/10 bg-slate-950/80 backdrop-blur-lg pt-16 pb-8 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    <div className="col-span-1 md:col-span-1">
                        <h2 className="font-black text-2xl tracking-tighter text-white mb-4">ToadStall</h2>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            Independent data visualization and humanitarian tracking platform. 
                            Utilizing HDX HAPI and OCHA open-source datasets.
                        </p>
                    </div>
                    <div>
                        <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-xs">Trackers</h4>
                        <ul className="space-y-4">
                            <li><Link href="/trackers/migration" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm">Migration Flows</Link></li>
                            <li><Link href="/trackers/climate" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm">Climate Anomalies</Link></li>
                            <li><Link href="/trackers/food-security" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm">Food Security</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-xs">Resources</h4>
                        <ul className="space-y-4">
                            <li><Link href="/methodology" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm">Methodology</Link></li>
                            <li><Link href="/api" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm">API Documentation</Link></li>
                            <li><Link href="/sources" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm">Data Sources</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-xs">Contact</h4>
                        <ul className="space-y-4 text-sm text-slate-400">
                            <li><a href="mailto:contact@toadstall.com" className="hover:text-emerald-400">contact@toadstall.com</a></li>
                            <li className="flex gap-4 pt-2">
                                <span className="hover:text-white cursor-pointer transition-colors">Twitter</span>
                                <span className="hover:text-white cursor-pointer transition-colors">GitHub</span>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-slate-500 text-xs">
                        &copy; {new Date().getFullYear()} ToadStall. All data is sourced via HDX and processed under Creative Commons.
                    </p>
                    <div className="flex gap-6">
                        <Link href="/privacy" className="text-slate-500 hover:text-slate-300 text-xs">Privacy Policy</Link>
                        <Link href="/terms" className="text-slate-500 hover:text-slate-300 text-xs">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}