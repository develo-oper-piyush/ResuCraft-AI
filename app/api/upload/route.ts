import { NextRequest, NextResponse } from "next/server";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { extractTextFromPDF } from "@/lib/pdf-parser";
import { analyzeResumeWithAI } from "@/lib/ai/gemini-groq-client";
import { inMemoryStore } from "@/lib/db";
import { saveUploadedResumeToSupabase } from "@/lib/supabase/server";
import { saveLocalUploadedResume, saveUploadedPdfBuffer } from "@/lib/local-storage";
import { createClient } from "@supabase/supabase-js";

export const dynamic = 'force-dynamic';

// Extract the authenticated user's ID from the request
async function getUserId(req: NextRequest): Promise<string> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    if (!supabaseUrl || !supabaseAnonKey) return 'anonymous';

    // Get auth token from the cookie or authorization header
    const authHeader = req.headers.get('authorization');
    const cookies = req.headers.get('cookie') || '';
    
    // Extract access token from Supabase auth cookie
    const tokenMatch = cookies.match(/sb-[^=]+-auth-token[^=]*=([^;]+)/);
    let accessToken = authHeader?.replace('Bearer ', '') || '';
    
    if (!accessToken && tokenMatch) {
      try {
        // Supabase stores tokens as base64-encoded JSON array
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

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const targetRole = (formData.get("targetRole") as string) || "Software Engineer";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const userId = await getUserId(req);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 1. Extract raw text server-side
    const parsedText = await extractTextFromPDF(buffer);

    // 2. Generate unique record ID
    const resId = `res_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // 3. Save PDF buffer locally to disk
    saveUploadedPdfBuffer(resId, buffer);

    // 4. Upload PDF to Cloudinary
    const uploadResult = await uploadToCloudinary(buffer, "user_resumes", file.name);

    // 5. If Cloudinary is using mock demo URLs, point to local PDF endpoint
    const isMockUrl =
      uploadResult.url.includes("cloudinary.com/demo") ||
      uploadResult.url.includes("fallback/");
    const finalFileUrl = isMockUrl ? `/api/resumes/pdf/${resId}` : uploadResult.url;

    // 6. Perform AI analysis
    const analysisResult = await analyzeResumeWithAI(parsedText, targetRole);

    const newRecord = {
      id: resId,
      userId,
      fileName: file.name,
      fileUrl: finalFileUrl,
      cloudinaryId: uploadResult.publicId,
      parsedText,
      analysisJson: analysisResult,
      targetRole,
      createdAt: new Date().toISOString(),
    };

    inMemoryStore.uploadedResumes.unshift(newRecord);
    saveLocalUploadedResume(newRecord);

    // 7. Save to Supabase DB
    await saveUploadedResumeToSupabase(newRecord);

    return NextResponse.json({
      success: true,
      resume: newRecord,
    });
  } catch (error) {
    console.error("Upload API handler error:", error);
    return NextResponse.json(
      { error: "Failed to process and upload resume PDF" },
      { status: 500 }
    );
  }
}
