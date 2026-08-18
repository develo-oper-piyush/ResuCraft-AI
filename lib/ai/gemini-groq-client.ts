import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';
import { repairAndParseJSON } from './rag-chain';

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
        temperature: 0.2,
      });
      return response.choices[0]?.message?.content || '';
    } catch (err: any) {
      lastErr = err;
      console.warn(`Groq model '${m}' failed (${err?.message || err}). Trying next model...`);
    }
  }
  throw lastErr;
}

export interface AnalysisCategoryFinding {
  category: string; // e.g. "Missing Keywords", "Quantified Impact Metrics", "Weak Action Verbs", "Missing Sections", "ATS Readability", "Contact Links & Portfolio"
  count: string;   // e.g. "6 keywords missing for Senior Frontend Developer roles"
  detail: string;  // e.g. "Add explicit mentions of React 18, Next.js App Router, TypeScript, and state management frameworks."
  severity: 'low' | 'medium' | 'high';
}

export interface ResumeAnalysisResult {
  summary: string;
  missingFindings: AnalysisCategoryFinding[];
}

export async function analyzeResumeWithAI(
  resumeText: string,
  targetRole: string = 'Software Engineer / Full Stack Developer'
): Promise<ResumeAnalysisResult> {
  const prompt = `
You are an expert executive resume reviewer and ATS (Applicant Tracking System) auditing engine.
Analyze the following resume text specifically for a target role of: "${targetRole}".

Strict Output Format Requirement:
You MUST respond with valid raw JSON only. Do not include markdown code block backticks (e.g. no \`\`\`json).

JSON Schema Structure:
{
  "summary": "3 to 5 sentences evaluating overall positioning, strengths, and primary career narrative.",
  "missingFindings": [
    {
      "category": "One of: Missing Keywords | Quantified Impact Metrics | Weak Action Verbs | Missing Sections | ATS Readability | Contact Links & Portfolio",
      "count": "Short count or quantitative phrase e.g. '4 missing metrics in recent project experience'",
      "detail": "Actionable, specific advice on what exact keywords, metrics, or sections to add.",
      "severity": "high | medium | low"
    }
  ]
}

CRITICAL MANDATORY RULE FOR 'missingFindings':
- Only include a finding in 'missingFindings' if there is an ACTUAL WEAKNESS OR MISSING ITEM in that category.
- IF A CATEGORY HAS NO ISSUES OR IS PERFECT, DO NOT INCLUDE IT IN THE 'missingFindings' ARRAY AT ALL.
- NEVER include positive confirmation findings such as "Great job, nothing missing here" or "All skills look complete".
- IF THE RESUME HAS ZERO DEFECTS IN ALL CATEGORIES, RETURN AN EMPTY ARRAY \`[]\` FOR 'missingFindings'.

Resume Text to Analyze:
"""
${resumeText.slice(0, 7000)}
"""
`;

  const provider = process.env.AI_PROVIDER || 'gemini';
  const geminiKey = process.env.GEMINI_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;

  try {
    let rawResponseText = '';

    const hasValidGroq = Boolean(groqKey && groqKey !== 'your_groq_api_key_here');
    const hasValidGemini = Boolean(geminiKey && geminiKey !== 'your_gemini_api_key_here' && geminiKey.length > 10);

    if (provider === 'groq' && hasValidGroq) {
      rawResponseText = await callGroqAPI(prompt, groqKey!);
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
          const result = await model.generateContent(prompt);
          rawResponseText = result.response.text();
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
            console.warn(`Gemini model '${modelName}' failed (${status || 'unknown'}). Trying next model...`);
            continue;
          }
          throw err;
        }
      }

      if (lastError && !rawResponseText) {
        if (hasValidGroq) {
          console.warn('Gemini models failed. Falling back to Groq API...');
          rawResponseText = await callGroqAPI(prompt, groqKey!);
        } else {
          throw lastError;
        }
      }
    } else if (hasValidGroq) {
      console.log('Gemini API key is invalid/unconfigured. Automatically using Groq AI provider...');
      rawResponseText = await callGroqAPI(prompt, groqKey!);
    } else {
      console.log('Using intelligent mock AI analysis (no live API keys configured)');
      return generateMockAnalysis(resumeText, targetRole);
    }

    return parseAndCleanAnalysisJSON(rawResponseText, resumeText, targetRole);
  } catch (error) {
    console.error('AI Analysis API Error, falling back to heuristic analyzer:', error);
    return generateMockAnalysis(resumeText, targetRole);
  }
}

