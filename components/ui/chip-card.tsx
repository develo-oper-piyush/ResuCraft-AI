"use client";

import React from "react";
import { AlertTriangle, Info, AlertCircle, Sparkles } from "lucide-react";
import { AnalysisCategoryFinding } from "@/lib/ai/gemini-groq-client";

interface ChipCardProps {
  finding: AnalysisCategoryFinding;
}

export function ChipCard({ finding }: ChipCardProps) {
  // If for any reason finding is null or empty, return null immediately
  if (!finding || !finding.category || !finding.detail) {
    return null;
  }

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case "high":
        return {
          badgeBg: "bg-rose-500/10 text-rose-400 border-rose-500/30",
          cardBorder: "border-rose-500/30 hover:border-rose-500/60",
          glowBg: "from-rose-500/10 via-transparent to-transparent",
          icon: <AlertCircle className="h-5 w-5 text-rose-400" />,
        };
      case "medium":
        return {
          badgeBg: "bg-amber-500/10 text-amber-400 border-amber-500/30",
          cardBorder: "border-amber-500/30 hover:border-amber-500/60",
          glowBg: "from-amber-500/10 via-transparent to-transparent",
          icon: <AlertTriangle className="h-5 w-5 text-amber-400" />,
        };
      default:
        return {
          badgeBg: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
          cardBorder: "border-cyan-500/30 hover:border-cyan-500/60",
          glowBg: "from-cyan-500/10 via-transparent to-transparent",
          icon: <Info className="h-5 w-5 text-cyan-400" />,
        };
    };
  };

  const style = getSeverityStyle(finding.severity);

  return (
    <div
      className={`relative group rounded-2xl bg-slate-900/90 p-6 border transition-all duration-300 shadow-xl backdrop-blur-md overflow-hidden ${style.cardBorder}`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${style.glowBg} pointer-events-none opacity-50 group-hover:opacity-80 transition-opacity`} />
      
      <div className="relative z-10 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            {style.icon}
            <h4 className="font-bold text-base text-slate-100 tracking-tight">
              {finding.category}
            </h4>
          </div>
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full border uppercase tracking-wider ${style.badgeBg}`}
          >
            {finding.severity} Severity
          </span>
        </div>

        <div className="rounded-xl bg-slate-950/70 border border-slate-800 p-3 text-xs md:text-sm font-medium text-cyan-300 flex items-center gap-2">
          <Sparkles className="h-4 w-4 shrink-0 text-cyan-400" />
          <span>{finding.count}</span>
        </div>

        <p className="text-xs md:text-sm text-slate-300 leading-relaxed pt-1">
          {finding.detail}
        </p>
      </div>
    </div>
  );
}

export function FindingsChipList({ findings }: { findings: AnalysisCategoryFinding[] }) {
  // CRITICAL RULE: If array is empty, render nothing or a clean positive highlight banner!
  if (!findings || findings.length === 0) {
    return (
      <div className="rounded-2xl bg-emerald-950/40 border border-emerald-500/30 p-8 text-center backdrop-blur-md">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 mb-3">
          <Sparkles className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-bold text-emerald-200">Zero Critical Deficiencies Detected!</h3>
        <p className="text-xs md:text-sm text-emerald-300/80 max-w-md mx-auto mt-1">
          Your resume satisfies all primary ATS metrics, action verb standards, and structural formatting guidelines.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
      {findings.map((finding, idx) => (
        <ChipCard key={`${finding.category}-${idx}`} finding={finding} />
      ))}
    </div>
  );
}
