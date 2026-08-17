"use client";

import React from "react";
import {
  TrendingUp,
  Award,
  Zap,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Target,
  BarChart3,
  PieChart,
  ShieldCheck,
  Activity
} from "lucide-react";

interface CategoryFinding {
  category: string;
  count: string;
  detail: string;
  severity: "low" | "medium" | "high";
}

interface AnalysisChartsProps {
  findings: CategoryFinding[];
  targetRole?: string;
  summary?: string;
}

export function AnalysisCharts({ findings, targetRole = "Software Engineer" }: AnalysisChartsProps) {
  // Compute dynamic scores based on LLM findings
  const highCount = findings.filter((f) => f.severity === "high").length;
  const mediumCount = findings.filter((f) => f.severity === "medium").length;
  const lowCount = findings.filter((f) => f.severity === "low").length;

  // Calculate Overall ATS Score (0 - 100)
  const penalty = highCount * 12 + mediumCount * 7 + lowCount * 4;
  const atsScore = Math.max(52, Math.min(98, 98 - penalty));

  // Category Scores
  const hasKeywordDefect = findings.some((f) => f.category.toLowerCase().includes("keyword"));
  const hasMetricDefect = findings.some((f) => f.category.toLowerCase().includes("quantified") || f.category.toLowerCase().includes("metric"));
  const hasVerbDefect = findings.some((f) => f.category.toLowerCase().includes("verb") || f.category.toLowerCase().includes("action"));
  const hasLinkDefect = findings.some((f) => f.category.toLowerCase().includes("link") || f.category.toLowerCase().includes("contact"));
  const hasAtsDefect = findings.some((f) => f.category.toLowerCase().includes("ats") || f.category.toLowerCase().includes("readability"));

  const keywordScore = hasKeywordDefect ? 64 : 94;
  const metricScore = hasMetricDefect ? 58 : 92;
  const verbScore = hasVerbDefect ? 70 : 96;
  const linkScore = hasLinkDefect ? 60 : 98;
  const atsStructureScore = hasAtsDefect ? 68 : 95;

  // Grade Letter
  let grade = "A+";
  if (atsScore < 65) grade = "C";
  else if (atsScore < 75) grade = "B-";
  else if (atsScore < 83) grade = "B+";
  else if (atsScore < 90) grade = "A-";

  // Score Color
  let scoreColor = "text-emerald-400";
  let strokeColor = "#10b981";
  if (atsScore < 70) {
    scoreColor = "text-rose-400";
    strokeColor = "#f43f5e";
  } else if (atsScore < 85) {
    scoreColor = "text-amber-400";
    strokeColor = "#f59e0b";
  }

  // Calculate SVG Circle circumference
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (atsScore / 100) * circumference;

  return (
    <div className="space-y-8 my-10">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-cyan-400" /> AI Visual Analytics & Metrics Report
        </h2>
        <span className="text-xs font-mono text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1 rounded-full flex items-center gap-1.5">
          <Activity className="h-3.5 w-3.5 text-cyan-400 animate-pulse" /> Live LLM Evaluation
        </span>
      </div>

      {/* Top 4 KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: ATS Match Index */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 flex items-center justify-between shadow-xl">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ATS Match Index</p>
            <p className={`text-2xl font-black ${scoreColor} mt-1`}>{atsScore}%</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Overall Resume Health</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Award className="h-6 w-6" />
          </div>
        </div>

        {/* KPI 2: Grade Rating */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 flex items-center justify-between shadow-xl">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Compliance Grade</p>
            <p className="text-2xl font-black text-cyan-300 mt-1">{grade}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Recruiter Pass Benchmark</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-blue-950/60 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <ShieldCheck className="h-6 w-6" />
          </div>
        </div>

        {/* KPI 3: Issues Flagged */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 flex items-center justify-between shadow-xl">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Defects Flagged</p>
            <p className="text-2xl font-black text-amber-400 mt-1">{findings.length}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">{highCount} High · {mediumCount} Med · {lowCount} Low</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-amber-950/60 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <AlertTriangle className="h-6 w-6" />
          </div>
        </div>

        {/* KPI 4: Target Role Match */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 flex items-center justify-between shadow-xl">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Target Match</p>
            <p className="text-base font-bold text-slate-200 mt-1 truncate max-w-[120px]">{targetRole}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">{hasKeywordDefect ? "Needs Keyword Tuning" : "Strong Keyword Alignment"}</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-indigo-950/60 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Target className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Main Graph Grid: Donut Radial Gauge + Category Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Donut Gauge Chart (4 Cols) */}
        <div className="lg:col-span-4 rounded-3xl bg-slate-900/80 border border-slate-800 p-6 flex flex-col items-center justify-center text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 text-[10px] font-mono text-slate-500 uppercase tracking-wider">
            RADIAL ATS GAUGE
          </div>

          <div className="relative my-4 flex items-center justify-center">
            {/* SVG Donut Circle */}
            <svg className="w-40 h-40 transform -rotate-90">
              <circle
                cx="80"
                cy="80"
                r={radius}
                stroke="currentColor"
                strokeWidth="12"
                className="text-slate-800"
                fill="transparent"
              />
              <circle
                cx="80"
                cy="80"
                r={radius}
                stroke={strokeColor}
                strokeWidth="12"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-out"
              />
            </svg>

            {/* Inner Score Label */}
            <div className="absolute flex flex-col items-center justify-center">
              <span className={`text-3xl font-black ${scoreColor}`}>{atsScore}%</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">ATS Score</span>
            </div>
          </div>

          <h3 className="text-sm font-bold text-white mt-2">Overall ATS Readiness Score</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed font-light">
            {atsScore >= 85
              ? "Exceptional formatting and impact metrics. Highly optimized for automated screening."
              : atsScore >= 70
              ? "Good foundation with minor keyword or metric gaps. Needs light optimization."
              : "Substantial gaps detected in action verbs, metrics, or required target role keywords."}
          </p>
        </div>

        {/* Right: Category Scores Breakdown Horizontal Bar Graph (8 Cols) */}
        <div className="lg:col-span-8 rounded-3xl bg-slate-900/80 border border-slate-800 p-6 sm:p-8 flex flex-col justify-between shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <PieChart className="h-4 w-4 text-cyan-400" /> Executive Score Breakdown by Category
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Detailed LLM evaluation scores across key resume vectors.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Category 1: Target Role Keywords */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1.5">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-cyan-400" /> Role Target Keywords
                </span>
                <span className="text-cyan-400 font-mono font-bold">{keywordScore}%</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-950 overflow-hidden p-0.5 border border-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-1000"
                  style={{ width: `${keywordScore}%` }}
                />
              </div>
            </div>

            {/* Category 2: Quantified Metrics */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1.5">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-indigo-400" /> Quantified Metrics & Outcomes
                </span>
                <span className="text-indigo-400 font-mono font-bold">{metricScore}%</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-950 overflow-hidden p-0.5 border border-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-1000"
                  style={{ width: `${metricScore}%` }}
                />
              </div>
            </div>

            {/* Category 3: High Impact Action Verbs */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1.5">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" /> Action Verbs & Tone
                </span>
                <span className="text-emerald-400 font-mono font-bold">{verbScore}%</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-950 overflow-hidden p-0.5 border border-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-1000"
                  style={{ width: `${verbScore}%` }}
                />
              </div>
            </div>

            {/* Category 4: Contact & Social Links */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1.5">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-amber-400" /> Online Profiles & Portfolio Links
                </span>
                <span className="text-amber-400 font-mono font-bold">{linkScore}%</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-950 overflow-hidden p-0.5 border border-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-1000"
                  style={{ width: `${linkScore}%` }}
                />
              </div>
            </div>

            {/* Category 5: ATS Formatting & Readability */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1.5">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-blue-400" /> ATS Readability & Structure
                </span>
                <span className="text-blue-400 font-mono font-bold">{atsStructureScore}%</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-950 overflow-hidden p-0.5 border border-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-1000"
                  style={{ width: `${atsStructureScore}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
