"use client";

import React, { useState } from "react";
import { Loader2, Check, ArrowRight } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => Promise<any> | void;
  variant?: "primary" | "secondary" | "outline" | "ghost";
}

export function Button({
  children,
  onClick,
  variant = "primary",
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!onClick || loading) return;
    try {
      setLoading(true);
      const res = onClick(e);
      if (res instanceof Promise) {
        await res;
      }
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case "secondary":
        return "bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700";
      case "outline":
        return "bg-transparent border border-cyan-500/30 text-cyan-300 hover:bg-cyan-950/40";
      case "ghost":
        return "bg-transparent text-slate-300 hover:bg-slate-800/60";
      default:
        return "bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/20";
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled || loading}
      className={`relative inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none ${getVariantStyles()} ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin text-current" />
          <span>Processing...</span>
        </>
      ) : success ? (
        <>
          <Check className="h-4 w-4 text-emerald-400" />
          <span>Done!</span>
        </>
      ) : (
        <>
          <span>{children}</span>
          <ArrowRight className="h-4 w-4 opacity-70 transition-transform group-hover:translate-x-1" />
        </>
      )}
    </button>
  );
}

export function StatefulButtonDemo() {
  const handleClick = () => {
    return new Promise((resolve) => {
      setTimeout(resolve, 4000);
    });
  };
  return (
    <div className="flex h-40 w-full items-center justify-center">
      <Button onClick={handleClick}>Send message</Button>
    </div>
  );
}
