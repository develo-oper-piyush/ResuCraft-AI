import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';

// Robust JSON extractor: handles <think> reasoning tags, unclosed tags, markdown fences, and brace counting
function extractFirstJSON(raw: string): string {
  // 1. Strip <think>...</think> if present
  let text = raw.replace(/<think>[\s\S]*?<\/think>/gi, '');
  // If there's an unclosed <think> tag, strip up to the first '{'
  if (text.includes('<think>')) {
    const endThinkIdx = text.lastIndexOf('</think>');
    if (endThinkIdx !== -1) {
      text = text.substring(endThinkIdx + 8);
    } else {
      const jsonStart = text.indexOf('{');
      if (jsonStart !== -1) {
        text = text.substring(jsonStart);
      }
    }
  }

  // 2. Strip markdown code fences ```json ... ```
  text = text.replace(/```json/gi, '').replace(/```/g, '').trim();

  // 3. Find first '{'
  const start = text.indexOf('{');
  if (start === -1) throw new Error('No JSON object found in response');

  // 4. Find matching closing '}' with brace counting
  let depth = 0;
  let inString = false;
  let escape = false;
  let end = -1;

  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (escape) { escape = false; continue; }
    if (ch === '\\' && inString) { escape = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (ch === '{') depth++;
    if (ch === '}') {
      depth--;
      if (depth === 0) {
        end = i;
        break;
      }
    }
  }

  if (end !== -1) {
    return text.substring(start, end + 1);
  }

  return text.substring(start);
}

async function callGroqAPI(prompt: string, groqKey: string): Promise<string> {
  const groq = new Groq({ apiKey: groqKey });
  const models = ['openai/gpt-oss-120b', 'openai/gpt-oss-20b', 'qwen/qwen3.6-27b'];
  let lastErr: any = null;
  for (const m of models) {
    try {
      const response = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: m,
        temperature: 0.3,
      });
      return response.choices[0]?.message?.content || '';
    } catch (err: any) {
      lastErr = err;
      console.warn(`Groq model '${m}' failed, trying next...`);
    }
  }
  throw lastErr;
}

// ─── Enhanced Data Model ───

export interface UserContextProfile {
  // Core identity
  name?: string;
  email?: string;
  phone?: string;
  targetRole?: string;
  summary?: string;
  location?: string;

  // Social / portfolio links
  linkedin?: string;
  github?: string;
  leetcode?: string;
  portfolio?: string;

  // Skills (flat array for backward compat + structured object for LaTeX template)
  skills?: string[];
  technicalSkills?: {
    languages?: string[];
    frameworks?: string[];
    tools?: string[];
  };

  // Experience
  experiences?: {
    company: string;
    role: string;
    duration: string;
    location?: string;
    certificate?: string;
    bulletPoints: string[];
  }[];

  // Projects
  projects?: {
    title: string;
    description: string;
    techStack: string[];
    link?: string;
    bulletPoints?: string[];
  }[];

  // Education
  education?: {
    institution: string;
    degree: string;
    year: string;
    cgpa?: string;
    location?: string;
  }[];

  // NEW: Achievements & Competitive Programming
  achievements?: string[];

  // NEW: Certifications
  certifications?: {
    name: string;
    issuer: string;
    link?: string;
    date?: string;
  }[];

  // NEW: Co-Curricular Activities
  activities?: {
    name: string;
    institution: string;
    duration?: string;
    description?: string;
  }[];

  // NEW: Hackathons
  hackathons?: string[];

  // Context memory
  uploadedResumeText?: string;
  chatHistory?: { role: 'user' | 'assistant'; content: string }[];
}

