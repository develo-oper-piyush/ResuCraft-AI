"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Sparkles, ArrowLeft, FileText, Download, Target, CheckCircle2, ShieldAlert, Home } from "lucide-react";
import { FindingsChipList } from "@/components/ui/chip-card";
import { AnalysisCharts } from "@/components/ui/analysis-charts";
import { Button } from "@/components/ui/stateful-button";
import { inMemoryStore } from "@/lib/db";

import { SkeletonAnalysisReport } from "@/components/ui/skeleton";

export default function AnalysisResultsPage() {
  const params = useParams();
  const id = params?.id as string;

  const [record, setRecord] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/resumes")
      .then((res) => res.json())
      .then((json) => {
        const found = json.uploadedResumes?.find((r: any) => r.id === id);
        if (found) {
          setRecord(found);
        } else if (json.uploadedResumes?.length > 0) {
          setRecord(json.uploadedResumes[0]);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4">
        <SkeletonAnalysisReport />
      </div>
    );
  }

  const analysis = record?.analysisJson || {
    summary: "Resume uploaded and processed successfully. Solid foundation with clear tech experience.",
    missingFindings: [
      {
        category: "Missing Keywords",
        count: "4 keywords missing for Software Engineer roles",
        detail: "Add explicit mentions of Next.js App Router, TypeScript, and state management.",
        severity: "high",
      },
      {
        category: "Quantified Impact Metrics",
        count: "3 bullet points missing metrics",
        detail: "Quantify achievements (e.g. 'improved latency by 35%').",
        severity: "high",
      },
    ],
  };

  const missingFindings = analysis.missingFindings || [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md px-6 py-4 sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-300 hover:text-white bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/30 px-3 py-1.5 rounded-xl transition-all">
            <Home className="h-3.5 w-3.5 text-cyan-400" /> HomeScreen
          </Link>
          <div className="h-4 w-px bg-slate-800" />
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-cyan-400 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/build">
            <Button className="text-xs py-2 px-4">
              Fix & Build Tailored Portfolio &rarr;
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Analysis Results Content */}
      <main className="max-w-6xl mx-auto w-full p-6 sm:p-10 flex-1">
        {/* Header Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-widest mb-1">
              <Sparkles className="h-4 w-4" /> Executive Audit Findings
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Resume Analysis: {record?.fileName || "Uploaded Resume"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 flex items-center gap-2">
              <Target className="h-3.5 w-3.5 text-cyan-400" /> Target Role: <span className="text-slate-200 font-semibold">{record?.targetRole || "Software Engineer"}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            {record?.fileUrl && (
              <a
                href={record.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-700 flex items-center gap-2 transition-all"
              >
                View Original PDF <Download className="h-3.5 w-3.5 text-slate-400" />
              </a>
            )}
          </div>
        </div>

        {/* 1. Overall Executive Summary Card */}
        <div className="mb-10 rounded-2xl bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 border border-cyan-500/30 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          <h2 className="text-xs font-bold uppercase tracking-widest text-cyan-400 mb-3 flex items-center gap-2">
            <FileText className="h-4 w-4" /> Executive Summary & Positioning
          </h2>
          <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-light">
            {analysis.summary}
          </p>
        </div>

        {/* 2. Visual Analytics & Charts Section */}
        <AnalysisCharts
          findings={missingFindings}
          targetRole={record?.targetRole || "Software Engineer"}
          summary={analysis.summary}
        />

        {/* 2. What's Missing Section (Conditional Chip Cards) */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-amber-400" /> Targeted Missing Elements & Audits
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Showing {missingFindings.length} issue {missingFindings.length === 1 ? "category" : "categories"} requiring enhancement. Categories with zero defects are automatically omitted.
              </p>
            </div>
            
            <div className="text-xs font-semibold text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-full">
              {missingFindings.length} Active {missingFindings.length === 1 ? "Card" : "Cards"} Rendered
            </div>
          </div>

          {/* Conditional Chip List Renderer */}
          <FindingsChipList findings={missingFindings} />
        </section>

        {/* Action Callout */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-8 text-center backdrop-blur-xl">
          <h3 className="text-xl font-bold text-white mb-2">Transform Findings into a High-Converting Portfolio</h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto mb-6">
            Use our RAG-powered resume and portfolio builder to automatically fix keyword gaps and export modern ATS-ready resumes.
          </p>
          <Link href="/build">
            <Button className="py-3 px-8 text-sm">
              Launch RAG Builder with this Resume Context &rarr;
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
