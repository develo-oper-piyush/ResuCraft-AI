import { NextRequest, NextResponse } from "next/server";
import { generateRAGResumeContent, UserContextProfile } from "@/lib/ai/rag-chain";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { profile, prompt } = body as { profile: UserContextProfile; prompt: string };

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const updatedProfile = await generateRAGResumeContent(profile || {}, prompt);

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
