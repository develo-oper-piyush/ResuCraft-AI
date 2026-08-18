"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Sparkles, ArrowLeft, Send, Download, Layout, FileType, RefreshCw, Eye, Edit3, Check, Loader2, Plus, Trash2, Wand2, Code, Palette } from "lucide-react";
import { UserContextProfile, extractIdentityFromResumeText } from "@/lib/ai/rag-chain";
import { ModernMinimalTemplate, TechDeveloperTemplate, InteractivePortfolioTemplate, LatexResumeTemplate } from "@/components/ui/resume-templates";
import { Button } from "@/components/ui/stateful-button";
import { SkeletonText } from "@/components/ui/skeleton";
import { createClient } from "@/lib/supabase/client";

export default function BuilderWorkspacePage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const [templateId, setTemplateId] = useState(searchParams?.get("template") || "latex-overleaf");
  const [editMode, setEditMode] = useState(false);
  const [profile, setProfile] = useState<UserContextProfile>({
    name: "",
    email: "",
    phone: "",
    targetRole: "",
    summary: "",
    location: "",
    linkedin: "",
    github: "",
    leetcode: "",
    portfolio: "",
    skills: [],
    technicalSkills: { languages: [], frameworks: [], tools: [] },
    experiences: [],
    projects: [],
    education: [],
    achievements: [],
    certifications: [],
    activities: [],
    hackathons: [],
  });

  const [chatPrompt, setChatPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "form">("form");



  // ─── Fetch authenticated user data & uploaded resume context on mount ───
  useEffect(() => {
    const fetchWorkspaceData = async () => {
      let authName = "";
      let authEmail = "";

      try {
        const supabase = createClient();
        if (supabase) {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            authName = user.user_metadata?.full_name || user.user_metadata?.name || "";
            authEmail = user.email || "";
          }
        }
      } catch (err) {
        console.warn("Could not fetch auth user:", err);
      }

      try {
        const res = await fetch("/api/resumes");
        const json = await res.json();
        const routeId = params?.id as string;

        // 1. If opening an existing generated resume
        const matchingGen = json.generatedResumes?.find((r: any) => r.id === routeId);
        if (matchingGen?.contentJson) {
          if (matchingGen.templateId) setTemplateId(matchingGen.templateId);
          setProfile({
            ...matchingGen.contentJson,
            name: matchingGen.contentJson.name || authName,
            email: matchingGen.contentJson.email || authEmail,
          });
          return;
        }

        // 2. Otherwise find uploaded resume context
        const matchingUpload = json.uploadedResumes?.find((r: any) => r.id === routeId) || json.uploadedResumes?.[0];
        if (matchingUpload) {
          const parsedText = matchingUpload.parsedText || "";
          const extracted = extractIdentityFromResumeText(parsedText);

          setProfile((prev) => ({
            ...prev,
            uploadedResumeText: parsedText,
            name: prev.name || extracted.name || authName || "",
            email: prev.email || extracted.email || authEmail || "",
            phone: prev.phone || extracted.phone || "",
            location: prev.location || extracted.location || "",
            targetRole: prev.targetRole || matchingUpload.targetRole || "",
          }));
        } else {
          setProfile((prev) => ({
            ...prev,
            name: prev.name || authName,
            email: prev.email || authEmail,
          }));
        }
      } catch (err) {
        console.warn("Could not fetch resumes data:", err);
        if (authName || authEmail) {
          setProfile((prev) => ({ ...prev, name: prev.name || authName, email: prev.email || authEmail }));
        }
      }
    };

    fetchWorkspaceData();
  }, [params?.id]);

  // ─── Handle inline field edits from contentEditable ───
  const handleFieldChange = useCallback((path: string, value: any) => {
    setProfile((prev) => {
      const updated = { ...prev };
      const parts = path.split(".");
      let target: any = updated;
      for (let i = 0; i < parts.length - 1; i++) {
        const key = isNaN(Number(parts[i])) ? parts[i] : Number(parts[i]);
        if (Array.isArray(target)) {
          target = [...target];
          (updated as any)[parts[i - 1]] = target;
        }
        target = target[key];
      }
      const lastKey = parts[parts.length - 1];
      if (Array.isArray(target)) {
        target[Number(lastKey)] = value;
      } else {
        target[lastKey] = value;
      }
      return { ...updated };
    });
  }, []);

  // ─── AI RAG Prompt Handler ───
  const handleSendRAGPrompt = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatPrompt.trim() || isGenerating) return;

    const userMsg = chatPrompt.trim();
    setChatPrompt("");
    setIsGenerating(true);

    try {
      const res = await fetch("/api/rag/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile, prompt: userMsg }),
      });

      const json = await res.json();
      if (json.success && json.profile) {
        setProfile(json.profile);
      }
    } catch (err) {
      console.error("Failed to generate content with RAG:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  // ─── Generate Complete Resume with AI ───
  const handleGenerateComplete = async () => {
    setIsGenerating(true);
    try {
      const prompt = `Generate a COMPLETE professional resume for ${profile.name || "the user"} targeting a ${profile.targetRole || "Software Developer"} role. Include ALL sections: professional summary, education, work experience with quantified bullet points, 4-6 projects with tech stacks and achievements, technical skills categorized by languages/frameworks/tools, 3-5 achievements, relevant certifications, co-curricular activities, and hackathons. Make everything specific, ATS-optimized, and achievement-oriented with strong action verbs and metrics.`;

      const res = await fetch("/api/rag/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile, prompt }),
      });

      const json = await res.json();
      if (json.success && json.profile) {
        setProfile(json.profile);
      }
    } catch (err) {
      console.error("Failed to generate complete resume:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  // ─── PDF Export ───
  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const element = document.getElementById("resume-export-target");
      if (!element) throw new Error("Resume element target not found");

      const html2pdfModule = (await import("html2pdf.js")).default;
      const opt = {
        margin: [0.2, 0.2, 0.2, 0.2],
        filename: `${profile.name || "Resume"}_Export.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: "in", format: "letter", orientation: "portrait" as const },
      };

      const pdfBlob = await html2pdfModule().from(element).set(opt).outputPdf("datauristring");

      await fetch("/api/resumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `${profile.name || "Resume"} - ${profile.targetRole || "Resume"}`,
          templateId,
          contentJson: profile,
          pdfDataUrl: pdfBlob,
        }),
      });

      html2pdfModule().from(element).set(opt).save();
    } catch (err) {
      console.error("PDF export error:", err);
      window.print();
    } finally {
      setIsExporting(false);
    }
  };

  // ─── Form Section Helpers ───
  const addExperience = () => {
    setProfile((p) => ({
      ...p,
      experiences: [...(p.experiences || []), { company: "", role: "", duration: "", location: "", bulletPoints: [""] }],
    }));
  };
  const removeExperience = (idx: number) => {
    setProfile((p) => ({ ...p, experiences: (p.experiences || []).filter((_, i) => i !== idx) }));
  };
  const addProject = () => {
    setProfile((p) => ({
      ...p,
      projects: [...(p.projects || []), { title: "", description: "", techStack: [], link: "", bulletPoints: [""] }],
    }));
  };
  const removeProject = (idx: number) => {
    setProfile((p) => ({ ...p, projects: (p.projects || []).filter((_, i) => i !== idx) }));
  };
  const addEducation = () => {
    setProfile((p) => ({
      ...p,
      education: [...(p.education || []), { institution: "", degree: "", year: "", cgpa: "", location: "" }],
    }));
  };
  const removeEducation = (idx: number) => {
    setProfile((p) => ({ ...p, education: (p.education || []).filter((_, i) => i !== idx) }));
  };
  const addCertification = () => {
    setProfile((p) => ({
      ...p,
      certifications: [...(p.certifications || []), { name: "", issuer: "", link: "", date: "" }],
    }));
  };
  const removeCertification = (idx: number) => {
    setProfile((p) => ({ ...p, certifications: (p.certifications || []).filter((_, i) => i !== idx) }));
  };
  const addActivity = () => {
    setProfile((p) => ({
      ...p,
      activities: [...(p.activities || []), { name: "", institution: "", duration: "", description: "" }],
    }));
  };
  const removeActivity = (idx: number) => {
    setProfile((p) => ({ ...p, activities: (p.activities || []).filter((_, i) => i !== idx) }));
  };

  // ─── Shared input style ───
  const inputCls = "w-full rounded-lg bg-slate-950 border border-slate-800 p-2 text-xs text-white focus:border-cyan-500 focus:outline-none placeholder-slate-500";
  const labelCls = "block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1";
  const sectionTitleCls = "text-xs font-bold text-white flex items-center gap-2 mb-2 mt-4";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      {/* Top Header Controls */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-4 py-3 sticky top-0 z-40 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-cyan-400 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Dashboard
          </Link>
          <div className="h-4 w-px bg-slate-800 hidden sm:block" />
          <h1 className="text-sm font-bold text-white hidden sm:block">RAG Workspace</h1>
        </div>

        {/* Template Selector Switcher */}
        <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-xl p-1 overflow-x-auto">
          {[
            { id: "latex-overleaf", label: "LaTeX", icon: <FileType className="h-3 w-3" /> },
            { id: "modern-minimal", label: "Minimal", icon: <Layout className="h-3 w-3" /> },
            { id: "tech-developer", label: "Tech CLI", icon: <Code className="h-3 w-3" /> },
            { id: "interactive-portfolio", label: "Portfolio", icon: <Palette className="h-3 w-3" /> },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTemplateId(t.id)}
              className={`text-[10px] font-semibold px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1 whitespace-nowrap ${
                templateId === t.id ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40" : "text-slate-400 hover:text-white"
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {/* Edit Mode Toggle */}
          <button
            onClick={() => setEditMode(!editMode)}
            className={`text-[10px] font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 border ${
              editMode
                ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                : "text-slate-400 hover:text-white border-slate-800"
            }`}
          >
            <Edit3 className="h-3 w-3" /> {editMode ? "Editing" : "Edit"}
          </button>

          <Button onClick={handleExportPDF} disabled={isExporting} className="text-xs py-2 px-3">
            {isExporting ? (
              <span className="flex items-center gap-1.5">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Exporting...
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <Download className="h-3.5 w-3.5" /> PDF
              </span>
            )}
          </Button>
        </div>
      </header>

      {/* Split Pane Main Layout */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0">
        {/* Left Pane: AI + Form (5 cols) */}
        <div className="lg:col-span-5 border-r border-slate-800 bg-slate-900/50 flex flex-col h-[calc(100vh-53px)] overflow-hidden">
          {/* Tab Headers */}
          <div className="flex border-b border-slate-800 bg-slate-900 px-3 py-2 gap-2">
            <button
              onClick={() => setActiveTab("chat")}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2 ${
                activeTab === "chat" ? "bg-cyan-950/80 text-cyan-300 border border-cyan-500/30" : "text-slate-400 hover:text-white"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" /> AI Assistant
            </button>
            <button
              onClick={() => setActiveTab("form")}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2 ${
                activeTab === "form" ? "bg-cyan-950/80 text-cyan-300 border border-cyan-500/30" : "text-slate-400 hover:text-white"
              }`}
            >
              <Edit3 className="h-3.5 w-3.5" /> Manual Editor
            </button>
          </div>

          {activeTab === "chat" ? (
            <div className="flex-1 flex flex-col justify-between p-4 overflow-hidden">
              <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-xs text-cyan-200">
                  <div className="font-bold flex items-center gap-2 mb-1">
                    <Sparkles className="h-4 w-4 text-cyan-400" /> RAG Context Memory Engaged
                  </div>
                  Instruct the AI to generate sections, revise content, add quantified metrics, or completely rewrite your resume. Context is preserved automatically.
                </div>

                {/* Generate Complete Resume Button */}
                <button
                  onClick={handleGenerateComplete}
                  disabled={isGenerating}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-xs font-bold flex items-center justify-center gap-2 hover:from-cyan-500 hover:to-blue-500 transition-all disabled:opacity-50"
                >
                  <Wand2 className="h-4 w-4" />
                  {isGenerating ? "Generating Complete Resume..." : "✨ Generate Complete Resume with AI"}
                </button>

                {isGenerating && (
                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                    <SkeletonText className="w-full" />
                  </div>
                )}

                {/* Quick Prompt Shortcuts */}
                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Quick Prompt Shortcuts</p>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      "Add 3 more projects with bullet points and tech stacks",
                      "Add quantified metrics to all experience bullet points",
                      "Rewrite summary for a Senior Full Stack Developer role",
                      "Add competitive programming achievements and LeetCode stats",
                      "Generate 5 relevant certifications with dates",
                      "Add co-curricular activities and hackathon participation",
                      "Categorize skills into Languages, Frameworks, and Tools",
                      "Add education details with CGPA and location",
                    ].map((shortcut, idx) => (
                      <button
                        key={idx}
                        onClick={() => setChatPrompt(shortcut)}
                        className="text-[10px] text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg px-2 py-1.5 text-left transition-colors"
                      >
                        + {shortcut}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Chat Input Bar */}
              <form onSubmit={handleSendRAGPrompt} className="mt-3 pt-3 border-t border-slate-800">
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={chatPrompt}
                    onChange={(e) => setChatPrompt(e.target.value)}
                    disabled={isGenerating}
                    placeholder="Tell AI e.g. 'Add Docker and Kubernetes to my skills'..."
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 pl-4 pr-12 py-3 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!chatPrompt.trim() || isGenerating}
                    className="absolute right-2 p-2 rounded-lg bg-cyan-500 text-slate-950 disabled:opacity-40 hover:bg-cyan-400 transition-colors"
                  >
                    {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* ═══════════ COMPREHENSIVE FORM EDITOR ═══════════ */
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {/* ─── Personal Info ─── */}
              <p className={sectionTitleCls}>👤 Personal Information</p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={labelCls}>Full Name</label>
                  <input type="text" value={profile.name || ""} onChange={(e) => setProfile({ ...profile, name: e.target.value })} className={inputCls} placeholder="Piyush Chaudhary" />
                </div>
                <div>
                  <label className={labelCls}>Target Role</label>
                  <input type="text" value={profile.targetRole || ""} onChange={(e) => setProfile({ ...profile, targetRole: e.target.value })} className={inputCls} placeholder="Full Stack Developer" />
                </div>
                <div>
                  <label className={labelCls}>Email</label>
                  <input type="email" value={profile.email || ""} onChange={(e) => setProfile({ ...profile, email: e.target.value })} className={inputCls} placeholder="email@domain.com" />
                </div>
                <div>
                  <label className={labelCls}>Phone</label>
                  <input type="text" value={profile.phone || ""} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} className={inputCls} placeholder="+91 XXXXXXXXXX" />
                </div>
                <div>
                  <label className={labelCls}>Location</label>
                  <input type="text" value={profile.location || ""} onChange={(e) => setProfile({ ...profile, location: e.target.value })} className={inputCls} placeholder="City, Country" />
                </div>
              </div>

              {/* ─── Links ─── */}
              <p className={sectionTitleCls}>🔗 Social Links</p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={labelCls}>LinkedIn</label>
                  <input type="text" value={profile.linkedin || ""} onChange={(e) => setProfile({ ...profile, linkedin: e.target.value })} className={inputCls} placeholder="linkedin.com/in/username" />
                </div>
                <div>
                  <label className={labelCls}>GitHub</label>
                  <input type="text" value={profile.github || ""} onChange={(e) => setProfile({ ...profile, github: e.target.value })} className={inputCls} placeholder="github.com/username" />
                </div>
                <div>
                  <label className={labelCls}>LeetCode</label>
                  <input type="text" value={profile.leetcode || ""} onChange={(e) => setProfile({ ...profile, leetcode: e.target.value })} className={inputCls} placeholder="leetcode.com/username" />
                </div>
                <div>
                  <label className={labelCls}>Portfolio</label>
                  <input type="text" value={profile.portfolio || ""} onChange={(e) => setProfile({ ...profile, portfolio: e.target.value })} className={inputCls} placeholder="portfolio.vercel.app" />
                </div>
              </div>

              {/* ─── Summary ─── */}
              <p className={sectionTitleCls}>📝 Professional Summary</p>
              <textarea rows={3} value={profile.summary || ""} onChange={(e) => setProfile({ ...profile, summary: e.target.value })} className={inputCls} placeholder="2-3 sentence professional summary..." />

              {/* ─── Technical Skills ─── */}
              <p className={sectionTitleCls}>💻 Technical Skills</p>
              <div>
                <label className={labelCls}>Languages (comma separated)</label>
                <input type="text" value={profile.technicalSkills?.languages?.join(", ") || ""} onChange={(e) => setProfile({ ...profile, technicalSkills: { ...profile.technicalSkills, languages: e.target.value.split(",").map(s => s.trim()).filter(Boolean) } })} className={inputCls} placeholder="JavaScript, TypeScript, Python" />
              </div>
              <div>
                <label className={labelCls}>Frameworks & Libraries</label>
                <input type="text" value={profile.technicalSkills?.frameworks?.join(", ") || ""} onChange={(e) => setProfile({ ...profile, technicalSkills: { ...profile.technicalSkills, frameworks: e.target.value.split(",").map(s => s.trim()).filter(Boolean) } })} className={inputCls} placeholder="React, Next.js, Express.js" />
              </div>
              <div>
                <label className={labelCls}>Developer Tools</label>
                <input type="text" value={profile.technicalSkills?.tools?.join(", ") || ""} onChange={(e) => setProfile({ ...profile, technicalSkills: { ...profile.technicalSkills, tools: e.target.value.split(",").map(s => s.trim()).filter(Boolean) } })} className={inputCls} placeholder="Git, GitHub, VS Code" />
              </div>

              {/* ─── Education ─── */}
              <div className="flex items-center justify-between">
                <p className={sectionTitleCls}>🎓 Education</p>
                <button onClick={addEducation} className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1"><Plus className="h-3 w-3" /> Add</button>
              </div>
              {(profile.education || []).map((edu, i) => (
                <div key={i} className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2 relative">
                  <button onClick={() => removeEducation(i)} className="absolute top-2 right-2 text-slate-500 hover:text-rose-400"><Trash2 className="h-3 w-3" /></button>
                  <div className="grid grid-cols-2 gap-2">
                    <div><label className={labelCls}>Institution</label><input type="text" value={edu.institution} onChange={(e) => { const upd = [...(profile.education || [])]; upd[i] = { ...upd[i], institution: e.target.value }; setProfile({ ...profile, education: upd }); }} className={inputCls} /></div>
                    <div><label className={labelCls}>Degree</label><input type="text" value={edu.degree} onChange={(e) => { const upd = [...(profile.education || [])]; upd[i] = { ...upd[i], degree: e.target.value }; setProfile({ ...profile, education: upd }); }} className={inputCls} /></div>
                    <div><label className={labelCls}>Duration</label><input type="text" value={edu.year} onChange={(e) => { const upd = [...(profile.education || [])]; upd[i] = { ...upd[i], year: e.target.value }; setProfile({ ...profile, education: upd }); }} className={inputCls} /></div>
                    <div><label className={labelCls}>Location</label><input type="text" value={edu.location || ""} onChange={(e) => { const upd = [...(profile.education || [])]; upd[i] = { ...upd[i], location: e.target.value }; setProfile({ ...profile, education: upd }); }} className={inputCls} /></div>
                  </div>
                </div>
              ))}

              {/* ─── Experience ─── */}
              <div className="flex items-center justify-between">
                <p className={sectionTitleCls}>💼 Experience</p>
                <button onClick={addExperience} className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1"><Plus className="h-3 w-3" /> Add</button>
              </div>
              {(profile.experiences || []).map((exp, i) => (
                <div key={i} className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2 relative">
                  <button onClick={() => removeExperience(i)} className="absolute top-2 right-2 text-slate-500 hover:text-rose-400"><Trash2 className="h-3 w-3" /></button>
                  <div className="grid grid-cols-2 gap-2">
                    <div><label className={labelCls}>Company</label><input type="text" value={exp.company} onChange={(e) => { const upd = [...(profile.experiences || [])]; upd[i] = { ...upd[i], company: e.target.value }; setProfile({ ...profile, experiences: upd }); }} className={inputCls} /></div>
                    <div><label className={labelCls}>Role</label><input type="text" value={exp.role} onChange={(e) => { const upd = [...(profile.experiences || [])]; upd[i] = { ...upd[i], role: e.target.value }; setProfile({ ...profile, experiences: upd }); }} className={inputCls} /></div>
                    <div><label className={labelCls}>Duration</label><input type="text" value={exp.duration} onChange={(e) => { const upd = [...(profile.experiences || [])]; upd[i] = { ...upd[i], duration: e.target.value }; setProfile({ ...profile, experiences: upd }); }} className={inputCls} /></div>
                    <div><label className={labelCls}>Location</label><input type="text" value={exp.location || ""} onChange={(e) => { const upd = [...(profile.experiences || [])]; upd[i] = { ...upd[i], location: e.target.value }; setProfile({ ...profile, experiences: upd }); }} className={inputCls} /></div>
                  </div>
                  <div><label className={labelCls}>Certificate Link</label><input type="text" value={exp.certificate || ""} onChange={(e) => { const upd = [...(profile.experiences || [])]; upd[i] = { ...upd[i], certificate: e.target.value }; setProfile({ ...profile, experiences: upd }); }} className={inputCls} placeholder="bit.ly/certificate" /></div>
                  <div>
                    <div className="flex items-center justify-between">
                      <label className={labelCls}>Bullet Points</label>
                      <button onClick={() => { const upd = [...(profile.experiences || [])]; upd[i] = { ...upd[i], bulletPoints: [...upd[i].bulletPoints, ""] }; setProfile({ ...profile, experiences: upd }); }} className="text-[10px] text-cyan-400 hover:text-cyan-300">+ Add Bullet</button>
                    </div>
                    {exp.bulletPoints.map((bp, j) => (
                      <div key={j} className="flex items-start gap-1 mb-1">
                        <span className="text-slate-500 text-xs mt-2">•</span>
                        <input type="text" value={bp} onChange={(e) => { const upd = [...(profile.experiences || [])]; upd[i] = { ...upd[i], bulletPoints: upd[i].bulletPoints.map((b, bi) => bi === j ? e.target.value : b) }; setProfile({ ...profile, experiences: upd }); }} className={`${inputCls} flex-1`} />
                        <button onClick={() => { const upd = [...(profile.experiences || [])]; upd[i] = { ...upd[i], bulletPoints: upd[i].bulletPoints.filter((_, bi) => bi !== j) }; setProfile({ ...profile, experiences: upd }); }} className="text-slate-500 hover:text-rose-400 mt-2"><Trash2 className="h-3 w-3" /></button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* ─── Projects ─── */}
              <div className="flex items-center justify-between">
                <p className={sectionTitleCls}>🚀 Projects</p>
                <button onClick={addProject} className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1"><Plus className="h-3 w-3" /> Add</button>
              </div>
              {(profile.projects || []).map((proj, i) => (
                <div key={i} className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2 relative">
                  <button onClick={() => removeProject(i)} className="absolute top-2 right-2 text-slate-500 hover:text-rose-400"><Trash2 className="h-3 w-3" /></button>
                  <div className="grid grid-cols-2 gap-2">
                    <div><label className={labelCls}>Title</label><input type="text" value={proj.title} onChange={(e) => { const upd = [...(profile.projects || [])]; upd[i] = { ...upd[i], title: e.target.value }; setProfile({ ...profile, projects: upd }); }} className={inputCls} /></div>
                    <div><label className={labelCls}>Link</label><input type="text" value={proj.link || ""} onChange={(e) => { const upd = [...(profile.projects || [])]; upd[i] = { ...upd[i], link: e.target.value }; setProfile({ ...profile, projects: upd }); }} className={inputCls} placeholder="bit.ly/project" /></div>
                  </div>
                  <div><label className={labelCls}>Tech Stack (comma separated)</label><input type="text" value={proj.techStack.join(", ")} onChange={(e) => { const upd = [...(profile.projects || [])]; upd[i] = { ...upd[i], techStack: e.target.value.split(",").map(s => s.trim()).filter(Boolean) }; setProfile({ ...profile, projects: upd }); }} className={inputCls} /></div>
                  <div>
                    <div className="flex items-center justify-between">
                      <label className={labelCls}>Bullet Points</label>
                      <button onClick={() => { const upd = [...(profile.projects || [])]; upd[i] = { ...upd[i], bulletPoints: [...(upd[i].bulletPoints || []), ""] }; setProfile({ ...profile, projects: upd }); }} className="text-[10px] text-cyan-400 hover:text-cyan-300">+ Add Bullet</button>
                    </div>
                    {(proj.bulletPoints || []).map((bp, j) => (
                      <div key={j} className="flex items-start gap-1 mb-1">
                        <span className="text-slate-500 text-xs mt-2">•</span>
                        <input type="text" value={bp} onChange={(e) => { const upd = [...(profile.projects || [])]; upd[i] = { ...upd[i], bulletPoints: (upd[i].bulletPoints || []).map((b, bi) => bi === j ? e.target.value : b) }; setProfile({ ...profile, projects: upd }); }} className={`${inputCls} flex-1`} />
                        <button onClick={() => { const upd = [...(profile.projects || [])]; upd[i] = { ...upd[i], bulletPoints: (upd[i].bulletPoints || []).filter((_, bi) => bi !== j) }; setProfile({ ...profile, projects: upd }); }} className="text-slate-500 hover:text-rose-400 mt-2"><Trash2 className="h-3 w-3" /></button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* ─── Achievements ─── */}
              <div className="flex items-center justify-between">
                <p className={sectionTitleCls}>🏆 Achievements</p>
                <button onClick={() => setProfile((p) => ({ ...p, achievements: [...(p.achievements || []), ""] }))} className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1"><Plus className="h-3 w-3" /> Add</button>
              </div>
              {(profile.achievements || []).map((a, i) => (
                <div key={i} className="flex items-start gap-1 mb-1">
                  <span className="text-slate-500 text-xs mt-2">•</span>
                  <input type="text" value={a} onChange={(e) => { const upd = [...(profile.achievements || [])]; upd[i] = e.target.value; setProfile({ ...profile, achievements: upd }); }} className={`${inputCls} flex-1`} />
                  <button onClick={() => setProfile((p) => ({ ...p, achievements: (p.achievements || []).filter((_, j) => j !== i) }))} className="text-slate-500 hover:text-rose-400 mt-2"><Trash2 className="h-3 w-3" /></button>
                </div>
              ))}

              {/* ─── Certifications ─── */}
              <div className="flex items-center justify-between">
                <p className={sectionTitleCls}>📜 Certifications</p>
                <button onClick={addCertification} className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1"><Plus className="h-3 w-3" /> Add</button>
              </div>
              {(profile.certifications || []).map((cert, i) => (
                <div key={i} className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2 relative">
                  <button onClick={() => removeCertification(i)} className="absolute top-2 right-2 text-slate-500 hover:text-rose-400"><Trash2 className="h-3 w-3" /></button>
                  <div className="grid grid-cols-2 gap-2">
                    <div><label className={labelCls}>Name</label><input type="text" value={cert.name} onChange={(e) => { const upd = [...(profile.certifications || [])]; upd[i] = { ...upd[i], name: e.target.value }; setProfile({ ...profile, certifications: upd }); }} className={inputCls} /></div>
                    <div><label className={labelCls}>Issuer</label><input type="text" value={cert.issuer} onChange={(e) => { const upd = [...(profile.certifications || [])]; upd[i] = { ...upd[i], issuer: e.target.value }; setProfile({ ...profile, certifications: upd }); }} className={inputCls} /></div>
                    <div><label className={labelCls}>Certificate Link</label><input type="text" value={cert.link || ""} onChange={(e) => { const upd = [...(profile.certifications || [])]; upd[i] = { ...upd[i], link: e.target.value }; setProfile({ ...profile, certifications: upd }); }} className={inputCls} /></div>
                    <div><label className={labelCls}>Date</label><input type="text" value={cert.date || ""} onChange={(e) => { const upd = [...(profile.certifications || [])]; upd[i] = { ...upd[i], date: e.target.value }; setProfile({ ...profile, certifications: upd }); }} className={inputCls} placeholder="Mar 2026" /></div>
                  </div>
                </div>
              ))}

              {/* ─── Activities ─── */}
              <div className="flex items-center justify-between">
                <p className={sectionTitleCls}>🎯 Co-Curricular Activities</p>
                <button onClick={addActivity} className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1"><Plus className="h-3 w-3" /> Add</button>
              </div>
              {(profile.activities || []).map((act, i) => (
                <div key={i} className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2 relative">
                  <button onClick={() => removeActivity(i)} className="absolute top-2 right-2 text-slate-500 hover:text-rose-400"><Trash2 className="h-3 w-3" /></button>
                  <div className="grid grid-cols-2 gap-2">
                    <div><label className={labelCls}>Name</label><input type="text" value={act.name} onChange={(e) => { const upd = [...(profile.activities || [])]; upd[i] = { ...upd[i], name: e.target.value }; setProfile({ ...profile, activities: upd }); }} className={inputCls} /></div>
                    <div><label className={labelCls}>Institution</label><input type="text" value={act.institution} onChange={(e) => { const upd = [...(profile.activities || [])]; upd[i] = { ...upd[i], institution: e.target.value }; setProfile({ ...profile, activities: upd }); }} className={inputCls} /></div>
                    <div><label className={labelCls}>Duration</label><input type="text" value={act.duration || ""} onChange={(e) => { const upd = [...(profile.activities || [])]; upd[i] = { ...upd[i], duration: e.target.value }; setProfile({ ...profile, activities: upd }); }} className={inputCls} /></div>
                    <div><label className={labelCls}>Description</label><input type="text" value={act.description || ""} onChange={(e) => { const upd = [...(profile.activities || [])]; upd[i] = { ...upd[i], description: e.target.value }; setProfile({ ...profile, activities: upd }); }} className={inputCls} /></div>
                  </div>
                </div>
              ))}

              {/* ─── Hackathons ─── */}
              <div className="flex items-center justify-between">
                <p className={sectionTitleCls}>⚡ Hackathons</p>
                <button onClick={() => setProfile((p) => ({ ...p, hackathons: [...(p.hackathons || []), ""] }))} className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1"><Plus className="h-3 w-3" /> Add</button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(profile.hackathons || []).map((h, i) => (
                  <div key={i} className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1">
                    <input type="text" value={h} onChange={(e) => { const upd = [...(profile.hackathons || [])]; upd[i] = e.target.value; setProfile({ ...profile, hackathons: upd }); }} className="bg-transparent text-xs text-white outline-none w-32" />
                    <button onClick={() => setProfile((p) => ({ ...p, hackathons: (p.hackathons || []).filter((_, j) => j !== i) }))} className="text-slate-500 hover:text-rose-400"><Trash2 className="h-2.5 w-2.5" /></button>
                  </div>
                ))}
              </div>

              <div className="h-8" />
            </div>
          )}
        </div>

        {/* Right Pane: Live Rendered Resume/Portfolio Preview (7 cols) */}
        <div className="lg:col-span-7 p-4 overflow-y-auto h-[calc(100vh-53px)] bg-slate-900/30 scroll-smooth">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Eye className="h-3.5 w-3.5 text-cyan-400" /> Live Preview
              {editMode && <span className="text-amber-400 ml-2">• Click text to edit</span>}
            </span>
          </div>

          <div className="rounded-xl overflow-hidden shadow-2xl transition-all">
            {templateId === "latex-overleaf" ? (
              <LatexResumeTemplate data={profile} editable={editMode} onFieldChange={handleFieldChange} />
            ) : templateId === "tech-developer" ? (
              <TechDeveloperTemplate data={profile} />
            ) : templateId === "interactive-portfolio" ? (
              <InteractivePortfolioTemplate data={profile} />
            ) : (
              <ModernMinimalTemplate data={profile} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
