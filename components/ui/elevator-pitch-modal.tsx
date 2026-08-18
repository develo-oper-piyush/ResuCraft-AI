"use client";

import React, { useState, useEffect } from "react";
import { UserContextProfile, ElevatorPitchResult } from "@/lib/ai/rag-chain";
import { Mic, X, Copy, Check, Loader2, Sparkles, Star, MessageSquare, ListCheck, Volume2 } from "lucide-react";

interface ElevatorPitchModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserContextProfile;
}

export function ElevatorPitchModal({ isOpen, onClose, profile }: ElevatorPitchModalProps) {
  const [activeTab, setActiveTab] = useState<"pitch" | "tmay" | "star" | "talking">("pitch");
  const [isLoading, setIsLoading] = useState(false);
  const [pitchData, setPitchData] = useState<ElevatorPitchResult | null>(null);
  const [copiedTab, setCopiedTab] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && !pitchData && !isLoading) {
      fetchElevatorPitch();
    }
  }, [isOpen]);

  const fetchElevatorPitch = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/elevator-pitch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile }),
      });
      const json = await res.json();
      if (json.success && json.pitchResult) {
        setPitchData(json.pitchResult);
      }
    } catch (err) {
      console.error("Failed to generate elevator pitch:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyText = (text: string, tabKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTab(tabKey);
    setTimeout(() => setCopiedTab(null), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden relative">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Mic className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                AI Elevator Pitch & Recruiter Script Generator
              </h3>
              <p className="text-xs text-slate-400">Candidate-specific pitch, interview responses, & STAR-method project stories</p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950 px-6 py-2 gap-2 overflow-x-auto">
          {[
            { key: "pitch", label: "🎙️ 60-Sec Pitch", icon: <Volume2 className="h-3.5 w-3.5" /> },
            { key: "tmay", label: "💬 'Tell Me About Yourself'", icon: <MessageSquare className="h-3.5 w-3.5" /> },
            { key: "star", label: "⭐ STAR Project Stories", icon: <Star className="h-3.5 w-3.5" /> },
            { key: "talking", label: "💡 Recruiter Talking Points", icon: <ListCheck className="h-3.5 w-3.5" /> },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === tab.key
                  ? "bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {isLoading ? (
            <div className="py-16 text-center space-y-3">
              <Loader2 className="h-8 w-8 text-cyan-400 animate-spin mx-auto" />
              <p className="text-xs font-bold text-slate-300">Synthesizing Recruiter Elevator Pitch & STAR Stories...</p>
              <p className="text-[10px] text-slate-500">Analyzing projects, metrics, and target role context</p>
            </div>
          ) : pitchData ? (
            <>
              {/* 🎙️ TAB 1: 60-Second Elevator Pitch */}
              {activeTab === "pitch" && (
                <div className="space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                      <Sparkles className="h-3.5 w-3.5 text-cyan-400" /> Spoken Pitch Teleprompter (~60 Seconds)
                    </span>
                    <button
                      onClick={() => handleCopyText(pitchData.elevatorPitch, "pitch")}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-cyan-300 border border-slate-700 flex items-center gap-1.5 transition-all"
                    >
                      {copiedTab === "pitch" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                      {copiedTab === "pitch" ? "Copied Pitch!" : "Copy Pitch"}
                    </button>
                  </div>

                  <div className="p-6 rounded-2xl bg-slate-950 border border-cyan-500/30 text-sm leading-relaxed text-slate-200 font-serif italic shadow-inner">
                    "{pitchData.elevatorPitch}"
                  </div>
                </div>
              )}

              {/* 💬 TAB 2: "Tell Me About Yourself" */}
              {activeTab === "tmay" && (
                <div className="space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                      <MessageSquare className="h-3.5 w-3.5 text-blue-400" /> Interview Intro Narrative (2-Minutes)
                    </span>
                    <button
                      onClick={() => handleCopyText(pitchData.tellMeAboutYourself, "tmay")}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-blue-300 border border-slate-700 flex items-center gap-1.5 transition-all"
                    >
                      {copiedTab === "tmay" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                      {copiedTab === "tmay" ? "Copied Script!" : "Copy Script"}
                    </button>
                  </div>

                  <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-xs leading-relaxed text-slate-300 whitespace-pre-line">
                    {pitchData.tellMeAboutYourself}
                  </div>
                </div>
              )}

              {/* ⭐ TAB 3: STAR-Method Behavioral Answers */}
              {activeTab === "star" && (
                <div className="space-y-5 animate-fade-in">
                  <p className="text-xs text-slate-400">
                    Project-based behavioral interview answers formatted using the **Situation, Task, Action, Result (STAR)** framework:
                  </p>

                  <div className="space-y-4">
                    {pitchData.starBehavioralAnswers.map((star, i) => (
                      <div key={i} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                          <h4 className="text-xs font-bold text-cyan-300 flex items-center gap-2">
                            <Star className="h-4 w-4 text-amber-400 fill-amber-400/20" /> Q{i + 1}: {star.question}
                          </h4>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800/60">
                            <span className="font-bold text-amber-400 block mb-1">S — Situation</span>
                            <span className="text-slate-300">{star.situation}</span>
                          </div>
                          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800/60">
                            <span className="font-bold text-blue-400 block mb-1">T — Task</span>
                            <span className="text-slate-300">{star.task}</span>
                          </div>
                          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800/60">
                            <span className="font-bold text-cyan-400 block mb-1">A — Action</span>
                            <span className="text-slate-300">{star.action}</span>
                          </div>
                          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800/60">
                            <span className="font-bold text-emerald-400 block mb-1">R — Result</span>
                            <span className="text-slate-300">{star.result}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 💡 TAB 4: Recruiter Key Talking Points */}
              {activeTab === "talking" && (
                <div className="space-y-4 animate-fade-in">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <ListCheck className="h-3.5 w-3.5 text-indigo-400" /> Recruiter Call Checklist
                  </span>

                  <div className="space-y-2">
                    {pitchData.keyTalkingPoints.map((point, i) => (
                      <div key={i} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-200 flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-cyan-400" />
                        <span>{point}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="py-10 text-center">
              <button onClick={fetchElevatorPitch} className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs">
                Retry Generation
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
