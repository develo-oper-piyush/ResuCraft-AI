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
    const { profile, prompt } = body as { profile: UserContextProfile; prompt: string };

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const sanitizedPrompt = securityGuard.sanitizePrompt(prompt);
    const cacheKey = aiCache.generateKey("rag-generate", { profile, prompt: sanitizedPrompt });

    const cached = aiCache.get<UserContextProfile>(cacheKey);
    if (cached) {
      return NextResponse.json({ success: true, profile: cached, cached: true });
    }

    const updatedProfile = await generateRAGResumeContent(profile || {}, sanitizedPrompt);
    aiCache.set(cacheKey, updatedProfile);

    return NextResponse.json({
      success: true,
      profile: updatedProfile,
    });
  } catch (error) {
    console.error("RAG generate API error:", error);
    return NextResponse.json(
      { error: "Failed to generate context response" },
      { status: 500 }
    );
  }
}
