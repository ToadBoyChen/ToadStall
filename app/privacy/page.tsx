export default function PrivacyPage() {
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
                            Privacy Policy
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
                            ToadStall ("we", "us", or "our") is an independent, non-profit data analytics and community discussion platform. This Privacy Policy explains what information we collect, how we use it, and the choices you have. By using ToadStall you agree to the practices described here.
                        </p>

                        <h2>1. Information We Collect</h2>

                        <h3>Account information</h3>
                        <p>
                            When you register for an account we collect your <strong>email address</strong>, a <strong>display name</strong> (username), and a <strong>hashed password</strong>. We do not store your password in plain text under any circumstances. You may optionally add a profile picture or short biography at any time.
                        </p>

                        <h3>Content you create</h3>
                        <p>
                            Community posts, replies, votes, and reactions you submit are stored and associated with your account. This content may be visible to other users of the platform depending on where it is posted.
                        </p>

                        <h3>Usage data</h3>
                        <p>
                            We collect standard server-side logs including IP address, browser type, pages visited, and timestamps. This information is used solely for platform stability and security monitoring and is not sold or shared with advertisers.
                        </p>

                        <h3>Cookies and local storage</h3>
                        <p>
                            We use session cookies and browser local storage to keep you signed in and remember your preferences. We do not use tracking cookies or third-party advertising cookies. You can clear these at any time through your browser settings, though doing so will sign you out.
                        </p>

                        <h2>2. How We Use Your Information</h2>

                        <p>We use the information we collect to:</p>
                        <ul>
                            <li>Create and maintain your account</li>
                            <li>Verify your email address and prevent abuse</li>
                            <li>Display your posts and contributions on the platform</li>
                            <li>Calculate engagement scores (votes, reactions) on content</li>
                            <li>Send transactional emails such as email verification and password reset messages</li>
                            <li>Monitor and improve platform performance and security</li>
                        </ul>

                        <p>We do <strong>not</strong> use your data for advertising, sell it to third parties, or use it to build behavioural profiles.</p>

                        <h2>3. Data Storage and Third-Party Services</h2>

                        <h3>Appwrite</h3>
                        <p>
                            User accounts, authentication, and engagement data (votes, reactions) are managed by <strong>Appwrite</strong>, a self-hostable open-source backend platform. Your credentials are handled by Appwrite's authentication system and are never directly accessible to ToadStall application code. Please refer to <a href="https://appwrite.io/privacy" target="_blank" rel="noopener noreferrer">Appwrite's Privacy Policy</a> for further details.
                        </p>

                        <h3>Sanity</h3>
                        <p>
                            Published content — articles, data sets, community posts, and categories — is stored in <strong>Sanity</strong>, a headless content management platform. Sanity's data is hosted on infrastructure in the EU and US. Please refer to <a href="https://www.sanity.io/legal/privacy" target="_blank" rel="noopener noreferrer">Sanity's Privacy Policy</a> for further details.
                        </p>

                        <h3>World Bank Open Data</h3>
                        <p>
                            Chart data displayed on the platform is fetched in real time from the <strong>World Bank Open Data API</strong>, which is publicly available. No personal data is sent to the World Bank API. Please refer to the <a href="https://www.worldbank.org/en/about/legal/privacy-notice" target="_blank" rel="noopener noreferrer">World Bank Privacy Notice</a> for further details on their data practices.
                        </p>

                        <h3>Vercel</h3>
                        <p>
                            ToadStall is hosted on <strong>Vercel</strong>. Vercel may log request metadata (IP address, user-agent, timestamps) as part of standard infrastructure operations. Please refer to <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">Vercel's Privacy Policy</a> for further details.
                        </p>

                        <h2>4. Data Retention</h2>

                        <p>
                            Account data is retained for as long as your account is active. Published posts and contributions may remain visible after account deletion for continuity of discussion threads, but will be anonymised — your name and profile information will be removed.
                        </p>
                        <p>
                            If you would like all data associated with your account to be permanently deleted, please contact us at the email address below and we will action your request within 30 days.
                        </p>

                        <h2>5. Your Rights</h2>

                        <p>Depending on your location, you may have the right to:</p>
                        <ul>
                            <li><strong>Access</strong> the personal data we hold about you</li>
                            <li><strong>Correct</strong> inaccurate or incomplete data</li>
                            <li><strong>Delete</strong> your account and associated personal data</li>
                            <li><strong>Export</strong> your data in a portable format</li>
                            <li><strong>Object</strong> to or restrict certain processing</li>
                        </ul>

                        <p>
                            To exercise any of these rights, please email us directly. We will respond within 30 days.
                        </p>

                        <h2>6. Children's Privacy</h2>

                        <p>
                            ToadStall is not directed at children under the age of 13. We do not knowingly collect personal data from children. If you believe a child has provided us with personal information, please contact us and we will delete it promptly.
                        </p>

                        <h2>7. Changes to This Policy</h2>

                        <p>
                            We may update this Privacy Policy from time to time. When we do, we will revise the "Last updated" date at the top of this page. Continued use of ToadStall after any changes constitutes your acceptance of the updated policy. For significant changes we will make reasonable efforts to notify registered users via email.
                        </p>

                        <h2>8. Contact</h2>

                        <p>
                            If you have any questions, concerns, or requests regarding this Privacy Policy or the data we hold, please contact us at:
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
