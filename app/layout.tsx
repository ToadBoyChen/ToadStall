import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import Background from "@/components/layout/Background";
import Breadcrumb from "@/components/layout/Breadcrumb";
import { Analytics } from "@vercel/analytics/next"

import { AuthProvider } from "@/context/AuthContext";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "ToadStall",
    description: "ToadStall by Toby Chen",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased relative`}>
                <Analytics />
                <AuthProvider>
                    <Nav />
                    <Background />

                    <div className="flex flex-col">
                        <div className="my-32">
                            {children}
                        </div>
                        <Footer />
                    </div>
                </AuthProvider>
            </body>
        </html>
    );
}