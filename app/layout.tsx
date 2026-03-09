import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Background from "@/components/Background";
import Breadcrumb from "@/components/Breadcrumb";
import ScrollIndicator from "@/components/ScrollIndicator";

// 1. Import the AuthProvider
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
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased relative min-h-screen`}>
                {/* 2. Wrap everything inside the body with AuthProvider */}
                <AuthProvider>
                    <ScrollIndicator />
                    <Nav />
                    <Background />

                    <div className="flex flex-col min-h-screen">
                        <Breadcrumb />
                        {children}
                        <Footer />
                    </div>
                </AuthProvider>
            </body>
        </html>
    );
}