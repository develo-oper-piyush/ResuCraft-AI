import { NextRequest, NextResponse } from "next/server";
import { analyzeResumeWithAI } from "@/lib/ai/gemini-groq-client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, targetRole } = body;

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Valid text is required for AI resume analysis" },
        { status: 400 }
      );
    }

    const analysis = await analyzeResumeWithAI(text, targetRole || "Software Engineer");

    return NextResponse.json({
      success: true,
      analysis,
    });
  } catch (error) {
    console.error("AI Analysis API error:", error);
    return NextResponse.json(
      { error: "Failed to complete AI resume analysis" },
      { status: 500 }
    );
  }
}