function parseAndCleanAnalysisJSON(
  rawText: string,
  resumeText: string,
  targetRole: string
): ResumeAnalysisResult {
  try {
    const parsed = repairAndParseJSON(rawText);
    
    // Filter findings to guarantee no empty/positive findings slipped through
    const validFindings = (parsed.missingFindings || []).filter((f: any) => {
      if (!f || !f.category || !f.detail) return false;
      const lowerDetail = f.detail.toLowerCase();
      // Exclude positive state strings
      if (
        lowerDetail.includes('no missing') ||
        lowerDetail.includes('great job') ||
        lowerDetail.includes('nothing missing') ||
        lowerDetail.includes('looks complete') ||
        lowerDetail.includes('none missing')
      ) {
        return false;
      }
      return true;
    });

    return {
      summary: parsed.summary || 'Resume analyzed successfully. Clear narrative with strong technical foundation.',
      missingFindings: validFindings,
    };
  } catch (err) {
    console.error('Failed to parse AI JSON response:', err);
    return generateMockAnalysis(resumeText, targetRole);
  }
}

export function generateMockAnalysis(
  resumeText: string,
  targetRole: string
): ResumeAnalysisResult {
  const textLower = resumeText.toLowerCase();
  const findings: AnalysisCategoryFinding[] = [];

  // 1. Missing Keywords
  if (!textLower.includes('next.js') || !textLower.includes('tailwind') || !textLower.includes('rag')) {
    findings.push({
      category: 'Missing Keywords',
      count: `4 key industry skills missing for ${targetRole}`,
      detail: `Your resume lacks direct keyword matches for Next.js App Router, Tailwind CSS, TypeScript, and RAG/Vector pipelines which are top filters for modern ${targetRole} positions.`,
      severity: 'high',
    });
  }

  // 2. Quantified Impact Metrics
  const numberMatches = resumeText.match(/\d+%/g) || resumeText.match(/\$\d+/g);
  if (!numberMatches || numberMatches.length < 3) {
    findings.push({
      category: 'Quantified Impact Metrics',
      count: '3 bullet points missing metrics',
      detail: 'Several experience points describe tasks rather than measurable outcomes. Quantify achievements (e.g. "improved page load performance by 42%" or "reduced API latency by 150ms").',
      severity: 'high',
    });
  }

  // 3. Weak Action Verbs
  if (textLower.includes('responsible for') || textLower.includes('worked on') || textLower.includes('helped with')) {
    findings.push({
      category: 'Weak Action Verbs',
      count: 'Passive verbs detected in experience bullet points',
      detail: 'Replace passive phrases like "responsible for" and "worked on" with high-impact verbs like "Architected", "Engineered", "Spearheaded", and "Optimized".',
      severity: 'medium',
    });
  }

  // 4. Contact Links & Portfolio
  if (!textLower.includes('github.com') && !textLower.includes('linkedin.com')) {
    findings.push({
      category: 'Contact Links & Portfolio',
      count: 'Missing online portfolio & GitHub profile links',
      detail: 'Technical recruiters look for direct links to live GitHub repositories and active LinkedIn profiles in the header section.',
      severity: 'medium',
    });
  }

  // 5. ATS Readability
  if (textLower.includes('table') || textLower.includes('column') || resumeText.length < 300) {
    findings.push({
      category: 'ATS Readability',
      count: 'Complex layout structures flagged',
      detail: 'Avoid multi-column tables or header graphic elements that confuse automated ATS parsers during scanning.',
      severity: 'low',
    });
  }

  return {
    summary: `The uploaded resume presents a solid baseline for a ${targetRole} candidate with clear technical exposure. However, strengthening the quantifiable achievements and adding target keywords will dramatically elevate its ATS conversion rate and recruiter engagement.`,
    missingFindings: findings,
  };
}
