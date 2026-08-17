import { createClient } from '@supabase/supabase-js';

export function createSupabaseServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
    },
  });
}

// ─── Auto-create tables if they don't exist ───
let tablesChecked = false;

async function ensureTablesExist(supabase: any) {
  if (tablesChecked) return;
  tablesChecked = true;

  try {
    // Check if uploaded_resumes table exists by trying a select
    const { error: uploadErr } = await supabase
      .from('uploaded_resumes')
      .select('id')
      .limit(1);

    if (uploadErr && uploadErr.message.includes('does not exist')) {
      console.warn(
        '⚠️ Supabase tables not found. Please create them in the Supabase SQL Editor:\n' +
        '   Go to: https://supabase.com/dashboard → SQL Editor → Run the SQL from scripts/setup-supabase-tables.mjs\n' +
        '   Falling back to in-memory storage.'
      );
      tablesChecked = false; // Retry next time
      return false;
    }

    return true;
  } catch (err) {
    console.warn('Could not verify Supabase tables:', err);
    return false;
  }
}

// ─── Get authenticated user ID from request cookie/session ───
async function getAuthUserId(supabase: ReturnType<typeof createClient>): Promise<string | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id || null;
  } catch {
    return null;
  }
}

export async function saveUploadedResumeToSupabase(record: {
  id: string;
  userId: string;
  fileName: string;
  fileUrl: string;
  cloudinaryId?: string;
  parsedText: string;
  analysisJson: any;
  targetRole?: string;
}) {
  const supabase = createSupabaseServerClient();
  if (!supabase) return null;

  const tablesOk = await ensureTablesExist(supabase);
  if (!tablesOk) return null;

  try {
    const { data, error } = await supabase
      .from('uploaded_resumes')
      .insert([
        {
          id: record.id,
          user_id: record.userId,
          file_name: record.fileName,
          file_url: record.fileUrl,
          cloudinary_id: record.cloudinaryId || null,
          parsed_text: record.parsedText,
          analysis_json: record.analysisJson,
          target_role: record.targetRole || null,
          created_at: new Date().toISOString(),
        },
      ])
      .select();

    if (error) {
      console.warn('Supabase insert error for uploaded_resumes:', error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.error('Supabase upload record error:', err);
    return null;
  }
}

export async function saveGeneratedResumeToSupabase(record: {
  id: string;
  userId: string;
  title: string;
  templateId: string;
  contentJson: any;
  exportUrl?: string | null;
}) {
  const supabase = createSupabaseServerClient();
  if (!supabase) return null;

  const tablesOk = await ensureTablesExist(supabase);
  if (!tablesOk) return null;

  try {
    const { data, error } = await supabase
      .from('generated_resumes')
      .insert([
        {
          id: record.id,
          user_id: record.userId,
          title: record.title,
          template_id: record.templateId,
          content_json: record.contentJson,
          export_url: record.exportUrl || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select();

    if (error) {
      console.warn('Supabase insert error for generated_resumes:', error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.error('Supabase generated resume record error:', err);
    return null;
  }
}

export async function fetchResumesFromSupabase(userId?: string) {
  const supabase = createSupabaseServerClient();
  if (!supabase) return { uploadedResumes: [], generatedResumes: [] };

  const tablesOk = await ensureTablesExist(supabase);
  if (!tablesOk) return { uploadedResumes: [], generatedResumes: [] };

  try {
    // Build queries — filter by user_id if provided
    let uploadedQuery = supabase.from('uploaded_resumes').select('*').order('created_at', { ascending: false });
    let generatedQuery = supabase.from('generated_resumes').select('*').order('created_at', { ascending: false });

    if (userId) {
      uploadedQuery = uploadedQuery.eq('user_id', userId);
      generatedQuery = generatedQuery.eq('user_id', userId);
    }

    const [uploadedRes, generatedRes] = await Promise.all([uploadedQuery, generatedQuery]);

    const uploadedResumes = (uploadedRes.data || []).map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      fileName: row.file_name,
      fileUrl: row.file_url,
      cloudinaryId: row.cloudinary_id,
      parsedText: row.parsed_text,
      analysisJson: row.analysis_json,
      targetRole: row.target_role,
      createdAt: row.created_at,
    }));

    const generatedResumes = (generatedRes.data || []).map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      title: row.title,
      templateId: row.template_id,
      contentJson: row.content_json,
      exportUrl: row.export_url,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return { uploadedResumes, generatedResumes };
  } catch (err) {
    console.error('Supabase fetch resumes error:', err);
    return { uploadedResumes: [], generatedResumes: [] };
  }
}
