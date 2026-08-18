"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Lock,
  ArrowLeft,
  LogOut,
  Check,
  Sparkles,
  Shield,
  Briefcase,
  MapPin,
  Phone,
  Globe,
  Github,
  Linkedin,
  Code,
  Save,
  Loader2,
  AlertCircle,
  Home
} from "lucide-react";
import { Button } from "@/components/ui/stateful-button";
import { createClient } from "@/lib/supabase/client";

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Profile Form State
  const [userAuth, setUserAuth] = useState<any>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [summary, setSummary] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [github, setGithub] = useState("");
  const [leetcode, setLeetcode] = useState("");
  const [portfolio, setPortfolio] = useState("");

  // Password change state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    async function loadUserProfile() {
      try {
        const supabase = createClient();
        if (!supabase) {
          setLoading(false);
          return;
        }
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserAuth(user);
          setEmail(user.email || "");
          const meta = user.user_metadata || {};
          setFullName(meta.full_name || meta.name || "");
          setTargetRole(meta.target_role || "");
          setLocation(meta.location || "");
          setPhone(meta.phone || "");
          setSummary(meta.summary || "");
          setLinkedin(meta.linkedin || "");
          setGithub(meta.github || "");
          setLeetcode(meta.leetcode || "");
          setPortfolio(meta.portfolio || "");
        }
      } catch (err) {
        console.warn("Could not load user profile:", err);
      } finally {
        setLoading(false);
      }
    }
    loadUserProfile();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    setErrorMsg("");

    try {
      const supabase = createClient();
      if (supabase && userAuth) {
        const { error } = await supabase.auth.updateUser({
          data: {
            full_name: fullName,
            name: fullName,
            target_role: targetRole,
            location,
            phone,
            summary,
            linkedin,
            github,
            leetcode,
            portfolio,
          },
        });
        if (error) throw error;
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update profile metadata.");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword) return;
    if (newPassword !== confirmPassword) {
      setPasswordMsg("Passwords do not match.");
      setPasswordSuccess(false);
      return;
    }
    setPasswordLoading(true);
    setPasswordMsg("");
    setPasswordSuccess(false);

    try {
      const supabase = createClient();
      if (supabase) {
        const { error } = await supabase.auth.updateUser({
          password: newPassword,
        });
        if (error) throw error;
        setPasswordSuccess(true);
        setNewPassword("");
        setConfirmPassword("");
        setPasswordMsg("Password updated successfully!");
      }
    } catch (err: any) {
      setPasswordMsg(err.message || "Failed to update password.");
      setPasswordSuccess(false);
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      if (supabase) {
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.warn("Sign out error:", err);
    } finally {
      router.push("/login");
      router.refresh();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="flex items-center gap-3 text-cyan-400">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-sm font-semibold">Loading User Profile...</span>
        </div>
      </div>
    );
  }

  const initials = fullName
    ? fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : email.slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-6 py-4 sticky top-0 z-40 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-300 hover:text-white bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/30 px-3 py-1.5 rounded-xl transition-all"
          >
            <Home className="h-3.5 w-3.5 text-cyan-400" /> HomeScreen
          </Link>
          <div className="h-4 w-px bg-slate-800" />
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-cyan-400 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
          <div className="h-4 w-px bg-slate-800 hidden sm:block" />
          <div className="hidden sm:flex items-center gap-2">
            <img src="/ResuCraft.png" alt="ResuCraft AI" className="h-6 w-6 object-contain drop-shadow-[0_0_8px_rgba(56,189,248,0.4)]" />
            <h1 className="text-sm font-bold text-white">Account Profile</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 text-xs font-semibold text-rose-400 hover:text-rose-300 bg-rose-950/40 border border-rose-500/30 px-3.5 py-2 rounded-xl transition-all hover:bg-rose-900/50"
          >
            <LogOut className="h-4 w-4" /> Log Out
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto w-full p-6 sm:p-10 flex-1 space-y-8">
        {/* Banner / User Header */}
        <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 border border-slate-800 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl overflow-hidden">
          <div className="absolute -right-10 -bottom-10 h-48 w-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center gap-5 relative z-10">
            <div className="h-20 w-20 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-2xl font-black text-white shadow-xl shadow-cyan-500/20 border-2 border-cyan-400/30 shrink-0">
              {initials || "U"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-white tracking-tight">
                  {fullName || "User Profile"}
                </h1>
                <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-1">
                  <Shield className="h-3 w-3" /> Pro AI Account
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-slate-500" /> {email}
              </p>
              <p className="text-xs text-cyan-400/90 font-medium mt-0.5 flex items-center gap-2">
                <Briefcase className="h-3.5 w-3.5 text-cyan-500" /> {targetRole || "Software Engineer"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 relative z-10 w-full sm:w-auto">
            <button
              onClick={handleLogout}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-rose-500/10 text-rose-300 border border-rose-500/30 text-xs font-bold flex items-center justify-center gap-2 hover:bg-rose-500/20 transition-all"
            >
              <LogOut className="h-4 w-4" /> Sign Out
            </button>
          </div>
        </div>

        {/* Profile Settings Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Form: Personal Details & Links (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            <form onSubmit={handleSaveProfile} className="rounded-3xl bg-slate-900/60 border border-slate-800 p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <User className="h-5 w-5 text-cyan-400" /> Personal Information
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Update your public identity and default values for AI resume generation.
                  </p>
                </div>

                {saveSuccess && (
                  <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-full animate-fade-in">
                    <Check className="h-3.5 w-3.5" /> Saved!
                  </span>
                )}
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/30 text-xs text-rose-200 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-rose-400" /> {errorMsg}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-xs text-white placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
                    placeholder="Piyush Chaudhary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full rounded-xl bg-slate-950/50 border border-slate-800 p-3 text-xs text-slate-400 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                    Target Job Role
                  </label>
                  <input
                    type="text"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-xs text-white placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
                    placeholder="Full Stack Developer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-xs text-white placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
                    placeholder="+91 6396789234"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                    Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-xs text-white placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
                    placeholder="Uttar Pradesh, India"
                  />
                </div>
              </div>

              {/* Social Links Sub-Section */}
              <div className="pt-4 border-t border-slate-800 space-y-4">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                  <Globe className="h-4 w-4 text-cyan-400" /> Developer Portfolios & Social Handles
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      LinkedIn Handle
                    </label>
                    <div className="relative flex items-center">
                      <Linkedin className="absolute left-3 h-4 w-4 text-slate-500" />
                      <input
                        type="text"
                        value={linkedin}
                        onChange={(e) => setLinkedin(e.target.value)}
                        className="w-full rounded-xl bg-slate-950 border border-slate-800 pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
                        placeholder="linkedin.com/in/develo-oper-piyush"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      GitHub Profile
                    </label>
                    <div className="relative flex items-center">
                      <Github className="absolute left-3 h-4 w-4 text-slate-500" />
                      <input
                        type="text"
                        value={github}
                        onChange={(e) => setGithub(e.target.value)}
                        className="w-full rounded-xl bg-slate-950 border border-slate-800 pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
                        placeholder="github.com/develo-oper-piyush"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      LeetCode Profile
                    </label>
                    <div className="relative flex items-center">
                      <Code className="absolute left-3 h-4 w-4 text-slate-500" />
                      <input
                        type="text"
                        value={leetcode}
                        onChange={(e) => setLeetcode(e.target.value)}
                        className="w-full rounded-xl bg-slate-950 border border-slate-800 pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
                        placeholder="leetcode.com/develo_oper_piyush"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Personal Portfolio URL
                    </label>
                    <div className="relative flex items-center">
                      <Globe className="absolute left-3 h-4 w-4 text-slate-500" />
                      <input
                        type="text"
                        value={portfolio}
                        onChange={(e) => setPortfolio(e.target.value)}
                        className="w-full rounded-xl bg-slate-950 border border-slate-800 pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
                        placeholder="piyushchaudhary.vercel.app"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Professional Summary Sub-Section */}
              <div className="pt-4 border-t border-slate-800">
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                  Default Professional Summary
                </label>
                <textarea
                  rows={3}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-xs text-white placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
                  placeholder="3-sentence summary highlighting your technical skills and impact..."
                />
              </div>

              <div className="pt-2 flex justify-end">
                <Button disabled={saving} className="text-xs py-2.5 px-6 font-bold flex items-center gap-2">
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Saving Changes...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" /> Save Profile Metadata
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>

          {/* Right Sidebar: Security & Password Management (4 Cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Change Password Card */}
            <form onSubmit={handleChangePassword} className="rounded-3xl bg-slate-900/60 border border-slate-800 p-6 space-y-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                <Lock className="h-4 w-4 text-cyan-400" /> Security & Password
              </h2>

              {passwordMsg && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                    passwordSuccess
                      ? "bg-emerald-950/60 border border-emerald-500/30 text-emerald-200"
                      : "bg-rose-950/60 border border-rose-500/30 text-rose-200"
                  }`}
                >
                  {passwordSuccess ? <Check className="h-4 w-4 text-emerald-400" /> : <AlertCircle className="h-4 w-4 text-rose-400" />}
                  {passwordMsg}
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-xs text-white placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
                  placeholder="••••••••••••"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-xs text-white placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
                  placeholder="••••••••••••"
                />
              </div>

              <Button disabled={passwordLoading || !newPassword} variant="outline" className="w-full text-xs py-2.5 mt-2">
                {passwordLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Updating...
                  </span>
                ) : (
                  "Update Password"
                )}
              </Button>
            </form>

            {/* Quick Actions Card */}
            <div className="rounded-3xl bg-slate-900/60 border border-slate-800 p-6 space-y-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                <Sparkles className="h-4 w-4 text-blue-400" /> Account Management
              </h2>

              <p className="text-xs text-slate-400 leading-relaxed">
                Log out of your active session on this device. You will be redirected to the sign-in page.
              </p>

              <button
                type="button"
                onClick={handleLogout}
                className="w-full py-3 rounded-xl bg-rose-950/60 text-rose-300 border border-rose-500/40 text-xs font-bold flex items-center justify-center gap-2 hover:bg-rose-900/60 transition-colors"
              >
                <LogOut className="h-4 w-4 text-rose-400" /> Sign Out of ResuCraft
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
