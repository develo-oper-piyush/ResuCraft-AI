"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

export const WobbleCard = ({
  children,
  containerClassName = "",
  className = "",
}: {
  children: React.ReactNode;
  containerClassName?: string;
  className?: string;
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (event: React.MouseEvent<HTMLElement>) => {
    const { clientX, clientY } = event;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (clientX - (rect.left + rect.width / 2)) / 25;
    const y = (clientY - (rect.top + rect.height / 2)) / 25;
    setMousePosition({ x, y });
  };

  return (
    <motion.section
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setMousePosition({ x: 0, y: 0 });
      }}
      style={{
        transform: isHovered
          ? `translate3d(${mousePosition.x}px, ${mousePosition.y}px, 0) scale3d(1.015, 1.015, 1)`
          : "translate3d(0px, 0px, 0) scale3d(1, 1, 1)",
        transition: "transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
      className={`relative rounded-3xl overflow-hidden p-8 backdrop-blur-2xl transition-all duration-300 ${containerClassName}`}
    >
      {/* Subtle ambient light glow instead of harsh boxy borders */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.07] via-transparent to-cyan-500/[0.05] pointer-events-none" />
      <div className="relative z-10 h-full">
        <div className={`h-full ${className}`}>{children}</div>
      </div>
    </motion.section>
  );
};

export function WobbleCardDemo() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto w-full px-4">
      <WobbleCard
        containerClassName="col-span-1 lg:col-span-2 h-full bg-slate-900/40 border border-cyan-500/20 hover:border-cyan-400/40 min-h-[380px] lg:min-h-[300px]"
      >
        <div className="max-w-md">
          <h2 className="text-left text-balance text-xl md:text-2xl lg:text-3xl font-bold tracking-tight text-white">
            Traditional Resumes Get Filtered Out in Seconds
          </h2>
          <p className="mt-4 text-left text-sm md:text-base text-slate-300 font-light leading-relaxed">
            Over 75% of job applications are rejected by ATS filters before a human ever reads them. Static bullet points fail to capture your true potential.
          </p>
        </div>
      </WobbleCard>

      <WobbleCard containerClassName="col-span-1 min-h-[300px] bg-slate-900/40 border border-indigo-500/20 hover:border-indigo-400/40">
        <h2 className="max-w-80 text-left text-balance text-xl md:text-2xl font-bold tracking-tight text-white">
          Precision AI Auditing & Metric Extraction
        </h2>
        <p className="mt-4 text-left text-sm text-slate-300 font-light leading-relaxed">
          Instant deep-scan analysis highlighting missing action verbs, ATS format traps, and role-specific target keywords.
        </p>
      </WobbleCard>

      <WobbleCard containerClassName="col-span-1 lg:col-span-3 bg-slate-900/40 border border-blue-500/20 hover:border-blue-400/40 min-h-[300px]">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 h-full">
          <div className="max-w-xl">
            <h2 className="text-left text-balance text-2xl md:text-3xl font-bold tracking-tight text-white">
              Conversational RAG Context Retains Every Detail of Your Career
            </h2>
            <p className="mt-4 text-left text-sm md:text-base text-slate-300 font-light leading-relaxed">
              Chat with your persistent AI assistant. As you detail new projects and experiences, the RAG memory pipeline embeds and updates your custom resume & web portfolio in real time.
            </p>
          </div>

          <div className="relative max-w-xs w-full rounded-2xl overflow-hidden border border-cyan-500/30 bg-slate-950/80 shadow-2xl shrink-0">
            <video
              src="/cesar_-_louvre_museum-ascii.webm"
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-44 sm:h-52 object-cover rounded-2xl opacity-90 hover:opacity-100 transition-opacity"
            />
          </div>
        </div>
      </WobbleCard>
    </div>
  );
}
