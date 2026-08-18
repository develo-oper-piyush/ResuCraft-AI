import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';

// Robust JSON repair helper for truncated LLM responses
function fixTruncatedJSON(jsonStr: string): string {
  let str = jsonStr.trim();
  let inString = false;
  let escape = false;
  const stack: string[] = [];

  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (ch === '\\') {
      escape = true;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;

    if (ch === '{') stack.push('}');
    else if (ch === '[') stack.push(']');
    else if (ch === '}' || ch === ']') {
      if (stack.length > 0 && stack[stack.length - 1] === ch) {
        stack.pop();
      }
    }
  }

  if (inString) {
    str += '"';
  }

  str = str.replace(/,\s*$/, '');

  while (stack.length > 0) {
    const closing = stack.pop();
    str += closing;
  }

  return str;
}

// Robust JSON extractor: handles <think> reasoning tags, unclosed tags, markdown fences, control chars, and brace counting
export function repairAndParseJSON(raw: string): any {
  // 1. Strip <think>...</think> if present
  let text = raw.replace(/<think>[\s\S]*?<\/think>/gi, '');
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

  // Extract from first '{'
  let jsonSub = text.substring(start);

  // 4. Try standard JSON.parse
  try {
    return JSON.parse(jsonSub);
  } catch {
    // Attempt 1: Fix control chars & unescaped newlines inside strings
    const sanitized = jsonSub.replace(/[\u0000-\u001F]+/g, (match) => {
      if (match.includes('\n')) return '\\n';
      if (match.includes('\r')) return '\\r';
      if (match.includes('\t')) return '\\t';
      return '';
    });

    try {
      return JSON.parse(sanitized);
    } catch {
      // Attempt 2: Repair cut-off/truncated JSON string & braces
      const fixed = fixTruncatedJSON(sanitized);
      return JSON.parse(fixed);
    }
  }
}

async function callGroqAPI(prompt: string, groqKey: string): Promise<string> {
  const groq = new Groq({ apiKey: groqKey });
  const models = [
    'openai/gpt-oss-120b',
    'openai/gpt-oss-20b',
    'qwen/qwen3.6-27b',
    'groq/compound',
    'groq/compound-mini',
  ];
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
      console.warn(`Groq model '${m}' failed (${err?.message || err}). Trying next model...`);
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

CRITICAL IDENTITY & CONTENT RULES:
1. CANDIDATE IDENTITY IS MANDATORY: You MUST extract and preserve the candidate's ACTUAL full name, email address, phone number, location, education, work experience, projects, and skills from the ACCUMULATED USER CONTEXT (especially the "Uploaded Resume Context").
2. DO NOT USE PLACEHOLDER OR RANDOM NAMES: NEVER invent fake names like "Full Name", "John Doe", "Jane Doe", "Alex Morgan", or hardcoded names. The candidate's real name MUST appear in the "name" field.
3. Every bullet point MUST start with a strong ACTION VERB (Architected, Engineered, Spearheaded, Optimized, Implemented, Developed, Led, Designed, Built, Deployed, Integrated, Automated, etc.)
4. Include QUANTIFIED METRICS wherever possible (percentages, numbers, dollar amounts, time savings)
5. Use industry-specific keywords for maximum ATS score
6. Keep professional summary to 2-3 impactful sentences
7. For technical skills, categorize into Languages, Frameworks & Libraries, and Developer Tools
8. For projects, include 2-3 bullet points per project describing technical achievements
9. Make the content specific, detailed, and achievement-oriented — NOT generic

USER INSTRUCTION: "${customPrompt}"

ACCUMULATED USER CONTEXT:
"""
${contextChunks}
"""

Return RAW JSON (no markdown fences, no explanation) matching this EXACT structure (substitute actual candidate data into fields):
{
  "name": "<Candidate's Real Full Name extracted from context>",
  "email": "<Candidate's Email>",
  "phone": "<Candidate's Phone>",
  "location": "<City, State/Country>",
  "targetRole": "<Target Role>",
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
      "degree": "Degree Name — CGPA/GPA",
      "year": "Start Year – End Year",
      "cgpa": "X.XX",
      "location": "City, Country"
    }
  ],
  "experiences": [
    {
      "company": "Company Name",
      "role": "Job Title",
      "duration": "Month Year – Month Year",
      "location": "Remote / City",
      "certificate": "certificate-link",
      "bulletPoints": ["Action verb + quantifiable impact sentence 1", "Action verb + technical accomplishment 2"]
    }
  ],
  "projects": [
    {
      "title": "Project Name",
      "description": "One line overview",
      "techStack": ["Next.js", "TypeScript", "Tailwind CSS"],
      "link": "project-link",
      "bulletPoints": ["Built feature X achieving Y% improvement", "Integrated Z technology for A purpose"]
    }
  ],
  "achievements": [
    "Achievement metric 1",
    "Achievement metric 2"
  ],
  "certifications": [
    {
      "name": "Certification Name",
      "issuer": "Issuer Name",
      "link": "verification-link",
      "date": "Month Year"
    }
  ],
  "activities": [
    {
      "name": "Activity / Club Name",
      "institution": "Organization / Institution",
      "duration": "Duration",
      "description": "Description of responsibilities and achievements"
    }
  ],
  "hackathons": ["Hackathon Name (Year)"]
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
      const candidateModels = ['gemini-3.6-flash', 'gemini-3.6-pro', 'gemini-3.5-flash', 'gemini-2.5-flash'];
      let lastError: any = null;

      for (const modelName of candidateModels) {
        try {
          const model = genAI.getGenerativeModel({
            model: modelName,
            generationConfig: {
              maxOutputTokens: 8192,
              responseMimeType: 'application/json',
            },
          });
          const result = await model.generateContent(systemInstruction);
          responseText = result.response.text();
          lastError = null;
          break;
        } catch (err: any) {
          lastError = err;
          const status = err?.status || err?.httpStatusCode;
          const msg = String(err?.message || '');
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

    const parsed = repairAndParseJSON(responseText);
    return {
      ...userProfile,
      ...parsed,
    };
  } catch (error) {
    console.error('RAG content generation error, falling back to profile merge:', error);
    return generateDefaultRAGProfile(userProfile, customPrompt);
  }
}

