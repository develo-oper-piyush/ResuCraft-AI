import { NextRequest, NextResponse } from "next/server";
import { analyzeJDMatchWithAI, UserContextProfile } from "@/lib/ai/rag-chain";
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
    const cacheKey = aiCache.generateKey("jd-match", { profile, jd: sanitizedJD });

    const cached = aiCache.get<any>(cacheKey);
    if (cached) {
      return NextResponse.json({ success: true, matchResult: cached, cached: true });
    }

    const matchResult = await analyzeJDMatchWithAI(profile || {}, sanitizedJD);
    aiCache.set(cacheKey, matchResult);

    return NextResponse.json({
      success: true,
      matchResult,
    });
  } catch (error) {
    console.error("JD match API error:", error);
    return NextResponse.json({ error: "Failed to analyze job description match" }, { status: 500 });
  }
}
