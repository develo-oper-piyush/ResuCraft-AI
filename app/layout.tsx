import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthSessionProvider } from "@/components/providers/session-provider";
import { LenisProvider } from "@/components/providers/lenis-provider";
import { SmoothCursor } from "@/components/ui/smooth-cursor";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ResuCraft AI - Dynamic Portfolio & Resume Generator",
  description:
    "Production-grade AI resume auditor and RAG-driven dynamic portfolio/resume generator powered by Next.js, LangChain, Cloudinary, and NeonDB.",
  icons: {
    icon: "/ResuCraft.png",
    shortcut: "/ResuCraft.png",
    apple: "/ResuCraft.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <head>
        <link rel="icon" href="/ResuCraft.png" type="image/png" sizes="any" />
        <link rel="shortcut icon" href="/ResuCraft.png" type="image/png" />
        <link rel="apple-touch-icon" href="/ResuCraft.png" />
      </head>
      <body className={`${inter.className} bg-slate-950 text-slate-100 min-h-screen selection:bg-cyan-500/30 selection:text-cyan-200 overflow-x-hidden`}>
        <AuthSessionProvider>
          <LenisProvider>
            <SmoothCursor />
            {children}
          </LenisProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
