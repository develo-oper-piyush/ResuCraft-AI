"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  FileText,
  Plus,
  ExternalLink,
  ShieldCheck,
  Download,
  Trash2,
  ArrowRight,
  User,
  LogOut,
  Eye,
  X,
  FileCode,
  Maximize2,
  Home
} from "lucide-react";
import { Button } from "@/components/ui/stateful-button";
import { SkeletonCard } from "@/components/ui/skeleton";
import { createClient } from "@/lib/supabase/client";

interface PdfPreviewModalState {
  fileName: string;
  fileUrl: string;
  parsedText?: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<{ uploadedResumes: any[]; generatedResumes: any[] }>({
    uploadedResumes: [],
    generatedResumes: [],
  });
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("User");

  // PDF Preview Modal State
  const [previewModal, setPreviewModal] = useState<PdfPreviewModalState | null>(null);
  const [previewTab, setPreviewTab] = useState<"pdf" | "text">("pdf");

  useEffect(() => {
    // Fetch user name from Supabase auth
    const fetchUser = async () => {
      try {
        const supabase = createClient();
        if (!supabase) return;
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const name = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "User";
          setUserName(name);
        }
      } catch (err) {
        console.warn("Could not fetch user data:", err);
      }
    };
    fetchUser();

    // Fetch resumes
    fetch("/api/resumes")
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      if (supabase) {
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.warn("Sign out error:", err);
    } finally {
      router.push("/login");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md px-6 py-4 sticky top-0 z-30 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3 group">
          <img src="/ResuCraft.png" alt="ResuCraft AI" className="h-9 w-9 object-contain drop-shadow-[0_0_10px_rgba(56,189,248,0.4)] group-hover:scale-105 transition-transform" />
          <span className="font-bold text-lg text-white">
            Resu<span className="text-cyan-400">Craft</span> Dashboard
          </span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Return to HomeScreen Button */}
          <Link href="/">
            <button className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-300 hover:text-white bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/30 px-3 py-2 rounded-xl transition-all">
              <Home className="h-4 w-4 text-cyan-400" />
              <span className="hidden sm:inline">HomeScreen</span>
            </button>
          </Link>

          <Link href="/analyze">
            <Button variant="outline" className="text-xs py-2 px-3">
              Upload New PDF
            </Button>
          </Link>

          <Link href="/build">
            <Button className="text-xs py-2 px-3">
              <Plus className="h-4 w-4" /> Create Portfolio
            </Button>
          </Link>

          {/* Profile Redirect Button */}
          <Link href="/profile">
            <button className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 px-3 py-2 rounded-xl transition-all">
              <User className="h-4 w-4 text-cyan-400" />
              <span className="hidden sm:inline">Profile</span>
            </button>
          </Link>

          {/* Log Out Button */}
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-400 hover:text-rose-300 bg-rose-950/40 hover:bg-rose-900/50 border border-rose-500/30 px-3 py-2 rounded-xl transition-all"
            title="Log Out of Account"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Dashboard Content */}
      <main className="max-w-7xl mx-auto w-full p-6 sm:p-10 flex-1">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Welcome Back, {userName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Manage your uploaded resume audits, RAG profile memories, and exported portfolios.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-900/80 border border-slate-800 rounded-2xl p-3 px-5">
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Uploaded Audits</p>
              <p className="text-xl font-bold text-cyan-400">{data.uploadedResumes.length}</p>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Generated Resumes</p>
              <p className="text-xl font-bold text-blue-400">{data.generatedResumes.length}</p>
            </div>
          </div>
        </div>

        {/* Section 1: Uploaded Resumes & AI Audits */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="h-5 w-5 text-cyan-400" /> Uploaded Resumes & AI Scans
            </h2>
            <Link href="/analyze" className="text-xs text-cyan-400 hover:underline font-semibold flex items-center gap-1">
              Analyze New <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <SkeletonCard className="max-w-full" />
              <SkeletonCard className="max-w-full" />
              <SkeletonCard className="max-w-full" />
            </div>
          ) : data.uploadedResumes.length === 0 ? (
            <div className="p-10 text-center rounded-2xl bg-slate-900/40 border border-slate-800">
              <FileText className="h-10 w-10 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-300">No resumes uploaded yet</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Upload your PDF resume to run instant AI deficiency analysis and extract target keywords.
              </p>
              <Link href="/analyze" className="inline-block mt-4">
                <Button className="text-xs">Upload & Analyze</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.uploadedResumes.map((item) => (
                <div key={item.id} className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 flex flex-col justify-between hover:border-cyan-500/40 transition-colors">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/30 text-cyan-400">
                        {item.targetRole || "Software Engineer"}
                      </span>
                      <span className="text-[10px] text-slate-500">{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                    <h3 className="text-sm font-bold text-white truncate">{item.fileName}</h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-2">
                      {item.analysisJson?.summary || "AI Audit Complete"}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                    <Link href={`/analyze/${item.id}`} className="text-xs text-cyan-400 hover:underline font-semibold flex items-center gap-1">
                      View Report <ArrowRight className="h-3.5 w-3.5" />
                    </Link>

                    {/* VIEW PDF BUTTON (Opens Modal Window) */}
                    <button
                      onClick={() => {
                        setPreviewModal({
                          fileName: item.fileName,
                          fileUrl: item.fileUrl,
                          parsedText: item.parsedText,
                        });
                        setPreviewTab("pdf");
                      }}
                      className="text-xs text-slate-300 hover:text-cyan-400 font-semibold flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 hover:border-cyan-500/30 transition-all"
                    >
                      <Eye className="h-3.5 w-3.5 text-cyan-400" /> View PDF
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Section 2: Generated Resumes & Portfolios */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-400" /> Generated Portfolios & Exports
            </h2>
            <Link href="/build" className="text-xs text-blue-400 hover:underline font-semibold flex items-center gap-1">
              Create New <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <SkeletonCard className="max-w-full" />
              <SkeletonCard className="max-w-full" />
              <SkeletonCard className="max-w-full" />
            </div>
          ) : data.generatedResumes.length === 0 ? (
            <div className="p-10 text-center rounded-2xl bg-slate-900/40 border border-slate-800">
              <Sparkles className="h-10 w-10 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-300">No generated portfolios yet</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Use the RAG assistant builder to generate interactive portfolios and custom ATS resumes.
              </p>
              <Link href="/build" className="inline-block mt-4">
                <Button className="text-xs">Launch RAG Builder</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.generatedResumes.map((item) => (
                <div key={item.id} className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 flex flex-col justify-between hover:border-blue-500/40 transition-colors">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-950 border border-blue-500/30 text-blue-400">
                        {item.templateId}
                      </span>
                      <span className="text-[10px] text-slate-500">{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                    <h3 className="text-sm font-bold text-white truncate">{item.title}</h3>

                    {/* Mini resume preview */}
                    {item.contentJson && (
                      <div className="mt-2 p-2 rounded-lg bg-slate-950 border border-slate-800 text-[9px] text-slate-400 space-y-0.5 overflow-hidden max-h-20">
                        <div className="font-bold text-slate-300 truncate">{item.contentJson.name}</div>
                        <div className="truncate">{item.contentJson.targetRole}</div>
                        <div className="truncate opacity-60">{item.contentJson.skills?.slice(0, 5).join(" · ")}</div>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                    <Link href={`/build/${item.id}`} className="text-xs text-blue-400 hover:underline font-semibold flex items-center gap-1">
                      Edit Layout <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                    {item.exportUrl && (
                      <a href={item.exportUrl} target="_blank" rel="noreferrer" className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-semibold">
                        PDF Export <Download className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* ═══════════ PDF PREVIEW MODAL WINDOW ═══════════ */}
      {previewModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl overflow-hidden relative">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white truncate max-w-xs sm:max-w-md">
                    {previewModal.fileName}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono">PDF Preview & Extracted RAG Context</p>
                </div>
              </div>

              {/* Tabs & Header Controls */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 p-1 rounded-xl">
                  <button
                    onClick={() => setPreviewTab("pdf")}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                      previewTab === "pdf" ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Eye className="h-3.5 w-3.5" /> PDF Document
                  </button>
                  <button
                    onClick={() => setPreviewTab("text")}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                      previewTab === "text" ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <FileCode className="h-3.5 w-3.5" /> Parsed Text
                  </button>
                </div>

                {previewModal.fileUrl && (
                  <a
                    href={previewModal.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white transition-colors"
                    title="Open in New Tab"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}

                <button
                  onClick={() => setPreviewModal(null)}
                  className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-rose-400 transition-colors"
                  title="Close Modal"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 bg-slate-950 p-4 sm:p-6 overflow-hidden flex flex-col">
              {previewTab === "pdf" ? (
                previewModal.fileUrl ? (
                  <div className="w-full h-full rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 flex flex-col">
                    <iframe
                      src={previewModal.fileUrl}
                      className="w-full h-full border-0"
                      title={previewModal.fileName}
                    />
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-slate-500">
                    No PDF binary URL available. Switch to Parsed Text tab.
                  </div>
                )
              ) : (
                <div className="w-full h-full rounded-2xl border border-slate-800 bg-slate-900/80 p-6 overflow-y-auto font-mono text-xs text-slate-300 leading-relaxed space-y-2 select-text">
                  <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest mb-4">
                    // RAW PARSED RESUME TEXT FOR RAG PIPELINE
                  </div>
                  <pre className="whitespace-pre-wrap font-sans">{previewModal.parsedText || "No text extracted."}</pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
