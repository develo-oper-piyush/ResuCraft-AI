"use client";

import React from "react";
import { UserContextProfile } from "@/lib/ai/rag-chain";

interface LatexTemplateProps {
  data: UserContextProfile;
  editable?: boolean;
  onFieldChange?: (path: string, value: any) => void;
}

/* ─── Shared Styles ─── */
const font = "'EB Garamond', 'Libre Baskerville', 'Georgia', serif";
const monoFont = "'JetBrains Mono', 'Courier New', monospace";

const sectionHeading: React.CSSProperties = {
  fontFamily: font,
  fontSize: "11.5pt",
  fontWeight: 700,
  textTransform: "uppercase" as const,
  letterSpacing: "0.08em",
  borderBottom: "1.5px solid #000",
  paddingBottom: "2px",
  marginTop: "10px",
  marginBottom: "5px",
  color: "#000",
};

const bodyText: React.CSSProperties = {
  fontFamily: font,
  fontSize: "9.5pt",
  lineHeight: 1.35,
  color: "#1a1a1a",
};

const smallMono: React.CSSProperties = {
  fontFamily: monoFont,
  fontSize: "7.5pt",
  color: "#555",
};

export function LatexResumeTemplate({ data, editable, onFieldChange }: LatexTemplateProps) {
  // Editable text helper
  const EditableText = ({ value, path, style, tag, className }: { value: string; path: string; style?: React.CSSProperties; tag?: string; className?: string }) => {
    if (!editable) {
      const Tag = (tag || "span") as any;
      return <Tag style={style} className={className}>{value}</Tag>;
    }
    return (
      <span
        contentEditable
        suppressContentEditableWarning
        onBlur={(e) => onFieldChange?.(path, e.currentTarget.textContent || "")}
        style={{ ...style, cursor: "text", outline: "none", borderBottom: "1px dashed rgba(0,150,255,0.3)" }}
        className={className}
      >
        {value}
      </span>
    );
  };

  return (
    <div
      id="resume-export-target"
      style={{
        width: "100%",
        maxWidth: "8.5in",
        minHeight: "11in",
        margin: "0 auto",
        padding: "0.4in 0.5in 0.4in 0.5in",
        background: "#fff",
        color: "#000",
        fontFamily: font,
        fontSize: "9.5pt",
        lineHeight: 1.35,
        boxShadow: "0 4px 30px rgba(0,0,0,0.15)",
      }}
    >
      {/* ─── Google Fonts Import ─── */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&family=JetBrains+Mono:wght@400;500&display=swap');`}</style>

      {/* ═══════════ HEADER ═══════════ */}
      <header style={{ textAlign: "center", marginBottom: "6px" }}>
        <h1 style={{ fontFamily: font, fontSize: "22pt", fontWeight: 700, margin: 0, letterSpacing: "0.02em", color: "#000" }}>
          <EditableText value={data.name || "Your Name"} path="name" />
        </h1>

        {/* Contact row */}
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "4px 12px", marginTop: "4px", fontSize: "8.5pt", color: "#333" }}>
          {data.phone && (
            <span>📞 <EditableText value={data.phone} path="phone" /></span>
          )}
          {data.email && (
            <span>✉ <EditableText value={data.email} path="email" /></span>
          )}
          {data.linkedin && (
            <span>🔗 <a href={`https://${data.linkedin}`} target="_blank" rel="noreferrer" style={{ color: "#0066cc", textDecoration: "none" }}>{data.linkedin}</a></span>
          )}
          {data.github && (
            <span>⊙ <a href={`https://${data.github}`} target="_blank" rel="noreferrer" style={{ color: "#0066cc", textDecoration: "none" }}>{data.github}</a></span>
          )}
        </div>
        {(data.leetcode || data.portfolio) && (
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "4px 12px", marginTop: "2px", fontSize: "8.5pt", color: "#333" }}>
            {data.leetcode && (
              <span>◇ <a href={`https://${data.leetcode}`} target="_blank" rel="noreferrer" style={{ color: "#0066cc", textDecoration: "none" }}>{data.leetcode}</a></span>
            )}
            {data.portfolio && (
              <span>⊕ <a href={`https://${data.portfolio}`} target="_blank" rel="noreferrer" style={{ color: "#0066cc", textDecoration: "none" }}>{data.portfolio}</a></span>
            )}
          </div>
        )}
      </header>

      {/* ═══════════ EDUCATION ═══════════ */}
      {data.education && data.education.length > 0 && (
        <section>
          <h2 style={sectionHeading}>Education</h2>
          {data.education.map((edu, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "3px", ...bodyText }}>
              <div>
                <strong><EditableText value={edu.institution} path={`education.${i}.institution`} /></strong>
                {edu.location && <span style={{ float: "right" }}></span>}
                <br />
                <em>
                  <EditableText value={edu.degree} path={`education.${i}.degree`} />
                </em>
              </div>
              <div style={{ textAlign: "right", whiteSpace: "nowrap", minWidth: "150px" }}>
                {edu.location && <div style={{ fontWeight: 500 }}>{edu.location}</div>}
                <div style={{ fontStyle: "italic" }}><EditableText value={edu.year} path={`education.${i}.year`} /></div>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* ═══════════ EXPERIENCE ═══════════ */}
      {data.experiences && data.experiences.length > 0 && (
        <section>
          <h2 style={sectionHeading}>Experience</h2>
          {data.experiences.map((exp, i) => (
            <div key={i} style={{ marginBottom: "6px", ...bodyText }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span>
                  <strong><EditableText value={exp.role} path={`experiences.${i}.role`} /></strong>
                  {" — "}
                  <EditableText value={exp.company} path={`experiences.${i}.company`} />
                </span>
                <span style={{ whiteSpace: "nowrap" }}>
                  {exp.certificate && (
                    <span style={{ marginRight: "8px" }}>
                      Certificate: <a href={`https://${exp.certificate}`} target="_blank" rel="noreferrer" style={{ color: "#0066cc", textDecoration: "none" }}>{exp.certificate}</a>
                    </span>
                  )}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontStyle: "italic", fontSize: "9pt", color: "#444", marginBottom: "2px" }}>
                <span>{exp.location || "Remote"}</span>
                <span><EditableText value={exp.duration} path={`experiences.${i}.duration`} /></span>
              </div>
              <ul style={{ margin: "2px 0 0 16px", padding: 0, listStyleType: "disc" }}>
                {exp.bulletPoints.map((bp, j) => (
                  <li key={j} style={{ marginBottom: "1px", ...bodyText }}>
                    <EditableText value={bp} path={`experiences.${i}.bulletPoints.${j}`} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}

      {/* ═══════════ TECHNICAL SKILLS ═══════════ */}
      {(data.technicalSkills || (data.skills && data.skills.length > 0)) && (
        <section>
          <h2 style={sectionHeading}>Technical Skills</h2>
          {data.technicalSkills ? (
            <div style={{ ...bodyText }}>
              {data.technicalSkills.languages && data.technicalSkills.languages.length > 0 && (
                <div style={{ marginBottom: "2px" }}>
                  <strong>Languages</strong> : {data.technicalSkills.languages.join(", ")}
                </div>
              )}
              {data.technicalSkills.frameworks && data.technicalSkills.frameworks.length > 0 && (
                <div style={{ marginBottom: "2px" }}>
                  <strong>Frameworks & Libraries</strong>: {data.technicalSkills.frameworks.join(", ")}
                </div>
              )}
              {data.technicalSkills.tools && data.technicalSkills.tools.length > 0 && (
                <div>
                  <strong>Developer Tools</strong> : {data.technicalSkills.tools.join(", ")}
                </div>
              )}
            </div>
          ) : (
            <div style={{ ...bodyText }}>
              {data.skills?.join(", ")}
            </div>
          )}
        </section>
      )}

      {/* ═══════════ PROJECTS ═══════════ */}
      {data.projects && data.projects.length > 0 && (
        <section>
          <h2 style={sectionHeading}>Projects</h2>
          {data.projects.map((proj, i) => (
            <div key={i} style={{ marginBottom: "6px", ...bodyText }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span>
                  <strong><EditableText value={proj.title} path={`projects.${i}.title`} /></strong>
                  {" | "}
                  <em style={{ fontSize: "8.5pt", color: "#444" }}>{proj.techStack.join(", ")}</em>
                </span>
                {proj.link && (
                  <span>
                    ⊙ <a href={`https://${proj.link}`} target="_blank" rel="noreferrer" style={{ color: "#0066cc", textDecoration: "none", fontSize: "8.5pt" }}>{proj.link}</a>
                  </span>
                )}
              </div>
              <ul style={{ margin: "2px 0 0 16px", padding: 0, listStyleType: "disc" }}>
                {proj.bulletPoints && proj.bulletPoints.length > 0 ? (
                  proj.bulletPoints.map((bp, j) => (
                    <li key={j} style={{ marginBottom: "1px", ...bodyText }}>
                      <EditableText value={bp} path={`projects.${i}.bulletPoints.${j}`} />
                    </li>
                  ))
                ) : (
                  <li style={{ ...bodyText }}>
                    <EditableText value={proj.description} path={`projects.${i}.description`} />
                  </li>
                )}
              </ul>
            </div>
          ))}
        </section>
      )}

      {/* ═══════════ ACHIEVEMENTS ═══════════ */}
      {data.achievements && data.achievements.length > 0 && (
        <section>
          <h2 style={sectionHeading}>Achievements & Competitive Programming</h2>
          <ul style={{ margin: "2px 0 0 16px", padding: 0, listStyleType: "disc" }}>
            {data.achievements.map((a, i) => (
              <li key={i} style={{ marginBottom: "1px", ...bodyText }}>
                <EditableText value={a} path={`achievements.${i}`} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ═══════════ CERTIFICATIONS ═══════════ */}
      {data.certifications && data.certifications.length > 0 && (
        <section>
          <h2 style={sectionHeading}>Certifications</h2>
          <table style={{ width: "100%", borderCollapse: "collapse", ...bodyText }}>
            <tbody>
              {data.certifications.map((cert, i) => (
                <tr key={i}>
                  <td style={{ paddingBottom: "2px", verticalAlign: "top" }}>
                    <strong><EditableText value={cert.name} path={`certifications.${i}.name`} /></strong>
                    {" | "}
                    <EditableText value={cert.issuer} path={`certifications.${i}.issuer`} />
                  </td>
                  <td style={{ textAlign: "right", whiteSpace: "nowrap", verticalAlign: "top", paddingBottom: "2px" }}>
                    {cert.link && (
                      <span style={{ marginRight: "8px" }}>
                        Certificate: <a href={`https://${cert.link}`} target="_blank" rel="noreferrer" style={{ color: "#0066cc", textDecoration: "none" }}>{cert.link}</a>
                      </span>
                    )}
                    {cert.date && <em style={{ color: "#555" }}>({cert.date})</em>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {/* ═══════════ CO-CURRICULAR ACTIVITIES ═══════════ */}
      {data.activities && data.activities.length > 0 && (
        <section>
          <h2 style={sectionHeading}>Co-Curricular Activities</h2>
          {data.activities.map((act, i) => (
            <div key={i} style={{ marginBottom: "4px", ...bodyText }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span>
                  <strong><EditableText value={act.name} path={`activities.${i}.name`} /></strong>
                  {" | "}
                  <EditableText value={act.institution} path={`activities.${i}.institution`} />
                </span>
                {act.duration && (
                  <span style={{ fontStyle: "italic", color: "#555", whiteSpace: "nowrap" }}>{act.duration}</span>
                )}
              </div>
              {act.description && (
                <div style={{ fontStyle: "italic", fontSize: "9pt", color: "#444", marginLeft: "4px" }}>
                  <EditableText value={act.description} path={`activities.${i}.description`} />
                </div>
              )}
            </div>
          ))}
        </section>
      )}

      {/* ═══════════ HACKATHONS ═══════════ */}
      {data.hackathons && data.hackathons.length > 0 && (
        <section style={{ marginTop: "4px" }}>
          <div style={{ ...bodyText }}>
            <strong>Hackathons: </strong>
            {data.hackathons.map((h, i) => (
              <span key={i}>
                <EditableText value={h} path={`hackathons.${i}`} />
                {i < data.hackathons!.length - 1 ? " · " : ""}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
