import { NextRequest, NextResponse } from "next/server";
import { generateElevatorPitchWithAI, UserContextProfile } from "@/lib/ai/rag-chain";
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
    const { profile } = body as { profile: UserContextProfile };

    const cacheKey = aiCache.generateKey("elevator-pitch", profile);
    const cached = aiCache.get<any>(cacheKey);

    if (cached) {
      return NextResponse.json({ success: true, pitchResult: cached, cached: true });
    }

    const result = await generateElevatorPitchWithAI(profile || {});
    aiCache.set(cacheKey, result);

    return NextResponse.json({
      success: true,
      pitchResult: result,
    });
  } catch (error) {
    console.error("Elevator pitch API error:", error);
    return NextResponse.json({ error: "Failed to generate elevator pitch script" }, { status: 500 });
  }
}