export function extractIdentityFromResumeText(text?: string): {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
} {
  if (!text || !text.trim()) return {};

  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  let email: string | undefined;
  let phone: string | undefined;
  let name: string | undefined;
  let location: string | undefined;

  // Extract email
  const emailMatch = text.match(/[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}/);
  if (emailMatch) email = emailMatch[0];

  // Extract phone number
  const phoneMatch = text.match(/(\+?\d{1,3}[\s-]?)?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}/);
  if (phoneMatch) phone = phoneMatch[0];

  // Name extraction heuristic: look at top 10 lines for candidate name
  for (const line of lines.slice(0, 10)) {
    const cleanLine = line.replace(/[^\w\s]/g, '').trim();
    const wordCount = cleanLine.split(/\s+/).length;
    const lower = cleanLine.toLowerCase();

    if (
      wordCount >= 2 &&
      wordCount <= 4 &&
      !lower.includes('resume') &&
      !lower.includes('curriculum') &&
      !lower.includes('page') &&
      !lower.includes('email') &&
      !lower.includes('phone') &&
      !lower.includes('contact') &&
      !lower.includes('summary') &&
      !lower.includes('experience') &&
      !lower.includes('education') &&
      !lower.includes('skills') &&
      !lower.includes('http') &&
      !lower.includes('github') &&
      !lower.includes('linkedin') &&
      !/\d/.test(cleanLine)
    ) {
      name = cleanLine;
      break;
    }
  }

  return { name, email, phone, location };
}

function generateDefaultRAGProfile(
  existing: UserContextProfile,
  prompt: string
): UserContextProfile {
  const extracted = extractIdentityFromResumeText(existing.uploadedResumeText);

  return {
    ...existing,
    name: existing.name || extracted.name || 'Candidate Name',
    email: existing.email || extracted.email || '',
    phone: existing.phone || extracted.phone || '',
    location: existing.location || extracted.location || '',
    targetRole: existing.targetRole || 'Software Engineer',
    linkedin: existing.linkedin || '',
    github: existing.github || '',
    leetcode: existing.leetcode || '',
    portfolio: existing.portfolio || '',
    summary:
      existing.summary ||
      'Software Engineer with experience developing robust web applications, optimizing performance, and building modern software solutions.',
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
        company: 'Software Engineering Organization',
        role: existing.targetRole || 'Software Developer',
        duration: 'Jan 2024 – Present',
        location: 'Remote',
        bulletPoints: [
          'Developed and optimized full-stack features, improving system performance and overall user response times.',
          'Collaborated with cross-functional teams to design RESTful API services and scalable database queries.',
        ],
      },
    ],
    projects: existing.projects || [
      {
        title: 'Full-Stack Web Platform',
        description: 'Modern web application featuring secure user authentication, responsive UI, and API integration.',
        techStack: ['Next.js', 'TypeScript', 'Tailwind CSS', 'PostgreSQL'],
        bulletPoints: [
          'Architected responsive user interface and integrated backend APIs for seamless data handling.',
          'Implemented secure authentication and optimized frontend state management.',
        ],
      },
    ],
    education: existing.education || [
      {
        institution: 'University / Institute of Technology',
        degree: 'Bachelor of Technology / Bachelor of Science in Computer Science',
        year: '2022 – 2026',
        cgpa: '3.8/4.0',
        location: 'City, Country',
      },
    ],
    achievements: existing.achievements || [
      'Demonstrated consistent problem-solving capabilities across technical challenges and projects.',
    ],
    activities: existing.activities || [],
    hackathons: existing.hackathons || [],
  };
}

