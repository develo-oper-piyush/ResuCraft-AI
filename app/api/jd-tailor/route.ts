import { NextRequest, NextResponse } from "next/server";
import { generateRAGResumeContent, UserContextProfile } from "@/lib/ai/rag-chain";

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

    const customPrompt = `TAILOR RESUME SPECIFICALLY FOR THIS TARGET JOB DESCRIPTION:
"""
${jobDescription.slice(0, 4000)}
"""
Instructions: Re-architect summary, technical skills categorization, project descriptions, and experience bullet points to seamlessly incorporate missing hard skills and target keywords while preserving candidate truthfulness. Make bullet points start with strong action verbs and include metrics.`;

    const tailoredProfile = await generateRAGResumeContent(profile || {}, customPrompt);

    return NextResponse.json({
      success: true,
      profile: tailoredProfile,
    });
  } catch (error) {
    console.error("JD tailor API error:", error);
    return NextResponse.json({ error: "Failed to tailor resume for job description" }, { status: 500 });
  }
}
