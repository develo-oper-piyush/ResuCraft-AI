"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, Layout, Code, Palette, FileType, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/stateful-button";

const templates = [
  {
    id: "latex-overleaf",
    name: "Overleaf LaTeX",
    description: "Classic academic-style resume with Computer Modern serif fonts, horizontal rules, and dense tabular formatting. Matches professional LaTeX resumes.",
    icon: <FileType className="h-6 w-6 text-amber-400" />,
    badge: "Professional",
  },
  {
    id: "modern-minimal",
    name: "Modern Minimalist",
    description: "Clean single/double column layout optimized for maximum ATS parsing accuracy.",
    icon: <Layout className="h-6 w-6 text-cyan-400" />,
    badge: "ATS High-Score",
  },
  {
    id: "tech-developer",
    name: "Tech Developer CLI",
    description: "Developer-focused dark theme with tech stack matrix, GitHub links, and code snippets.",
    icon: <Code className="h-6 w-6 text-emerald-400" />,
    badge: "Developer Favorite",
  },
  {
    id: "interactive-portfolio",
    name: "Interactive Web Portfolio",
    description: "Vibrant full-page career portfolio with project showcase cards and experience timeline.",
    icon: <Palette className="h-6 w-6 text-purple-400" />,
    badge: "Full Portfolio",
  },
];

export default function BuildTemplateSelectorPage() {
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] = useState("latex-overleaf");

  const handleStartBuilding = () => {
    router.push(`/build/new?template=${selectedTemplate}`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(56,189,248,0.12),transparent_70%)] pointer-events-none" />

      <div className="w-full max-w-4xl relative z-10 glass-panel rounded-3xl p-8 sm:p-12 border border-slate-800 shadow-2xl">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-cyan-400 mb-6 transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
        </Link>

        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center mb-4">
            <img src="/ResuCraft.png" alt="ResuCraft AI" className="h-14 w-14 object-contain drop-shadow-[0_0_15px_rgba(56,189,248,0.5)]" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Choose Your Resume / Portfolio Template
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-md mx-auto">
            Select a design system. You can switch templates anytime inside the live RAG editor workspace.
          </p>
        </div>

        {/* Template Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {templates.map((tmpl) => (
            <div
              key={tmpl.id}
              onClick={() => setSelectedTemplate(tmpl.id)}
              className={`rounded-2xl p-6 border transition-all cursor-pointer flex flex-col justify-between ${
                selectedTemplate === tmpl.id
                  ? "bg-slate-900 border-cyan-500 ring-2 ring-cyan-500/20 shadow-2xl scale-[1.02]"
                  : "bg-slate-900/50 border-slate-800 hover:border-slate-700 opacity-80 hover:opacity-100"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    {tmpl.icon}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-950 border border-slate-800 text-cyan-300">
                    {tmpl.badge}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mb-2">{tmpl.name}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{tmpl.description}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs font-semibold">
                <span className={selectedTemplate === tmpl.id ? "text-cyan-400" : "text-slate-500"}>
                  {selectedTemplate === tmpl.id ? "Selected" : "Click to Select"}
                </span>
                {selectedTemplate === tmpl.id && <Sparkles className="h-4 w-4 text-cyan-400" />}
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Button onClick={handleStartBuilding} className="py-3.5 px-10 text-base">
            Launch Interactive Workspace &rarr;
          </Button>
        </div>
      </div>
    </div>
  );
}
