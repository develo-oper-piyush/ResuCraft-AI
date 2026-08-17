"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { PrismaHero } from "@/components/ui/prisma-hero";
import { WobbleCardDemo } from "@/components/ui/wobble-card";
import { LandingButton } from "@/components/ui/landing-button";
import { Sparkles, FileText, Cpu, Layers, Download, CheckCircle2, ArrowRight } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function LandingPage() {
  const narrativeRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    gsap.registerPlugin(ScrollTrigger);

    let ctx: gsap.Context;

    const timer = setTimeout(() => {
      ctx = gsap.context(() => {
        // Staggered reveal for narrative arc
        gsap.fromTo(
          ".gsap-narrative-text",
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.15,
            scrollTrigger: {
              trigger: narrativeRef.current,
              start: "top 85%",
            },
          }
        );

        // Steps pinning / animation
        gsap.fromTo(
          ".gsap-step-card",
          { opacity: 0, scale: 0.95, y: 30 },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.7,
            stagger: 0.15,
            scrollTrigger: {
              trigger: stepsRef.current,
              start: "top 85%",
            },
          }
        );
      });
      ScrollTrigger.refresh();
    }, 100);

    return () => {
      clearTimeout(timer);
      if (ctx) ctx.revert();
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      {/* 1. Hero Section */}
      <PrismaHero />

      {/* 2. Narrative Section */}
      <section id="narrative" ref={narrativeRef} className="py-24 px-6 max-w-6xl mx-auto w-full text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-400 text-xs font-semibold uppercase tracking-widest mb-6">
          <Sparkles className="h-4 w-4" /> The Narrative Arc
        </div>

        <h2 className="gsap-narrative-text text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
          "Your resume is a document.<br />
          <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
            Your career is a story.
          </span>"
        </h2>

        <p className="gsap-narrative-text text-base sm:text-xl text-slate-300 max-w-3xl mx-auto mt-6 font-light leading-relaxed">
          In a world dominated by automated ATS screeners and rigid templates, candidates get reduced to plain text files. ResuCraft AI bridges the gap between your real achievements and recruiter expectations.
        </p>

        {/* 3D Wobble Cards Grid */}
        <div className="mt-16">
          <WobbleCardDemo />
        </div>
      </section>

      {/* 3. How It Works (Scroll-triggered 4-step sequence) */}
      <section ref={stepsRef} className="py-24 px-6 bg-slate-900/20 border-y border-white/5 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Four Steps to Career Elevation
            </h2>
            <p className="text-sm sm:text-base text-slate-400 mt-3 max-w-lg mx-auto font-light">
              From raw PDF upload to high-converting interactive web portfolio.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="gsap-step-card rounded-3xl bg-slate-900/40 border border-white/10 p-6 flex flex-col justify-between hover:border-cyan-500/40 transition-colors backdrop-blur-xl">
              <div>
                <div className="h-12 w-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4 font-bold text-lg">
                  01
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Upload Resume</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-light">
                  Drag & drop your existing PDF or DOCX file. Extracted server-side into raw tokens and stored securely on Cloudinary & NeonDB.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-2 text-xs text-cyan-400 font-medium">
                <FileText className="h-4 w-4" /> Server Parsing
              </div>
            </div>

            {/* Step 2 */}
            <div className="gsap-step-card rounded-3xl bg-slate-900/40 border border-white/10 p-6 flex flex-col justify-between hover:border-cyan-500/40 transition-colors backdrop-blur-xl">
              <div>
                <div className="h-12 w-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4 font-bold text-lg">
                  02
                </div>
                <h3 className="text-lg font-bold text-white mb-2">AI Audit & Chips</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-light">
                  Get a 3-5 sentence overall executive feedback summary plus conditional issue chips (missing keywords, quantified metrics, action verbs).
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-2 text-xs text-cyan-400 font-medium">
                <Cpu className="h-4 w-4" /> Gemini & Groq LLM
              </div>
            </div>

            {/* Step 3 */}
            <div className="gsap-step-card rounded-3xl bg-slate-900/40 border border-white/10 p-6 flex flex-col justify-between hover:border-cyan-500/40 transition-colors backdrop-blur-xl">
              <div>
                <div className="h-12 w-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4 font-bold text-lg">
                  03
                </div>
                <h3 className="text-lg font-bold text-white mb-2">RAG Context Memory</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-light">
                  Chat with your persistent AI assistant. Every project, skill, and milestone is embedded for consistent multi-step memory.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-2 text-xs text-cyan-400 font-medium">
                <Layers className="h-4 w-4" /> LangChain Pipeline
              </div>
            </div>

            {/* Step 4 */}
            <div className="gsap-step-card rounded-3xl bg-slate-900/40 border border-white/10 p-6 flex flex-col justify-between hover:border-cyan-500/40 transition-colors backdrop-blur-xl">
              <div>
                <div className="h-12 w-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4 font-bold text-lg">
                  04
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Customize & Export</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-light">
                  Switch between Minimalist, Developer, or Web Portfolio layouts with live split-screen preview and instant PDF export to Cloudinary.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-2 text-xs text-cyan-400 font-medium">
                <Download className="h-4 w-4" /> Cloudinary PDF Export
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Final CTA Section */}
      <section className="py-24 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(56,189,248,0.15),transparent_70%)] pointer-events-none" />
        <div className="max-w-4xl mx-auto relative z-10">
          <h2 className="text-4xl sm:text-6xl font-black text-white tracking-tight">
            Ready to Build Your Career Portfolio?
          </h2>
          <p className="text-base sm:text-lg text-slate-300 mt-4 max-w-xl mx-auto font-light">
            Join thousands of developers and professionals landing higher-tier interview callbacks with AI-tailored resumes.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link href="/analyze">
              <LandingButton className="text-sm py-1">
                Upload Resume & Audit Now
              </LandingButton>
            </Link>
            <Link href="/build">
              <span className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-slate-900/60 border border-white/10 text-sm font-semibold text-slate-200 hover:text-white hover:border-cyan-500/40 transition-all backdrop-blur-md">
                Build Interactive Portfolio <ArrowRight className="h-4 w-4 text-cyan-400" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-slate-800 text-center text-xs text-slate-500">
        <p>© 2026 ResuCraft AI. Powered by Next.js, Gemini API, Groq, LangChain, Cloudinary & NeonDB.</p>
      </footer>
    </div>
  );
}
