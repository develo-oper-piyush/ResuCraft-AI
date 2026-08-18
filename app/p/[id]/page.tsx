"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Sparkles,
  Github,
  Linkedin,
  Globe,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Download,
  Code,
  Briefcase,
  GraduationCap,
  Award,
  Sun,
  Moon,
  X,
  FileText,
} from "lucide-react";
import { UserContextProfile } from "@/lib/ai/rag-chain";

export default function PublicWebPortfolioPage() {
  const params = useParams();
  const id = params?.id as string;

  const [profile, setProfile] = useState<UserContextProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [selectedProject, setSelectedProject] = useState<any | null>(null);

  useEffect(() => {
    fetch(`/api/resumes/${id}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.resume) {
          const content = json.resume.contentJson || json.resume;
          setProfile({
            name: content.name || "Software Candidate",
            email: content.email || "",
            phone: content.phone || "",
            location: content.location || "",
            targetRole: content.targetRole || "Full Stack Software Engineer",
            summary: content.summary || "Passionate software developer building high-scale web applications.",
            linkedin: content.linkedin || "",
            github: content.github || "",
            leetcode: content.leetcode || "",
            portfolio: content.portfolio || "",
            skills: content.skills || [],
            technicalSkills: content.technicalSkills || { languages: [], frameworks: [], tools: [] },
            experiences: content.experiences || [],
            projects: content.projects || [],
            education: content.education || [],
            achievements: content.achievements || [],
            certifications: content.certifications || [],
          });
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load public portfolio:", err);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4">
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
          <span className="text-sm font-bold text-slate-300">Loading Portfolio...</span>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-white mb-2">Portfolio Not Found</h1>
        <p className="text-xs text-slate-400 mb-6">The requested public web portfolio link does not exist or has expired.</p>
        <Link href="/" className="text-xs text-cyan-400 font-semibold hover:underline">
          &larr; Return to ResuCraft AI Home
        </Link>
      </div>
    );
  }

  const bgCls = darkMode ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900";
  const cardBgCls = darkMode ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200 shadow-md";
  const textMutedCls = darkMode ? "text-slate-400" : "text-slate-600";
  const textHeadingCls = darkMode ? "text-white" : "text-slate-950";

  return (
    <div className={`min-h-screen ${bgCls} transition-colors duration-300 font-sans`}>
      {/* Top Banner Control Bar */}
      <header className="border-b border-slate-800/80 bg-slate-900/40 backdrop-blur-md px-6 py-3 sticky top-0 z-40 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <img src="/ResuCraft.png" alt="ResuCraft AI" className="h-7 w-7 object-contain" />
            <span className="font-bold text-xs text-cyan-400 tracking-wider uppercase">ResuCraft Portfolio</span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-xl border border-slate-800 text-xs font-semibold flex items-center gap-1.5 hover:border-cyan-500/40 transition-colors"
          >
            {darkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-indigo-600" />}
          </button>

          <button
            onClick={() => window.print()}
            className="py-1.5 px-3 rounded-xl bg-cyan-500 text-slate-950 text-xs font-bold flex items-center gap-1.5 hover:bg-cyan-400 transition-colors shadow-md"
          >
            <Download className="h-3.5 w-3.5" /> PDF
          </button>
        </div>
      </header>

      {/* Main Portfolio Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-12">
        {/* Profile Hero Header */}
        <section className={`p-8 sm:p-12 rounded-3xl border ${cardBgCls} relative overflow-hidden`}>
          <div className="relative z-10 space-y-4">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 inline-block">
              {profile.targetRole || "Software Engineer"}
            </span>

            <h1 className={`text-3xl sm:text-5xl font-black tracking-tight ${textHeadingCls}`}>
              {profile.name}
            </h1>

            {profile.summary && (
              <p className={`text-sm sm:text-base leading-relaxed max-w-2xl ${textMutedCls}`}>
                {profile.summary}
              </p>
            )}

            {/* Social & Contact links */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-medium pt-2">
              {profile.email && (
                <a href={`mailto:${profile.email}`} className="flex items-center gap-1.5 hover:text-cyan-400 transition-colors">
                  <Mail className="h-3.5 w-3.5 text-cyan-400" /> {profile.email}
                </a>
              )}
              {profile.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-cyan-400" /> {profile.location}
                </span>
              )}
              {profile.github && (
                <a href={`https://${profile.github.replace(/^https?:\/\//, "")}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-cyan-400 transition-colors font-semibold">
                  <Github className="h-3.5 w-3.5 text-cyan-400" /> GitHub
                </a>
              )}
              {profile.linkedin && (
                <a href={`https://${profile.linkedin.replace(/^https?:\/\//, "")}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-cyan-400 transition-colors font-semibold">
                  <Linkedin className="h-3.5 w-3.5 text-cyan-400" /> LinkedIn
                </a>
              )}
            </div>
          </div>
        </section>

        {/* Technical Skills Matrix */}
        {((profile.skills && profile.skills.length > 0) || profile.technicalSkills) && (
          <section className="space-y-4">
            <h2 className={`text-lg font-bold flex items-center gap-2 ${textHeadingCls}`}>
              <Code className="h-5 w-5 text-cyan-400" /> Technical Skills & Expertise
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {profile.technicalSkills?.languages && profile.technicalSkills.languages.length > 0 && (
                <div className={`p-5 rounded-2xl border ${cardBgCls}`}>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-3">Languages</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.technicalSkills.languages.map((sk, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-cyan-950/40 border border-cyan-500/20 text-cyan-300">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {profile.technicalSkills?.frameworks && profile.technicalSkills.frameworks.length > 0 && (
                <div className={`p-5 rounded-2xl border ${cardBgCls}`}>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-3">Frameworks & Libraries</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.technicalSkills.frameworks.map((sk, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-950/40 border border-blue-500/20 text-blue-300">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {profile.technicalSkills?.tools && profile.technicalSkills.tools.length > 0 && (
                <div className={`p-5 rounded-2xl border ${cardBgCls}`}>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-3">Developer Tools</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.technicalSkills.tools.map((sk, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-950/40 border border-indigo-500/20 text-indigo-300">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Featured Projects Grid */}
        {profile.projects && profile.projects.length > 0 && (
          <section className="space-y-4">
            <h2 className={`text-lg font-bold flex items-center gap-2 ${textHeadingCls}`}>
              <Sparkles className="h-5 w-5 text-amber-400" /> Featured Software Projects
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {profile.projects.map((proj, i) => (
                <div
                  key={i}
                  onClick={() => setSelectedProject(proj)}
                  className={`p-6 rounded-2xl border ${cardBgCls} hover:border-cyan-500/50 transition-all cursor-pointer flex flex-col justify-between group`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className={`text-base font-bold group-hover:text-cyan-400 transition-colors ${textHeadingCls}`}>
                        {proj.title}
                      </h3>
                      {proj.link && (
                        <span className="text-slate-400 group-hover:text-cyan-400">
                          <ExternalLink className="h-4 w-4" />
                        </span>
                      )}
                    </div>
                    {proj.description && (
                      <p className={`text-xs line-clamp-2 leading-relaxed mb-4 ${textMutedCls}`}>{proj.description}</p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1 mt-2">
                    {proj.techStack?.slice(0, 4).map((tech, ti) => (
                      <span key={ti} className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Experience Timeline */}
        {profile.experiences && profile.experiences.length > 0 && (
          <section className="space-y-4">
            <h2 className={`text-lg font-bold flex items-center gap-2 ${textHeadingCls}`}>
              <Briefcase className="h-5 w-5 text-cyan-400" /> Work Experience
            </h2>

            <div className="space-y-4">
              {profile.experiences.map((exp, i) => (
                <div key={i} className={`p-6 rounded-2xl border ${cardBgCls} space-y-2`}>
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className={`text-base font-bold ${textHeadingCls}`}>{exp.role}</h3>
                    <span className="text-xs font-semibold text-cyan-400">{exp.duration}</span>
                  </div>
                  <p className="text-xs font-bold text-slate-400">{exp.company} {exp.location ? `· ${exp.location}` : ""}</p>

                  {exp.bulletPoints && exp.bulletPoints.length > 0 && (
                    <ul className="list-disc list-inside space-y-1 text-xs pt-2 text-slate-300">
                      {exp.bulletPoints.map((bp, bidx) => (
                        <li key={bidx} className="leading-relaxed">{bp}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Project Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 relative">
            <button onClick={() => setSelectedProject(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-xl font-bold text-white">{selectedProject.title}</h3>
            <p className="text-xs text-slate-300 leading-relaxed">{selectedProject.description}</p>
            
            {selectedProject.bulletPoints && (
              <ul className="list-disc list-inside text-xs text-slate-400 space-y-1">
                {selectedProject.bulletPoints.map((bp: string, i: number) => (
                  <li key={i}>{bp}</li>
                ))}
              </ul>
            )}

            {selectedProject.link && (
              <div className="pt-2">
                <a href={`https://${selectedProject.link.replace(/^https?:\/\//, "")}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:underline">
                  Visit Project Demo &rarr;
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
