"use client";

import React, { useMemo } from "react";
import { UserContextProfile } from "@/lib/ai/rag-chain";
import { ShieldCheck, Plus, CheckCircle2, AlertTriangle, Award, Zap } from "lucide-react";

interface ATSScoreMeterProps {
  profile: UserContextProfile;
  onInjectKeyword?: (keyword: string) => void;
}

export function ATSScoreMeter({ profile, onInjectKeyword }: ATSScoreMeterProps) {
  // Compute dynamic ATS score based on user profile structure & content quality
  const { score, grade, gradeColor, breakdown, recommendedKeywords } = useMemo(() => {
    let pts = 0;
    const checks: { label: string; pass: boolean; pts: number }[] = [];

    // 1. Core Contact Info (20 pts)
    const hasName = Boolean(profile.name && profile.name !== "Candidate Name" && profile.name.trim().length > 2);
    const hasContact = Boolean(profile.email || profile.phone);
    if (hasName) pts += 10;
    if (hasContact) pts += 10;
    checks.push({ label: "Contact Info & Identity", pass: hasName && hasContact, pts: hasName && hasContact ? 20 : 10 });

    // 2. Summary (15 pts)
    const summaryLen = profile.summary?.length || 0;
    const hasGoodSummary = summaryLen > 50;
    if (hasGoodSummary) pts += 15;
    else if (summaryLen > 0) pts += 8;
    checks.push({ label: "2-3 Sentence Impact Summary", pass: hasGoodSummary, pts: hasGoodSummary ? 15 : 8 });

    // 3. Work Experience & Quantified Metrics (25 pts)
    const expCount = profile.experiences?.length || 0;
    const bullets = (profile.experiences || []).flatMap((e) => e.bulletPoints || []);
    const hasMetrics = bullets.some((b) => /\d+%|\$\d+|\d+\s*ms|\d+\+/i.test(b));
    if (expCount > 0) pts += 15;
    if (hasMetrics) pts += 10;
    checks.push({ label: "Work Experience & Quantified Impact", pass: expCount > 0 && hasMetrics, pts: expCount > 0 ? (hasMetrics ? 25 : 15) : 0 });

    // 4. Projects (15 pts)
    const projCount = profile.projects?.length || 0;
    if (projCount >= 2) pts += 15;
    else if (projCount === 1) pts += 8;
    checks.push({ label: "2+ Production / Portfolio Projects", pass: projCount >= 2, pts: projCount >= 2 ? 15 : 8 });

    // 5. Categorized Skills (15 pts)
    const hasLangs = Boolean(profile.technicalSkills?.languages?.length);
    const hasFrameworks = Boolean(profile.technicalSkills?.frameworks?.length);
    const hasTools = Boolean(profile.technicalSkills?.tools?.length);
    const flatSkills = profile.skills?.length || 0;
    if (hasLangs && hasFrameworks && hasTools) pts += 15;
    else if (flatSkills >= 5) pts += 10;
    checks.push({ label: "Categorized Technical Skills Matrix", pass: hasLangs && hasFrameworks && hasTools, pts: hasLangs && hasFrameworks && hasTools ? 15 : 10 });

    // 6. Education & Certifications (10 pts)
    const eduCount = profile.education?.length || 0;
    if (eduCount > 0) pts += 10;
    checks.push({ label: "Education & Academic Credentials", pass: eduCount > 0, pts: eduCount > 0 ? 10 : 0 });

    const finalScore = Math.min(100, Math.max(0, pts));

    let g = "C";
    let color = "text-amber-400 border-amber-500/30 bg-amber-950/40";
    if (finalScore >= 90) {
      g = "A+ (90+)";
      color = "text-emerald-400 border-emerald-500/40 bg-emerald-950/40";
    } else if (finalScore >= 75) {
      g = "A (75+)";
      color = "text-cyan-400 border-cyan-500/40 bg-cyan-950/40";
    } else if (finalScore >= 60) {
      g = "B (60+)";
      color = "text-amber-400 border-amber-500/40 bg-amber-950/40";
    } else {
      g = "Needs Work";
      color = "text-rose-400 border-rose-500/40 bg-rose-950/40";
    }

    // High demand ATS keywords to recommend if missing
    const currentSkillsStr = JSON.stringify(profile).toLowerCase();
    const candidatePool = ["Docker", "Kubernetes", "CI/CD", "System Design", "TypeScript", "REST APIs", "GraphQL", "PostgreSQL", "Tailwind CSS", "Redis", "AWS", "Jest", "Microservices"];
    const missing = candidatePool.filter((k) => !currentSkillsStr.includes(k.toLowerCase())).slice(0, 6);

    return {
      score: finalScore,
      grade: g,
      gradeColor: color,
      breakdown: checks,
      recommendedKeywords: missing,
    };
  }, [profile]);

  return (
    <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 shadow-xl backdrop-blur-md space-y-3">
      {/* Gauge Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-cyan-400" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">Live ATS Score Gauge</span>
        </div>
        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${gradeColor}`}>
          Grade: {grade}
        </span>
      </div>

      {/* Progress Bar & Numerical Score */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-slate-400">ATS Pass Likelihood</span>
          <span className="text-cyan-300 font-bold font-mono text-sm">{score}%</span>
        </div>
        <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800 p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              score >= 90
                ? "bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_12px_rgba(16,185,129,0.5)]"
                : score >= 75
                ? "bg-gradient-to-r from-cyan-500 to-blue-500 shadow-[0_0_12px_rgba(6,182,212,0.5)]"
                : score >= 60
                ? "bg-gradient-to-r from-amber-500 to-orange-400"
                : "bg-gradient-to-r from-rose-600 to-red-500"
            }`}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>

      {/* Quick Inject Missing Keywords */}
      {recommendedKeywords.length > 0 && onInjectKeyword && (
        <div className="pt-2 border-t border-slate-800/80">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <Zap className="h-3 w-3 text-amber-400" /> Recommended Keywords (Click to Inject):
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {recommendedKeywords.map((kw) => (
              <button
                key={kw}
                onClick={() => onInjectKeyword(kw)}
                className="text-[10px] font-semibold text-slate-300 bg-slate-950 hover:bg-cyan-950/80 hover:text-cyan-300 border border-slate-800 hover:border-cyan-500/40 px-2 py-1 rounded-md transition-all flex items-center gap-1 group"
                title={`Add ${kw} to your technical skills`}
              >
                <Plus className="h-2.5 w-2.5 text-cyan-400 group-hover:scale-125 transition-transform" />
                {kw}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
