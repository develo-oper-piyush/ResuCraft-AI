"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, Info, AlertTriangle, X } from "lucide-react";

export type ToastType = "success" | "info" | "error";

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextType {
  showToast: (title: string, message?: string, type?: ToastType) => void;
  success: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

let globalShowToast: ((title: string, message?: string, type?: ToastType) => void) | null = null;

export function toast(title: string, message?: string, type: ToastType = "info") {
  if (globalShowToast) {
    globalShowToast(title, message, type);
  }
}

toast.success = (title: string, message?: string) => toast(title, message, "success");
toast.info = (title: string, message?: string) => toast(title, message, "info");
toast.error = (title: string, message?: string) => toast(title, message, "error");

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((title: string, message?: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev.slice(-3), { id, title, message, type }]);

    setTimeout(() => {
      removeToast(id);
    }, 3500);
  }, [removeToast]);

  globalShowToast = showToast;

  const contextValue: ToastContextType = {
    showToast,
    success: (t, m) => showToast(t, m, "success"),
    info: (t, m) => showToast(t, m, "info"),
    error: (t, m) => showToast(t, m, "error"),
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {/* Toast Notification Container */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto p-3.5 rounded-2xl border shadow-2xl backdrop-blur-xl transition-all duration-300 flex items-start gap-3 animate-fade-in ${
              t.type === "success"
                ? "bg-slate-900/90 border-emerald-500/40 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                : t.type === "error"
                ? "bg-slate-900/90 border-rose-500/40 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.2)]"
                : "bg-slate-900/90 border-cyan-500/40 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {t.type === "success" ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              ) : t.type === "error" ? (
                <AlertTriangle className="h-4 w-4 text-rose-400" />
              ) : (
                <Info className="h-4 w-4 text-cyan-400" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-white leading-tight">{t.title}</h4>
              {t.message && <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">{t.message}</p>}
            </div>

            <button
              onClick={() => removeToast(t.id)}
              className="text-slate-400 hover:text-white p-0.5 rounded-lg shrink-0 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return {
      showToast: toast,
      success: toast.success,
      info: toast.info,
      error: toast.error,
    };
  }
  return ctx;
}
