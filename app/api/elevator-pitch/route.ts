import { NextRequest, NextResponse } from "next/server";
import { generateElevatorPitchWithAI, UserContextProfile } from "@/lib/ai/rag-chain";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { profile } = body as { profile: UserContextProfile };

    const result = await generateElevatorPitchWithAI(profile || {});

    return NextResponse.json({
      success: true,
      pitchResult: result,
    });
  } catch (error) {
    console.error("Elevator pitch API error:", error);
    return NextResponse.json({ error: "Failed to generate elevator pitch script" }, { status: 500 });
  }
}
