"use client";

import React, { useState } from "react";
import { UserContextProfile, JDMatchResult } from "@/lib/ai/rag-chain";
import { Target, Wand2, X, Loader2, Sparkles, CheckCircle2, ShieldAlert, ArrowRight } from "lucide-react";

interface JDMatcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserContextProfile;
  onUpdateProfile: (updated: UserContextProfile) => void;
}

export function JDMatcherModal({ isOpen, onClose, profile, onUpdateProfile }: JDMatcherModalProps) {
  const [jobDescription, setJobDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isTailoring, setIsTailoring] = useState(false);
  const [matchResult, setMatchResult] = useState<JDMatchResult | null>(null);

  if (!isOpen) return null;

  const handleAnalyzeMatch = async () => {
    if (!jobDescription.trim() || isAnalyzing) return;
    setIsAnalyzing(true);
    try {
      const res = await fetch("/api/jd-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile, jobDescription }),
      });
      const json = await res.json();
      if (json.success && json.matchResult) {
        setMatchResult(json.matchResult);
      }
    } catch (err) {
      console.error("Failed to analyze JD match:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleTailorResume = async () => {
    if (!jobDescription.trim() || isTailoring) return;
    setIsTailoring(true);
    try {
      const res = await fetch("/api/jd-tailor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile, jobDescription }),
      });
      const json = await res.json();
      if (json.success && json.profile) {
        onUpdateProfile(json.profile);
        onClose();
      }
    } catch (err) {
      console.error("Failed to tailor resume for JD:", err);
    } finally {
      setIsTailoring(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden relative">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">AI Job Description Matcher & One-Click Tailor</h3>
              <p className="text-xs text-slate-400">Paste job requirements to audit match score and auto-tailor resume content</p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Job Description Input Area */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Target Job Description (Paste Text):
            </label>
            <textarea
              rows={5}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the target job description text here (e.g., 'Senior Full Stack Engineer position requiring Next.js, Docker, TypeScript, AWS, and RESTful API experience...')"
              className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3.5 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={handleAnalyzeMatch}
              disabled={!jobDescription.trim() || isAnalyzing}
              className="flex-1 py-3 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-all disabled:opacity-40"
            >
              {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Target className="h-4 w-4 text-cyan-400" />}
              {isAnalyzing ? "Analyzing Match Score..." : "🎯 Calculate JD Match Score"}
            </button>

            <button
              onClick={handleTailorResume}
              disabled={!jobDescription.trim() || isTailoring}
              className="flex-1 py-3 px-5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-40 shadow-lg"
            >
              {isTailoring ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4 text-white" />}
              {isTailoring ? "Tailoring Content with AI..." : "✨ Tailor Resume for this Job"}
            </button>
          </div>

          {/* Match Audit Findings Display */}
          {matchResult && (
            <div className="space-y-4 pt-4 border-t border-slate-800 animate-fade-in">
              {/* Score Indicator */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-cyan-500/30 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">JD Match Score</p>
                  <p className="text-3xl font-black text-cyan-400 font-mono">{matchResult.matchScore}%</p>
                </div>

                <div className="text-right">
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300">
                    {matchResult.matchScore >= 80 ? "🔥 Excellent Target Match" : matchResult.matchScore >= 60 ? "⚡ Good Match (Minor Gaps)" : "⚠️ High Skill Gap"}
                  </span>
                </div>
              </div>

              {/* Skills Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Matching Skills */}
                <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
                  <p className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                    <CheckCircle2 className="h-4 w-4" /> Matching Job Skills ({matchResult.matchingKeywords.length})
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {matchResult.matchingKeywords.map((kw, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/40 text-[10px] font-semibold text-emerald-300">
                        ✓ {kw}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Missing Skills */}
                <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-2">
                  <p className="text-xs font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
                    <ShieldAlert className="h-4 w-4" /> Missing Key Requirements ({matchResult.missingKeywords.length})
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {matchResult.missingKeywords.map((kw, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-amber-950 border border-amber-500/40 text-[10px] font-semibold text-amber-300">
                        + {kw}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tailored Suggestions */}
              {matchResult.tailoredSuggestions.length > 0 && (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <p className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-cyan-400" /> Key Optimization Steps:
                  </p>
                  <ul className="space-y-1 text-xs text-slate-400">
                    {matchResult.tailoredSuggestions.map((sug, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <ArrowRight className="h-3.5 w-3.5 text-cyan-400 mt-0.5 shrink-0" />
                        <span>{sug}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
