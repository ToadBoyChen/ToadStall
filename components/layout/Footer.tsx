'use client';

import Link from 'next/link';
import { FiTwitter, FiGithub, FiMail } from 'react-icons/fi';

export default function Footer() {
    return (
        <footer className="relative z-50 w-full bg-white/80 pt-20 pb-10 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    
                    {/* Brand Section */}
                    <div className="col-span-1 md:col-span-1">
                        <h2 className="font-black text-3xl tracking-tighter text-slate-900 mb-4 italic">
                            ToadStall
                        </h2>
                        <p className="text-slate-500 text-sm leading-relaxed font-medium">
                            Independent data visualization and humanitarian tracking platform. 
                            Utilizing HDX HAPI and OCHA open-source datasets.
                        </p>
                    </div>

                    {/* Links Section */}
                    <div>
                        <h4 className="text-slate-900 font-black mb-6 uppercase tracking-[0.2em] text-[10px]">Trackers</h4>
                        <ul className="space-y-4">
                            <li><Link href="/trackers/migration" className="text-slate-500 hover:text-emerald-600 transition-colors text-sm font-semibold">Migration Flows</Link></li>
                            <li><Link href="/trackers/climate" className="text-slate-500 hover:text-emerald-600 transition-colors text-sm font-semibold">Climate Anomalies</Link></li>
                            <li><Link href="/trackers/food-security" className="text-slate-500 hover:text-emerald-600 transition-colors text-sm font-semibold">Food Security</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-slate-900 font-black mb-6 uppercase tracking-[0.2em] text-[10px]">Resources</h4>
                        <ul className="space-y-4">
                            <li><Link href="/methodology" className="text-slate-500 hover:text-emerald-600 transition-colors text-sm font-semibold">Methodology</Link></li>
                            <li><Link href="/api" className="text-slate-500 hover:text-emerald-600 transition-colors text-sm font-semibold">API Documentation</Link></li>
                            <li><Link href="/sources" className="text-slate-500 hover:text-emerald-600 transition-colors text-sm font-semibold">Data Sources</Link></li>
                        </ul>
                    </div>

                    {/* Contact & Socials */}
                    <div>
                        <h4 className="text-slate-900 font-black mb-6 uppercase tracking-[0.2em] text-[10px]">Connect</h4>
                        <ul className="space-y-4">
                            <li>
                                <a href="mailto:contact@toadstall.com" className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 font-semibold text-sm transition-colors">
                                    <FiMail /> contact@toadstall.com
                                </a>
                            </li>
                            <li className="flex gap-5 pt-2">
                                <a href="#" className="text-slate-400 hover:text-slate-900 text-xl transition-colors"><FiTwitter /></a>
                                <a href="#" className="text-slate-400 hover:text-slate-900 text-xl transition-colors"><FiGithub /></a>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="pt-12 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest">
                        &copy; {new Date().getFullYear()} ToadStall
                    </p>
                    <div className="flex gap-8">
                        <Link href="/privacy" className="text-slate-400 hover:text-slate-900 text-[11px] font-bold uppercase tracking-widest transition-colors">Privacy</Link>
                        <Link href="/terms" className="text-slate-400 hover:text-slate-900 text-[11px] font-bold uppercase tracking-widest transition-colors">Terms</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}