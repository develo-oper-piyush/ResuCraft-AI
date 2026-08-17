"use client";

import { motion, useInView } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { useRef } from "react";
import Link from "next/link";
import { LandingButton } from "./landing-button";

/* ---------------- WordsPullUp ---------------- */
interface WordsPullUpProps {
  text: string;
  className?: string;
  showAsterisk?: boolean;
  style?: React.CSSProperties;
}

export const WordsPullUp = ({ text, className = "", showAsterisk = false, style }: WordsPullUpProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const words = text.split(" ");

  return (
    <div ref={ref} className={`inline-flex flex-wrap ${className}`} style={style}>
      {words.map((word, i) => {
        const isLast = i === words.length - 1;
        return (
          <motion.span
            key={i}
            initial={{ y: 20, opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="inline-block relative"
            style={{ marginRight: isLast ? 0 : "0.25em" }}
          >
            {word}
            {showAsterisk && isLast && (
              <span className="absolute top-[0.65em] -right-[0.3em] text-[0.31em] text-cyan-400">*</span>
            )}
          </motion.span>
        );
      })}
    </div>
  );
};

/* ---------------- WordsPullUpMultiStyle ---------------- */
interface Segment {
  text: string;
  className?: string;
}

interface WordsPullUpMultiStyleProps {
  segments: Segment[];
  className?: string;
  style?: React.CSSProperties;
}

export const WordsPullUpMultiStyle = ({ segments, className = "", style }: WordsPullUpMultiStyleProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  const words: { word: string; className?: string }[] = [];
  segments.forEach((seg) => {
    seg.text.split(" ").forEach((w) => {
      if (w) words.push({ word: w, className: seg.className });
    });
  });

  return (
    <div ref={ref} className={`inline-flex flex-wrap justify-center ${className}`} style={style}>
      {words.map((w, i) => (
        <motion.span
          key={i}
          initial={{ y: 20, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
          className={`inline-block ${w.className ?? ""}`}
          style={{ marginRight: "0.25em" }}
        >
          {w.word}
        </motion.span>
      ))}
    </div>
  );
};

/* ---------------- PrismaHero ---------------- */
const navItems = [
  { name: "Narrative", href: "#narrative" },
  { name: "AI Audit", href: "/analyze" },
  { name: "RAG Builder", href: "/build" },
  { name: "Dashboard", href: "/dashboard" },
];

const PrismaHero = () => {
  return (
    <section className="relative min-h-screen w-full p-2 sm:p-4 md:p-6 bg-slate-950 flex flex-col justify-between">
      <div className="relative h-full min-h-[90vh] w-full overflow-hidden rounded-2xl md:rounded-[2.5rem] border border-slate-800/80 shadow-2xl flex flex-col justify-between p-6 md:p-12">
        
        {/* Background video / visual fallback canvas */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover opacity-60 filter saturate-150 contrast-125"
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_170732_8a9ccda6-5cff-4628-b164-059c500a2b41.mp4"
        />

        {/* Noise overlay */}
        <div className="noise-overlay pointer-events-none absolute inset-0 opacity-[0.7] mix-blend-overlay" />

        {/* Gradient overlay */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/40 to-slate-950/95" />

        {/* Top Navbar */}
        <nav className="relative z-20 flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <img src="/ResuCraft.png" alt="ResuCraft AI" className="h-10 w-10 object-contain drop-shadow-[0_0_12px_rgba(56,189,248,0.4)]" />
            <span className="font-bold text-xl tracking-tight text-white">Resu<span className="text-cyan-400">Craft</span> AI</span>
          </div>

          <div className="hidden md:flex items-center gap-6 rounded-full bg-slate-900/80 border border-slate-800 backdrop-blur-md px-6 py-2">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-xs md:text-sm transition-colors text-slate-300 hover:text-white font-medium"
              >
                {item.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <LandingButton>Launch App</LandingButton>
            </Link>
          </div>
        </nav>

        {/* Hero content */}
        <div className="relative z-20 mt-16 md:mt-24">
          <div className="grid grid-cols-12 items-end gap-6">
            
            <div className="col-span-12 lg:col-span-8">
              <h1
                className="font-black leading-[0.85] tracking-[-0.07em] text-[18vw] sm:text-[16vw] md:text-[14vw] lg:text-[11vw] xl:text-[10vw]"
                style={{ color: "#E1E0CC" }}
              >
                <WordsPullUp text="ResuCraft AI" showAsterisk />
              </h1>
            </div>

            <div className="col-span-12 flex flex-col gap-6 lg:col-span-4 lg:pb-4">
              
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="text-sm sm:text-base md:text-lg text-slate-200 font-light"
                style={{ lineHeight: 1.4 }}
              >
                Your resume is not a plain document — it is your career story. Transform static credentials into an interactive, RAG-powered portfolio and ATS-optimized powerhouse.
              </motion.p>

              <div className="flex flex-wrap items-center gap-4">
                <Link href="/analyze">
                  <motion.button
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    className="group inline-flex items-center gap-3 rounded-full bg-cyan-400 py-1.5 pl-6 pr-1.5 text-sm md:text-base font-semibold text-slate-950 transition-all hover:bg-cyan-300 hover:gap-4 shadow-xl shadow-cyan-400/20"
                  >
                    Analyze Resume
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-950 transition-transform group-hover:scale-110">
                      <ArrowRight className="h-4 w-4 text-cyan-300" />
                    </span>
                  </motion.button>
                </Link>
                <Link href="/build">
                  <span className="text-xs md:text-sm text-slate-300 hover:text-cyan-400 underline underline-offset-4 font-medium transition-colors">
                    Build from Scratch &rarr;
                  </span>
                </Link>
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export { PrismaHero };
