"use client";

import React from "react";
import { UserContextProfile } from "@/lib/ai/rag-chain";
import { Mail, Phone, ExternalLink, Github, MapPin, Briefcase, Award, Code, GraduationCap } from "lucide-react";
export { LatexResumeTemplate } from "./latex-resume-template";

interface TemplateProps {
  data: UserContextProfile;
  accentColor?: string;
}

export function ModernMinimalTemplate({ data }: TemplateProps) {
  return (
    <div id="resume-export-target" className="w-full bg-white text-slate-900 p-8 sm:p-12 shadow-2xl rounded-sm font-sans max-w-4xl mx-auto min-h-[1050px]">
      {/* Header */}
      <header className="border-b-2 border-slate-900 pb-6 mb-6">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-950 uppercase">
          {data.name || "Your Name"}
        </h1>
        <p className="text-lg font-semibold text-cyan-700 tracking-wide mt-1">
          {data.targetRole || "Software Engineer"}
        </p>
        <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-600 mt-3 font-medium">
          {data.email && (
            <span className="flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-slate-500" />
              {data.email}
            </span>
          )}
          {data.phone && (
            <span className="flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-slate-500" />
              {data.phone}
            </span>
          )}
          {data.location && (
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-slate-500" />
              {data.location}
            </span>
          )}
        </div>
      </header>

      {/* Summary */}
      {data.summary && (
        <section className="mb-6">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Professional Summary</h2>
          <p className="text-sm text-slate-700 leading-relaxed font-normal">{data.summary}</p>
        </section>
      )}

      {/* Skills */}
      {data.skills && data.skills.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Technical Skills</h2>
          <div className="flex flex-wrap gap-1.5">
            {data.skills.map((skill, i) => (
              <span key={i} className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded text-xs font-medium text-slate-800">
                {skill}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Experience */}
      {data.experiences && data.experiences.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Work Experience</h2>
          <div className="space-y-4">
            {data.experiences.map((exp, idx) => (
              <div key={idx} className="border-l-2 border-slate-200 pl-4 py-0.5">
                <div className="flex flex-wrap items-baseline justify-between">
                  <h3 className="text-base font-bold text-slate-900">{exp.role}</h3>
                  <span className="text-xs font-semibold text-slate-500">{exp.duration}</span>
                </div>
                <p className="text-xs font-bold text-cyan-800 mb-1">{exp.company}</p>
                <ul className="list-disc list-inside text-xs text-slate-700 space-y-1 mt-1">
                  {exp.bulletPoints.map((bp, bidx) => (
                    <li key={bidx} className="leading-relaxed">{bp}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {data.projects && data.projects.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Key Projects</h2>
          <div className="grid grid-cols-1 gap-3">
            {data.projects.map((proj, pidx) => (
              <div key={pidx} className="bg-slate-50 border border-slate-200 p-3.5 rounded">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">{proj.title}</h3>
                  {proj.link && (
                    <a href={proj.link} target="_blank" rel="noreferrer" className="text-xs text-cyan-600 hover:underline flex items-center gap-1 font-semibold">
                      View <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
                <p className="text-xs text-slate-600 mt-1">{proj.description}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {proj.techStack.map((tech, t) => (
                    <span key={t} className="text-[10px] bg-slate-200/80 text-slate-700 font-semibold px-2 py-0.5 rounded">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {data.education && data.education.length > 0 && (
        <section>
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Education</h2>
          {data.education.map((edu, eidx) => (
            <div key={eidx} className="flex justify-between items-baseline text-xs">
              <span className="font-bold text-slate-800">{edu.degree} - <span className="font-medium text-slate-600">{edu.institution}</span></span>
              <span className="text-slate-500 font-medium">{edu.year}</span>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}

export function TechDeveloperTemplate({ data }: TemplateProps) {
  return (
    <div id="resume-export-target" className="w-full bg-slate-950 text-slate-100 p-8 sm:p-12 shadow-2xl rounded-xl font-mono max-w-4xl mx-auto min-h-[1050px] border border-cyan-500/20">
      {/* Header */}
      <header className="border-b border-cyan-500/30 pb-6 mb-6">
        <div className="text-xs text-cyan-400 font-semibold mb-1">// SYSTEM_PROFILE_ID: DEV_RECURSION</div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          {data.name || "Alex Morgan"}
        </h1>
        <p className="text-sm font-bold text-cyan-400 mt-1">
          {`> ${data.targetRole || "Senior Full Stack Engineer"}`}
        </p>
        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-3">
          {data.email && <span>email: "{data.email}"</span>}
          {data.phone && <span>phone: "{data.phone}"</span>}
          <span>location: "San Francisco, CA"</span>
        </div>
      </header>

      {/* Summary */}
      {data.summary && (
        <section className="mb-6 bg-slate-900/60 border border-slate-800 p-4 rounded-lg">
          <div className="text-xs text-slate-500 mb-1">/** SUMMARY **/</div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{data.summary}</p>
        </section>
      )}

      {/* Skills */}
      {data.skills && data.skills.length > 0 && (
        <section className="mb-6">
          <div className="text-xs text-cyan-400 font-bold mb-2">const stack = [</div>
          <div className="flex flex-wrap gap-2 pl-4">
            {data.skills.map((skill, i) => (
              <span key={i} className="px-2.5 py-1 bg-cyan-950/60 border border-cyan-500/40 rounded text-xs text-cyan-300 font-semibold">
                "{skill}",
              </span>
            ))}
          </div>
          <div className="text-xs text-cyan-400 font-bold mt-1">];</div>
        </section>
      )}

      {/* Experience */}
      {data.experiences && data.experiences.length > 0 && (
        <section className="mb-6">
          <div className="text-xs text-cyan-400 font-bold mb-3">// EXPERIENCE_TIMELINE</div>
          <div className="space-y-4">
            {data.experiences.map((exp, idx) => (
              <div key={idx} className="bg-slate-900/40 border-l-2 border-cyan-500 pl-4 py-2">
                <div className="flex justify-between items-baseline">
                  <h3 className="text-sm font-bold text-white">{exp.role} @ <span className="text-cyan-400">{exp.company}</span></h3>
                  <span className="text-[10px] text-slate-400 font-mono">{exp.duration}</span>
                </div>
                <ul className="list-disc list-inside text-xs text-slate-300 space-y-1 mt-2">
                  {exp.bulletPoints.map((bp, bidx) => (
                    <li key={bidx}>{bp}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {data.projects && data.projects.length > 0 && (
        <section>
          <div className="text-xs text-cyan-400 font-bold mb-3">// SHIPPED_PROJECTS</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {data.projects.map((proj, pidx) => (
              <div key={pidx} className="bg-slate-900 border border-slate-800 p-3.5 rounded-lg">
                <h3 className="text-xs font-bold text-white flex items-center justify-between">
                  <span>{proj.title}</span>
                  {proj.link && <a href={proj.link} target="_blank" rel="noreferrer" className="text-[10px] text-cyan-400 hover:underline">Link &rarr;</a>}
                </h3>
                <p className="text-[11px] text-slate-400 mt-1">{proj.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export function InteractivePortfolioTemplate({ data }: TemplateProps) {
  return (
    <div id="resume-export-target" className="w-full bg-slate-950 text-slate-100 p-8 sm:p-12 shadow-2xl rounded-2xl max-w-4xl mx-auto min-h-[1050px] border border-slate-800">
      {/* Portfolio Hero */}
      <div className="relative rounded-2xl bg-gradient-to-r from-cyan-900/40 via-blue-900/30 to-purple-900/40 p-8 border border-cyan-500/30 mb-8 overflow-hidden">
        <div className="relative z-10">
          <span className="text-xs font-extrabold uppercase tracking-widest text-cyan-400 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40">
            Interactive Portfolio
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mt-3">
            {data.name || "Alex Morgan"}
          </h1>
          <p className="text-lg font-bold text-cyan-300 mt-1">
            {data.targetRole || "Senior Full Stack Engineer"}
          </p>
          <p className="text-xs sm:text-sm text-slate-300 mt-3 max-w-xl leading-relaxed">
            {data.summary}
          </p>
        </div>
      </div>

      {/* Skills Matrix */}
      {data.skills && data.skills.length > 0 && (
        <section className="mb-8">
          <h3 className="text-sm font-extrabold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
            <Code className="h-4 w-4 text-cyan-400" /> Core Competencies
          </h3>
          <div className="flex flex-wrap gap-2">
            {data.skills.map((s, i) => (
              <span key={i} className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-cyan-300">
                {s}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Featured Projects */}
      {data.projects && data.projects.length > 0 && (
        <section className="mb-8">
          <h3 className="text-sm font-extrabold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <Award className="h-4 w-4 text-cyan-400" /> Featured Projects
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.projects.map((p, idx) => (
              <div key={idx} className="rounded-xl bg-slate-900/90 border border-slate-800 p-5 hover:border-cyan-500/50 transition-colors">
                <h4 className="text-base font-bold text-white">{p.title}</h4>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">{p.description}</p>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {p.techStack.map((t, ti) => (
                    <span key={ti} className="text-[10px] bg-slate-800 text-cyan-400 px-2 py-0.5 rounded font-mono font-semibold">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Experience History */}
      {data.experiences && data.experiences.length > 0 && (
        <section>
          <h3 className="text-sm font-extrabold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-cyan-400" /> Professional Experience
          </h3>
          <div className="space-y-4">
            {data.experiences.map((e, idx) => (
              <div key={idx} className="rounded-xl bg-slate-900/60 border border-slate-800 p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-base font-bold text-white">{e.role}</h4>
                    <p className="text-xs font-bold text-cyan-400">{e.company}</p>
                  </div>
                  <span className="text-xs font-semibold text-slate-400 bg-slate-800 px-2.5 py-1 rounded-full">{e.duration}</span>
                </div>
                <ul className="list-disc list-inside text-xs text-slate-300 mt-3 space-y-1">
                  {e.bulletPoints.map((bp, bidx) => (
                    <li key={bidx}>{bp}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
