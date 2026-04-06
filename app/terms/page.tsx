export default function TermsPage() {
    const lastUpdated = 'April 2026';

    return (
        <main className="relative z-10 w-full min-h-screen pt-24 md:pt-32 pb-32 md:pb-48 px-4 sm:px-6">
            <div className="max-w-3xl mx-auto">
                <article className="bg-white sm:rounded-3xl pt-8 pb-12 px-5 sm:p-12 md:p-16 shadow-[0_10px_40px_rgba(0,0,0,0.06)]">

                    <header className="mb-10 pb-8 border-b border-slate-100">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-black uppercase tracking-widest mb-4">
                            Legal
                        </div>
                        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 leading-tight mb-4">
                            Terms of Use
                        </h1>
                        <p className="text-slate-500 font-medium">Last updated: {lastUpdated}</p>
                    </header>

                    <div className="prose prose-slate prose-lg max-w-none
                        prose-headings:font-black prose-headings:tracking-tight prose-headings:text-slate-900
                        prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4
                        prose-h3:text-lg prose-h3:mt-8 prose-h3:mb-3
                        prose-p:text-slate-600 prose-p:leading-relaxed
                        prose-li:text-slate-600 prose-li:leading-relaxed
                        prose-a:text-emerald-600 prose-a:no-underline hover:prose-a:underline
                        prose-strong:text-slate-800">

                        <p>
                            Please read these Terms of Use carefully before accessing or using ToadStall. By creating an account or using any part of the platform, you agree to be bound by these terms. If you do not agree, please do not use ToadStall.
                        </p>

                        <h2>1. About ToadStall</h2>

                        <p>
                            ToadStall is an independent, non-profit data analytics and community discussion platform. It provides access to curated data sets, articles, analytical tools, and community discussion spaces. The platform is operated on a non-commercial basis and is not affiliated with any government body, financial institution, or political organisation.
                        </p>

                        <h2>2. Eligibility and Accounts</h2>

                        <p>
                            You must be at least <strong>13 years old</strong> to use ToadStall. By registering, you represent that you meet this requirement.
                        </p>
                        <p>
                            You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. If you suspect unauthorised access, notify us immediately at <a href="mailto:toby.chen1337@outlook.com">toby.chen1337@outlook.com</a>.
                        </p>
                        <p>
                            We reserve the right to suspend or terminate accounts that violate these Terms without notice.
                        </p>

                        <h2>3. Acceptable Use</h2>

                        <p>When using ToadStall, you agree <strong>not</strong> to:</p>
                        <ul>
                            <li>Post content that is unlawful, defamatory, threatening, harassing, obscene, or discriminatory on the basis of race, gender, religion, nationality, disability, sexuality, or age</li>
                            <li>Spread deliberate misinformation or manipulate data to mislead others</li>
                            <li>Impersonate any person or entity, or misrepresent your affiliation with any person or organisation</li>
                            <li>Scrape, crawl, or systematically extract data from ToadStall without prior written permission</li>
                            <li>Attempt to gain unauthorised access to any part of the platform, its servers, or its databases</li>
                            <li>Upload or distribute malware, viruses, or any code designed to disrupt or damage systems</li>
                            <li>Engage in vote manipulation, coordinated inauthentic behaviour, or any attempt to game engagement metrics</li>
                            <li>Use the platform for commercial solicitation or spam</li>
                        </ul>

                        <p>
                            We reserve the right to remove any content and suspend any account at our sole discretion if we determine it violates these terms or the spirit of the community.
                        </p>

                        <h2>4. User-Generated Content</h2>

                        <h3>Ownership</h3>
                        <p>
                            You retain ownership of the content you post on ToadStall. By posting, you grant ToadStall a non-exclusive, royalty-free, worldwide licence to display, reproduce, and distribute your content on the platform for the purpose of operating the service.
                        </p>

                        <h3>Responsibility</h3>
                        <p>
                            You are solely responsible for the content you post. ToadStall does not endorse any user-submitted content and is not liable for it. We act as a neutral host and do not pre-screen content, though we reserve the right to moderate it.
                        </p>

                        <h3>Reporting</h3>
                        <p>
                            If you believe any content on ToadStall violates these Terms or applicable law, please contact us at <a href="mailto:toby.chen1337@outlook.com">toby.chen1337@outlook.com</a> and we will review it promptly.
                        </p>

                        <h2>5. Intellectual Property</h2>

                        <p>
                            All original content produced by ToadStall — including but not limited to its design, branding, editorial articles, and data curation — is the intellectual property of ToadStall and may not be reproduced without permission.
                        </p>
                        <p>
                            Data displayed through the platform that originates from third-party sources (such as the World Bank Open Data API) remains subject to its original licence. World Bank data is made available under the <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">Creative Commons Attribution 4.0 International licence</a>.
                        </p>

                        <h2>6. Accuracy of Information</h2>

                        <p>
                            ToadStall makes reasonable efforts to ensure the accuracy of data and analysis published on the platform. However, all content is provided for <strong>informational and educational purposes only</strong> and should not be relied upon as professional financial, legal, medical, or investment advice.
                        </p>
                        <p>
                            Data sourced from third parties (such as the World Bank) is subject to their own accuracy and update schedules. ToadStall accepts no responsibility for errors or omissions in third-party data.
                        </p>

                        <h2>7. Links and Third-Party Services</h2>

                        <p>
                            ToadStall may contain links to external websites or embed content from third-party services. These links are provided for convenience only. ToadStall has no control over the content or practices of third-party sites and accepts no responsibility for them.
                        </p>

                        <h2>8. Disclaimer of Warranties</h2>

                        <p>
                            ToadStall is provided <strong>"as is"</strong> and <strong>"as available"</strong> without any warranties of any kind, whether express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, or non-infringement.
                        </p>
                        <p>
                            We do not warrant that the platform will be uninterrupted, error-free, or free of harmful components. Access to ToadStall may be suspended without notice for maintenance, updates, or circumstances beyond our control.
                        </p>

                        <h2>9. Limitation of Liability</h2>

                        <p>
                            To the maximum extent permitted by applicable law, ToadStall and its operators shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of — or inability to use — the platform, even if we have been advised of the possibility of such damages.
                        </p>
                        <p>
                            In no event shall ToadStall's total liability to you exceed the amount you have paid to use the service (which, as a non-profit platform, is nil for most users).
                        </p>

                        <h2>10. Privacy</h2>

                        <p>
                            Your use of ToadStall is also governed by our <a href="/privacy">Privacy Policy</a>, which is incorporated into these Terms by reference. By using ToadStall, you agree to the collection and use of information as described in the Privacy Policy.
                        </p>

                        <h2>11. Changes to These Terms</h2>

                        <p>
                            We reserve the right to modify these Terms at any time. When we make material changes, we will update the "Last updated" date at the top of this page and, where practicable, notify registered users by email. Your continued use of ToadStall following any changes constitutes your acceptance of the updated Terms.
                        </p>

                        <h2>12. Governing Law</h2>

                        <p>
                            These Terms are governed by and construed in accordance with the laws of England and Wales, without regard to conflict of law principles. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts of England and Wales.
                        </p>

                        <h2>13. Contact</h2>

                        <p>
                            If you have any questions about these Terms, please contact us at:
                        </p>
                        <p>
                            <a href="mailto:toby.chen1337@outlook.com">toby.chen1337@outlook.com</a>
                        </p>
                    </div>
                </article>
            </div>
        </main>
    );
}