export interface JDMatchResult {
  matchScore: number; // 0 to 100
  matchingKeywords: string[];
  missingKeywords: string[];
  strengths: string[];
  tailoredSuggestions: string[];
}

export async function analyzeJDMatchWithAI(
  userProfile: UserContextProfile,
  jobDescription: string
): Promise<JDMatchResult> {
  const profileContext = JSON.stringify({
    name: userProfile.name,
    targetRole: userProfile.targetRole,
    summary: userProfile.summary,
    skills: userProfile.skills,
    technicalSkills: userProfile.technicalSkills,
    experiences: userProfile.experiences,
    projects: userProfile.projects,
    education: userProfile.education,
    uploadedResumeText: userProfile.uploadedResumeText?.slice(0, 3000),
  });

  const prompt = `
You are an executive ATS matching engine. Compare the Candidate Profile against the Target Job Description below.

Calculate an accurate ATS Compatibility Match Score (0-100), extract matching skills/keywords present in both, missing critical skills/keywords required by the JD, key candidate strengths, and actionable suggestions.

Candidate Profile:
"""
${profileContext}
"""

Target Job Description:
"""
${jobDescription.slice(0, 5000)}
"""

Return RAW JSON matching this structure:
{
  "matchScore": 82,
  "matchingKeywords": ["React", "Next.js", "TypeScript", "REST APIs"],
  "missingKeywords": ["Docker", "Kubernetes", "GraphQL", "CI/CD"],
  "strengths": ["Strong background in Next.js & modern frontend architecture", "Quantified achievements in full-stack performance optimization"],
  "tailoredSuggestions": ["Explicitly mention containerization exposure (Docker)", "Highlight CI/CD deployment pipelines in project section"]
}
`;

  const geminiKey = process.env.GEMINI_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;

  try {
    let raw = '';
    if (groqKey && groqKey !== 'your_groq_api_key_here') {
      raw = await callGroqAPI(prompt, groqKey);
    } else if (geminiKey && geminiKey.length > 10) {
      const genAI = new GoogleGenerativeAI(geminiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });
      const res = await model.generateContent(prompt);
      raw = res.response.text();
    } else {
      return generateHeuristicJDMatch(userProfile, jobDescription);
    }

    const parsed = repairAndParseJSON(raw);
    return {
      matchScore: Math.min(100, Math.max(0, Number(parsed.matchScore) || 75)),
      matchingKeywords: parsed.matchingKeywords || [],
      missingKeywords: parsed.missingKeywords || [],
      strengths: parsed.strengths || [],
      tailoredSuggestions: parsed.tailoredSuggestions || [],
    };
  } catch (err) {
    console.error('JD match AI error, falling back to heuristic:', err);
    return generateHeuristicJDMatch(userProfile, jobDescription);
  }
}

function generateHeuristicJDMatch(profile: UserContextProfile, jd: string): JDMatchResult {
  const jdLower = jd.toLowerCase();
  const profileSkills = [
    ...(profile.skills || []),
    ...(profile.technicalSkills?.languages || []),
    ...(profile.technicalSkills?.frameworks || []),
    ...(profile.technicalSkills?.tools || []),
  ].map((s) => s.toLowerCase());

  const commonKeywords = ['react', 'next.js', 'typescript', 'javascript', 'node.js', 'python', 'docker', 'aws', 'sql', 'graphql', 'ci/cd', 'tailwind', 'express', 'git', 'postgres', 'mongodb', 'redux', 'rest api', 'unit testing'];
  
  const matchingKeywords: string[] = [];
  const missingKeywords: string[] = [];

  commonKeywords.forEach((kw) => {
    if (jdLower.includes(kw)) {
      if (profileSkills.some((s) => s.includes(kw))) {
        matchingKeywords.push(kw.toUpperCase());
      } else {
        missingKeywords.push(kw.toUpperCase());
      }
    }
  });

  const totalJdKeywords = matchingKeywords.length + missingKeywords.length;
  const matchScore = totalJdKeywords > 0 ? Math.round((matchingKeywords.length / totalJdKeywords) * 100) : 78;

  return {
    matchScore,
    matchingKeywords: matchingKeywords.length > 0 ? matchingKeywords : ['TypeScript', 'React', 'REST APIs'],
    missingKeywords: missingKeywords.length > 0 ? missingKeywords : ['Docker', 'CI/CD'],
    strengths: ['Relevant technical skill matches found in candidate profile', 'Structured experience background'],
    tailoredSuggestions: ['Incorporate missing keywords into experience bullet points and technical skills list.'],
  };
}