export async function generateRAGResumeContent(
  userProfile: UserContextProfile,
  customPrompt: string
): Promise<UserContextProfile> {
  const contextChunks = [
    userProfile.uploadedResumeText ? `Uploaded Resume Context:\n${userProfile.uploadedResumeText}` : '',
    userProfile.summary ? `Summary Context:\n${userProfile.summary}` : '',
    userProfile.skills ? `Skills Context:\n${userProfile.skills.join(', ')}` : '',
    userProfile.technicalSkills ? `Structured Skills:\nLanguages: ${userProfile.technicalSkills.languages?.join(', ')}\nFrameworks: ${userProfile.technicalSkills.frameworks?.join(', ')}\nTools: ${userProfile.technicalSkills.tools?.join(', ')}` : '',
    userProfile.experiences ? `Experiences Context:\n${JSON.stringify(userProfile.experiences)}` : '',
    userProfile.projects ? `Projects Context:\n${JSON.stringify(userProfile.projects)}` : '',
    userProfile.education ? `Education Context:\n${JSON.stringify(userProfile.education)}` : '',
    userProfile.achievements ? `Achievements:\n${userProfile.achievements.join('\n')}` : '',
    userProfile.certifications ? `Certifications:\n${JSON.stringify(userProfile.certifications)}` : '',
    userProfile.activities ? `Activities:\n${JSON.stringify(userProfile.activities)}` : '',
    userProfile.hackathons ? `Hackathons:\n${userProfile.hackathons.join(', ')}` : '',
    userProfile.chatHistory ? `Previous Chat:\n${userProfile.chatHistory.map(c => `${c.role}: ${c.content}`).join('\n')}` : '',
  ]
    .filter(Boolean)
    .join('\n\n');

  const systemInstruction = `
You are a world-class RAG Resume & Portfolio Architect specializing in ATS-optimized, recruiter-ready resumes.

CRITICAL RULES:
- Every bullet point MUST start with a strong ACTION VERB (Architected, Engineered, Spearheaded, Optimized, Implemented, Developed, Led, Designed, Built, Deployed, Integrated, Automated, etc.)
- Include QUANTIFIED METRICS wherever possible (percentages, numbers, dollar amounts, time savings)
- Use industry-specific keywords for maximum ATS score
- Keep professional summary to 2-3 impactful sentences
- For technical skills, categorize into Languages, Frameworks & Libraries, and Developer Tools
- For projects, include 2-3 bullet points per project describing technical achievements
- Make the content specific, detailed, and achievement-oriented — NOT generic

USER INSTRUCTION: "${customPrompt}"

ACCUMULATED USER CONTEXT:
"""
${contextChunks}
"""

Return RAW JSON (no markdown fences, no explanation) matching this EXACT structure:
{
  "name": "Full Name",
  "email": "email@domain.com",
  "phone": "+91 XXXXXXXXXX",
  "location": "City, State, Country",
  "targetRole": "Target Job Title",
  "summary": "2-3 sentence high-impact professional summary with quantified achievements",
  "linkedin": "linkedin.com/in/username",
  "github": "github.com/username",
  "leetcode": "leetcode.com/username",
  "portfolio": "portfolio-url.com",
  "skills": ["Skill1", "Skill2"],
  "technicalSkills": {
    "languages": ["JavaScript", "TypeScript", "Python", "SQL"],
    "frameworks": ["React", "Next.js", "Express.js", "Node.js", "Tailwind CSS"],
    "tools": ["Git", "GitHub", "VS Code", "Docker"]
  },
  "education": [
    {
      "institution": "University Name",
      "degree": "B.Tech in Computer Science and Engineering — CGPA: X.XX/10.0",
      "year": "Sept 2024 – Jun 2028",
      "cgpa": "8.44",
      "location": "City, Country"
    }
  ],
  "experiences": [
    {
      "company": "Company Name",
      "role": "Job Title",
      "duration": "Month Year – Month Year",
      "location": "Remote / City",
      "certificate": "bit.ly/certificate-link",
      "bulletPoints": ["Action verb + quantifiable impact sentence 1", "Action verb + technical accomplishment 2"]
    }
  ],
  "projects": [
    {
      "title": "Project Name",
      "description": "One line overview",
      "techStack": ["Next.js", "TypeScript", "Tailwind CSS"],
      "link": "bit.ly/project-link",
      "bulletPoints": ["Built feature X achieving Y% improvement", "Integrated Z technology for A purpose"]
    }
  ],
  "achievements": [
    "700+ Problems Solved: Demonstrated consistent problem-solving ability across LeetCode, CodeChef, and Code360",
    "LeetCode: Solved 250+ Data Structures and Algorithms problems",
    "Academics: 8.44 CGPA (B.Tech), 98% in Class X"
  ],
  "certifications": [
    {
      "name": "AWS Certified Cloud Practitioner",
      "issuer": "Amazon Web Services",
      "link": "aws.amazon.com/verification",
      "date": "Apr 2026"
    }
  ],
  "activities": [
    {
      "name": "CP Club — Competitive Programming Club",
      "institution": "KIET Group of Institutions",
      "duration": "Nov 2024 – Nov 2025",
      "description": "Participated in coding contests and attended technical workshops"
    }
  ],
  "hackathons": ["HackHazards (2025)", "Hackcelerate (2025)", "Hackzilla (2025)"]
}
`;

  const geminiKey = process.env.GEMINI_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;
  const provider = process.env.AI_PROVIDER || 'gemini';

  try {
    let responseText = '';
    const hasValidGroq = Boolean(groqKey && groqKey !== 'your_groq_api_key_here');
    const hasValidGemini = Boolean(geminiKey && geminiKey !== 'your_gemini_api_key_here' && geminiKey.length > 10);

    if (provider === 'groq' && hasValidGroq) {
      responseText = await callGroqAPI(systemInstruction, groqKey!);
    } else if (hasValidGemini) {
      const genAI = new GoogleGenerativeAI(geminiKey!);
      const candidateModels = ['gemini-flash-latest', 'gemini-2.0-flash', 'gemini-1.5-flash-latest', 'gemini-1.5-flash', 'gemini-1.5-pro'];
      let lastError: any = null;

      for (const modelName of candidateModels) {
        try {
          const model = genAI.getGenerativeModel({ model: modelName });
          const result = await model.generateContent(systemInstruction);
          responseText = result.response.text();
          lastError = null;
          break;
        } catch (err: any) {
          lastError = err;
          const status = err?.status || err?.httpStatusCode;
          const msg = String(err?.message || '');
          // Retry on ANY transient/model error: 404, 429, 500, 503, etc.
          const isRetryable = [404, 429, 500, 503].includes(status)
            || msg.includes('not found')
            || msg.includes('Service Unavailable')
            || msg.includes('overloaded')
            || msg.includes('high demand')
            || msg.includes('rate limit');
          if (isRetryable) {
            console.warn(`Gemini model '${modelName}' failed (${status || 'unknown'}): ${msg.slice(0, 100)}. Trying next model...`);
            continue;
          }
          // Only throw on truly unexpected errors (auth, invalid key, etc.)
          throw err;
        }
      }

      if (lastError && !responseText) {
        if (hasValidGroq) {
          console.warn('Gemini models failed. Falling back to Groq API...');
          responseText = await callGroqAPI(systemInstruction, groqKey!);
        } else {
          throw lastError;
        }
      }
    } else if (hasValidGroq) {
      console.log('Gemini API key is invalid/unconfigured. Automatically using Groq AI provider...');
      responseText = await callGroqAPI(systemInstruction, groqKey!);
    } else {
      return generateDefaultRAGProfile(userProfile, customPrompt);
    }

    const cleanJsonText = extractFirstJSON(responseText);
    const parsed = JSON.parse(cleanJsonText);
    return {
      ...userProfile,
      ...parsed,
    };
  } catch (error) {
    console.error('RAG content generation error, falling back to profile merge:', error);
    return generateDefaultRAGProfile(userProfile, customPrompt);
  }
}

