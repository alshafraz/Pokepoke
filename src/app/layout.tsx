import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Toaster } from "react-hot-toast";
import { ThemeManager } from "@/components/ThemeManager";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ShinyDex Hunter | Premium Pokemon Shiny Hunting Platform",
  description: "Futuristic Pokemon shiny hunting companion for Legends: Arceus, Scarlet, Violet, and Legends Z-A.",
  keywords: "pokemon, shiny hunting, pokedex, paldea map, scarlet violet, legends arceus, pokemon tracker",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeManager />
        <Navbar />
        <main className="pt-24 pb-12 min-h-screen">
          {children}
        </main>
        <Toaster 
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#0f172a',
              color: '#f8fafc',
              border: '1px solid rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
            }
          }}
        />
      </body>
    </html>
  );
}
