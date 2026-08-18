import { NextRequest, NextResponse } from "next/server";
import { generateRAGResumeContent, UserContextProfile } from "@/lib/ai/rag-chain";
import { aiCache } from "@/lib/ai/ai-cache";
import { securityGuard } from "@/lib/ai/security-guard";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const rateCheck = securityGuard.checkRateLimit(ip);
    if (!rateCheck.allowed) {
      return NextResponse.json({ error: "Rate limit exceeded. Please wait a minute." }, { status: 429 });
    }

    const body = await req.json();
    const { profile, jobDescription } = body as {
      profile: UserContextProfile;
      jobDescription: string;
    };

    if (!jobDescription || !jobDescription.trim()) {
      return NextResponse.json({ error: "Job description is required" }, { status: 400 });
    }

    const sanitizedJD = securityGuard.sanitizePrompt(jobDescription);
    const cacheKey = aiCache.generateKey("jd-tailor", { profile, jd: sanitizedJD });

    const cached = aiCache.get<UserContextProfile>(cacheKey);
    if (cached) {
      return NextResponse.json({ success: true, profile: cached, cached: true });
    }

    const customPrompt = `TAILOR RESUME SPECIFICALLY FOR THIS TARGET JOB DESCRIPTION:
"""
${sanitizedJD}
"""
Instructions: Re-architect summary, technical skills categorization, project descriptions, and experience bullet points to seamlessly incorporate missing hard skills and target keywords while preserving candidate truthfulness. Make bullet points start with strong action verbs and include metrics.`;

    const tailoredProfile = await generateRAGResumeContent(profile || {}, customPrompt);
    aiCache.set(cacheKey, tailoredProfile);

    return NextResponse.json({
      success: true,
      profile: tailoredProfile,
    });
  } catch (error) {
    console.error("JD tailor API error:", error);
    return NextResponse.json({ error: "Failed to tailor resume for job description" }, { status: 500 });
  }
}