function generateDefaultRAGProfile(
  existing: UserContextProfile,
  prompt: string
): UserContextProfile {
  return {
    name: existing.name || 'Piyush Chaudhary',
    email: existing.email || 'piyushch056@gmail.com',
    phone: existing.phone || '+91 6396789234',
    location: existing.location || 'Uttar Pradesh, India',
    targetRole: existing.targetRole || 'Full Stack Developer',
    linkedin: existing.linkedin || 'linkedin.com/in/develo-oper-piyush',
    github: existing.github || 'github.com/develo-oper-piyush',
    leetcode: existing.leetcode || 'leetcode.com/develo_oper_piyush',
    portfolio: existing.portfolio || 'piyushchaudhary.vercel.app',
    summary:
      existing.summary ||
      'Full Stack Developer with expertise in building production-grade web applications using Next.js, TypeScript, and modern cloud infrastructure. Passionate about AI integration, competitive programming, and open-source contributions.',
    skills: existing.skills || [
      'JavaScript', 'TypeScript', 'HTML', 'CSS', 'SQL',
      'React', 'Next.js', 'Express.js', 'Node.js', 'Tailwind CSS', 'RESTful APIs',
      'Git', 'GitHub', 'VS Code',
    ],
    technicalSkills: existing.technicalSkills || {
      languages: ['JavaScript', 'TypeScript', 'HTML', 'CSS', 'SQL'],
      frameworks: ['React', 'Next.js', 'Express.js', 'Node.js', 'Tailwind CSS', 'RESTful APIs'],
      tools: ['Git', 'GitHub', 'VS Code'],
    },
    experiences: existing.experiences || [
      {
        company: 'AICTE Virtual Internship',
        role: 'ServiceNow System Administrator',
        duration: 'March 2026 – Apr 2026',
        location: 'Remote',
        certificate: 'bit.ly/3TqMtG1',
        bulletPoints: [
          'Completed a 1-month AICTE-certified virtual internship focused on ServiceNow platform administration, covering instance configuration, workflow automation, and IT service management fundamentals.',
        ],
      },
    ],
    projects: existing.projects || [
      {
        title: 'Lumina Gen',
        description: 'Full-stack AI image transformation app using Stability AI SD3 for style transfer across 6 presets.',
        techStack: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Stability AI SD3', 'Clerk', 'Neon PostgreSQL', 'ImageKit CDN'],
        link: 'bit.ly/Lumina-Gen',
        bulletPoints: [
          'Built full-stack AI image transformation app using Stability AI SD3 for style transfer across 6 presets, with Clerk auth, Neon PostgreSQL, and ImageKit CDN for quota management and history tracking.',
        ],
      },
      {
        title: 'SwiftNotes 2.0',
        description: 'Full-stack AI-powered note-taking platform integrating YouTube/video processing.',
        techStack: ['Next.js', 'FastAPI', 'Supabase', 'Gemini AI', 'Python'],
        link: 'bit.ly/Swift-notes',
        bulletPoints: [
          'Developed full-stack AI-powered note-taking platform integrating YouTube/video processing, a notebook editor, and AI-generated summaries into a unified student workspace.',
        ],
      },
      {
        title: 'Cloud Storage Platform',
        description: 'Secure cloud storage application with JWT authentication.',
        techStack: ['Node.js', 'Express', 'MongoDB', 'Supabase', 'Tailwind CSS'],
        link: 'bit.ly/4fsxe71',
        bulletPoints: [
          'Engineered secure cloud storage application with JWT authentication, supporting file upload, download, rename, and deletion.',
        ],
      },
    ],
    education: existing.education || [
      {
        institution: 'KIET Group of Institutions',
        degree: 'B.Tech in Computer Science and Engineering — CGPA: 8.23/10.0',
        year: 'Sept 2024 – Jun 2028',
        cgpa: '8.23',
        location: 'Uttar Pradesh, India',
      },
      {
        institution: 'BNG International School (CBSE)',
        degree: 'Senior Secondary (Class XII) — 90%',
        year: 'Apr 2022 – Jul 2023',
        location: 'Uttar Pradesh, India',
      },
    ],
    achievements: existing.achievements || [
      '700+ Problems Solved: Demonstrated consistent problem-solving ability across LeetCode, CodeChef, and Code360',
      'LeetCode: Solved 250+ Data Structures and Algorithms problems, showcasing strong algorithmic proficiency',
      'Academics: 8.44 CGPA (B.Tech), 98% in Class X and 90% in Class XII (CBSE Board)',
    ],
    certifications: existing.certifications || [
      { name: 'AWS Certified Cloud Practitioner', issuer: 'Amazon Web Services', link: 'aws.amazon.com/verification', date: 'Apr 2026' },
      { name: 'Next.js Development', issuer: 'GeeksforGeeks', link: 'bit.ly/4wbLGWM', date: 'May 2026' },
      { name: 'React JS Development', issuer: 'GeeksforGeeks', link: 'bit.ly/4vGt8hA', date: 'Feb 2026' },
      { name: 'ECMAScript ES6 JavaScript Tutorials', issuer: 'Infosys Springboard', link: 'bit.ly/4ysywaB', date: 'Mar 2026' },
    ],
    activities: existing.activities || [
      {
        name: 'CPByte — Competitive Programming Club',
        institution: 'KIET Group of Institutions',
        duration: 'Nov 2024 – Nov 2025',
        description: 'Former Member — Participated in coding contests and attended technical workshops',
      },
      {
        name: 'Innogeeks — Technical Innovation Society',
        institution: 'KIET Group of Institutions',
        duration: 'Nov 2024 – Nov 2025',
        description: 'Former Member — Collaborated on technical projects and workshops on emerging technologies',
      },
    ],
    hackathons: existing.hackathons || [
      'HackHazards (2025)', 'Hackcelerate (2025)', 'Hackzilla (2025)', 'Other Hackathons',
    ],
  };
}
