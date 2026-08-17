"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UploadCloud, FileText, Sparkles, ArrowLeft, Loader2, Target } from "lucide-react";
import { Button } from "@/components/ui/stateful-button";
import { SkeletonDefault } from "@/components/ui/skeleton";

export default function AnalyzeUploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [targetRole, setTargetRole] = useState("Software Engineer");
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selected = e.dataTransfer.files[0];
      if (selected.type === "application/pdf" || selected.name.endsWith(".pdf") || selected.name.endsWith(".docx")) {
        setFile(selected);
        setError("");
      } else {
        setError("Please select a valid PDF or DOCX file.");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError("");
    }
  };

  const handleUploadAndAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please select or drop a PDF resume first.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("targetRole", targetRole);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to process resume");
      }

      router.push(`/analyze/${json.resume.id}`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred during resume processing.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(56,189,248,0.12),transparent_70%)] pointer-events-none" />

      <div className="w-full max-w-2xl relative z-10 glass-panel rounded-3xl p-8 sm:p-12 border border-slate-800 shadow-2xl">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-cyan-400 mb-6 transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
        </Link>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <img src="/ResuCraft.png" alt="ResuCraft AI" className="h-14 w-14 object-contain drop-shadow-[0_0_15px_rgba(56,189,248,0.5)]" />
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            AI Resume Audit Engine
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-md mx-auto">
            Upload your resume PDF for instant executive summary feedback, keyword gap analysis, and conditional ATS issue auditing.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-950/60 border border-rose-500/30 text-xs text-rose-300 text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleUploadAndAnalyze} className="space-y-6">
          {/* Target Role Field */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Target className="h-4 w-4 text-cyan-400" /> Target Position / Role
            </label>
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              required
              className="w-full rounded-xl bg-slate-900/90 border border-slate-800 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none transition-colors"
              placeholder="e.g. Senior Frontend Developer / Full Stack Engineer"
            />
          </div>

          {/* Drag and Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative rounded-2xl border-2 border-dashed p-8 sm:p-12 text-center transition-all cursor-pointer ${
              isDragging
                ? "border-cyan-400 bg-cyan-950/30 scale-[1.01]"
                : file
                ? "border-emerald-500/50 bg-emerald-950/20"
                : "border-slate-800 bg-slate-900/40 hover:border-slate-700"
            }`}
          >
            <input
              type="file"
              accept=".pdf,.docx"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />

            {file ? (
              <div className="flex flex-col items-center">
                <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3">
                  <FileText className="h-6 w-6" />
                </div>
                <p className="text-sm font-bold text-white">{file.name}</p>
                <p className="text-xs text-slate-400 mt-1">{(file.size / (1024 * 1024)).toFixed(2)} MB • Ready for parsing</p>
                <span className="text-xs text-cyan-400 underline font-semibold mt-3">Click or drop to replace</span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="h-12 w-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 mb-3">
                  <UploadCloud className="h-6 w-6" />
                </div>
                <p className="text-sm font-bold text-slate-200">
                  Drag & drop your resume PDF here, or <span className="text-cyan-400 underline">browse</span>
                </p>
                <p className="text-xs text-slate-500 mt-1">Supports PDF or DOCX up to 10MB</p>
              </div>
            )}
          </div>

          <Button type="submit" disabled={!file || loading} className="w-full py-3.5 text-base">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" /> Processing & Extracting Text...
              </span>
            ) : (
              "Analyze Resume & Generate Feedback"
            )}
          </Button>

          {loading && (
            <div className="pt-6 border-t border-slate-800 space-y-4">
              <p className="text-xs font-bold uppercase tracking-wider text-cyan-400">Parsing PDF & Synthesizing AI Report...</p>
              <SkeletonDefault className="max-w-full" />
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
