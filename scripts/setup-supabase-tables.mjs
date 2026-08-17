// Run this script to create the required tables in Supabase
// Usage: node scripts/setup-supabase-tables.mjs

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ykrdznvwjbxhhwzwemqe.supabase.co';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlrcmR6bnZ3amJ4aGh3endlbXFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY0NjM0ODEsImV4cCI6MjEwMjAzOTQ4MX0.fQRL5DRagsA_Uu35REDREo48Msgf_rbkAKwO0I-gIQw';

const sqlStatements = `
-- Create uploaded_resumes table
CREATE TABLE IF NOT EXISTS public.uploaded_resumes (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL DEFAULT '',
  cloudinary_id TEXT,
  parsed_text TEXT NOT NULL DEFAULT '',
  analysis_json JSONB,
  target_role TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create generated_resumes table
CREATE TABLE IF NOT EXISTS public.generated_resumes (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT 'My Resume',
  template_id TEXT NOT NULL DEFAULT 'modern-minimal',
  content_json JSONB NOT NULL DEFAULT '{}',
  export_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.uploaded_resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_resumes ENABLE ROW LEVEL SECURITY;

-- Policies: allow authenticated users to manage their own rows
CREATE POLICY IF NOT EXISTS "Users can view own uploaded resumes"
  ON public.uploaded_resumes FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert own uploaded resumes"
  ON public.uploaded_resumes FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY IF NOT EXISTS "Users can delete own uploaded resumes"
  ON public.uploaded_resumes FOR DELETE
  USING (auth.uid()::text = user_id);

CREATE POLICY IF NOT EXISTS "Users can view own generated resumes"
  ON public.generated_resumes FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert own generated resumes"
  ON public.generated_resumes FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY IF NOT EXISTS "Users can delete own generated resumes"
  ON public.generated_resumes FOR DELETE
  USING (auth.uid()::text = user_id);

-- Also allow anon/service role for server-side operations
CREATE POLICY IF NOT EXISTS "Service role full access uploaded"
  ON public.uploaded_resumes FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Service role full access generated"
  ON public.generated_resumes FOR ALL
  USING (true)
  WITH CHECK (true);
`;

async function setupTables() {
  console.log('🔧 Setting up Supabase tables...');
  console.log(`📡 Supabase URL: ${SUPABASE_URL}`);
  
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
    },
  });

  // The SQL execution via REST won't work with anon key, so let's use the approach
  // of just creating tables by attempting inserts and letting the app create them
  console.log('');
  console.log('⚠️  Cannot run SQL directly with anon key.');
  console.log('');
  console.log('📋 Please run the following SQL in your Supabase Dashboard:');
  console.log('   Go to: https://supabase.com/dashboard → Select your project → SQL Editor');
  console.log('');
  console.log('─'.repeat(60));
  console.log(sqlStatements);
  console.log('─'.repeat(60));
}

setupTables();
