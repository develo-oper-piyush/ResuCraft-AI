import { NextRequest, NextResponse } from "next/server";
import { inMemoryStore } from "@/lib/db";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { saveGeneratedResumeToSupabase, fetchResumesFromSupabase } from "@/lib/supabase/server";
import { getLocalResumes, saveLocalGeneratedResume } from "@/lib/local-storage";
import { createClient } from "@supabase/supabase-js";

export const dynamic = 'force-dynamic';

// Extract the authenticated user's ID from the request
async function getUserId(req: NextRequest): Promise<string> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    if (!supabaseUrl || !supabaseAnonKey) return 'anonymous';

    const authHeader = req.headers.get('authorization');
    const cookies = req.headers.get('cookie') || '';
    
    const tokenMatch = cookies.match(/sb-[^=]+-auth-token[^=]*=([^;]+)/);
    let accessToken = authHeader?.replace('Bearer ', '') || '';
    
    if (!accessToken && tokenMatch) {
      try {
        const decoded = Buffer.from(decodeURIComponent(tokenMatch[1]), 'base64').toString();
        const parsed = JSON.parse(decoded);
        if (Array.isArray(parsed) && parsed[0]) {
          accessToken = parsed[0];
        }
      } catch {
        // Token may be stored differently
      }
    }

    if (accessToken) {
      const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        auth: { persistSession: false },
        global: { headers: { Authorization: `Bearer ${accessToken}` } },
      });
      const { data: { user } } = await supabase.auth.getUser(accessToken);
      if (user?.id) return user.id;
    }

    return 'anonymous';
  } catch {
    return 'anonymous';
  }
}

export async function GET(req: NextRequest) {
  try {
    const userId = await getUserId(req);
    const localData = getLocalResumes(userId);
    const supabaseData = await fetchResumesFromSupabase(userId !== 'anonymous' ? userId : undefined);

    // Merge inMemoryStore, local disk store (data/resumes.json), and Supabase records (preventing duplicates)
    const combinedUploaded = [...localData.uploadedResumes];
    inMemoryStore.uploadedResumes.forEach((item) => {
      if (!combinedUploaded.some((existing) => existing.id === item.id)) {
        combinedUploaded.push(item);
      }
    });
    supabaseData.uploadedResumes.forEach((item) => {
      if (!combinedUploaded.some((existing) => existing.id === item.id)) {
        combinedUploaded.push(item);
      }
    });

    const combinedGenerated = [...localData.generatedResumes];
    inMemoryStore.generatedResumes.forEach((item) => {
      if (!combinedGenerated.some((existing) => existing.id === item.id)) {
        combinedGenerated.push(item);
      }
    });
    supabaseData.generatedResumes.forEach((item) => {
      if (!combinedGenerated.some((existing) => existing.id === item.id)) {
        combinedGenerated.push(item);
      }
    });

    // Sanitize any mock Cloudinary URLs so viewing original PDF always works via local PDF endpoint
    const sanitizedUploaded = combinedUploaded.map((item) => {
      const isMockUrl =
        !item.fileUrl ||
        item.fileUrl.includes("cloudinary.com/demo") ||
        item.fileUrl.includes("fallback/");
      return {
        ...item,
        fileUrl: isMockUrl ? `/api/resumes/pdf/${item.id}` : item.fileUrl,
      };
    });

    return NextResponse.json({
      uploadedResumes: sanitizedUploaded,
      generatedResumes: combinedGenerated,
    });
  } catch (err) {
    console.error("GET /api/resumes error:", err);
    const localData = getLocalResumes();
    return NextResponse.json({
      uploadedResumes: localData.uploadedResumes,
      generatedResumes: localData.generatedResumes,
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId(req);
    const body = await req.json();
    const { title, templateId, contentJson, pdfDataUrl } = body;

    let exportUrl = null;
    if (pdfDataUrl) {
      const uploadRes = await uploadToCloudinary(pdfDataUrl, "generated_exports", `${title || "resume"}.pdf`);
      exportUrl = uploadRes.url;
    }

    const newGen = {
      id: `gen_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId,
      title: title || "My Custom Resume",
      templateId: templateId || "modern-minimal",
      contentJson,
      exportUrl,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    inMemoryStore.generatedResumes.unshift(newGen);
    saveLocalGeneratedResume(newGen);

    // Save generated resume to Supabase DB
    await saveGeneratedResumeToSupabase(newGen);

    return NextResponse.json({
      success: true,
      resume: newGen,
    });
  } catch (error) {
    console.error("Save resume API error:", error);
    return NextResponse.json({ error: "Failed to save resume" }, { status: 500 });
  }
}
