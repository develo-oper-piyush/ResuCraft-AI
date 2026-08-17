"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Sparkles, AlertCircle } from "lucide-react";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    if (!supabase) {
      setError("Supabase client is not initialized.");
      return;
    }

    const processAuthCallback = async () => {
      try {
        // 1. Check if user already has an active session
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          router.replace("/dashboard");
          return;
        }

        // 2. Listen for auth state changes (handles implicit hash fragment access_token exchange)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, currentSession) => {
            if (currentSession?.user && (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "INITIAL_SESSION")) {
              subscription.unsubscribe();
              router.replace("/dashboard");
            }
          }
        );

        // 3. Fallback timeout if session takes a moment
        setTimeout(async () => {
          const { data: { session: finalSession } } = await supabase.auth.getSession();
          if (finalSession?.user) {
            router.replace("/dashboard");
          } else {
            setError("Authentication callback timed out. Please try signing in again.");
          }
        }, 3000);
      } catch (err: any) {
        console.error("Auth Callback Error:", err);
        setError(err?.message || "Failed to complete authentication callback.");
      }
    };

    processAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 text-center">
      <div className="max-w-md w-full glass-panel rounded-3xl p-8 border border-slate-800 shadow-2xl">
        {error ? (
          <div className="space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
              <AlertCircle className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-bold text-white">Authentication Failed</h1>
            <p className="text-xs text-rose-300 bg-rose-950/40 p-3 rounded-xl border border-rose-500/20">{error}</p>
            <button
              onClick={() => router.push("/login")}
              className="mt-4 px-6 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-white hover:bg-slate-800 transition-colors"
            >
              Back to Login
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto">
              <Sparkles className="h-6 w-6 animate-pulse" />
            </div>
            <h1 className="text-xl font-bold text-white">Completing Sign In</h1>
            <p className="text-xs text-slate-400">Verifying session tokens with Supabase and launching your dashboard...</p>
            <div className="flex items-center justify-center pt-2">
              <Loader2 className="h-5 w-5 animate-spin text-cyan-400" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
