import { NextRequest, NextResponse } from "next/server";
import { inMemoryStore } from "@/lib/db";
import { getLocalResumes } from "@/lib/local-storage";

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const localData = getLocalResumes();

    // 1. Search in generatedResumes
    let matchingGen = localData.generatedResumes.find((r) => r.id === id);
    if (!matchingGen) {
      matchingGen = inMemoryStore.generatedResumes.find((r) => r.id === id);
    }

    if (matchingGen) {
      return NextResponse.json({
        type: 'generated',
        resume: matchingGen,
      });
    }

    // 2. Search in uploadedResumes
    let matchingUpload = localData.uploadedResumes.find((r) => r.id === id);
    if (!matchingUpload) {
      matchingUpload = inMemoryStore.uploadedResumes.find((r) => r.id === id);
    }

    if (matchingUpload) {
      return NextResponse.json({
        type: 'uploaded',
        resume: matchingUpload,
      });
    }

    // 3. Fallback: if 'new' or first available
    if (localData.uploadedResumes.length > 0) {
      return NextResponse.json({
        type: 'uploaded',
        resume: localData.uploadedResumes[0],
      });
    }

    return NextResponse.json({ error: "Resume not found" }, { status: 404 });
  } catch (error) {
    console.error("GET /api/resumes/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch resume" }, { status: 500 });
  }
}
