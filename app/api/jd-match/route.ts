import { NextRequest, NextResponse } from "next/server";
import { analyzeJDMatchWithAI, UserContextProfile } from "@/lib/ai/rag-chain";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { profile, jobDescription } = body as {
      profile: UserContextProfile;
      jobDescription: string;
    };

    if (!jobDescription || !jobDescription.trim()) {
      return NextResponse.json({ error: "Job description is required" }, { status: 400 });
    }

    const matchResult = await analyzeJDMatchWithAI(profile || {}, jobDescription);

    return NextResponse.json({
      success: true,
      matchResult,
    });
  } catch (error) {
    console.error("JD match API error:", error);
    return NextResponse.json({ error: "Failed to analyze job description match" }, { status: 500 });
  }
}
