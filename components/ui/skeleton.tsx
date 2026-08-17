import React from 'react';

/**
 * Flowbite-styled Tailwind CSS Skeleton Components
 * Accessible with role="status", animate-pulse, and sr-only screen reader labels.
 */

// 1. Default Skeleton (Text content placeholder)
export function SkeletonDefault({ className = "max-w-sm" }: { className?: string }) {
  return (
    <div role="status" className={`animate-pulse ${className}`}>
      <div className="h-3 bg-slate-700/70 rounded-full w-48 mb-4"></div>
      <div className="h-2.5 bg-slate-800/80 rounded-full max-w-[360px] mb-3"></div>
      <div className="h-2.5 bg-slate-800/80 rounded-full mb-3"></div>
      <div className="h-2.5 bg-slate-800/80 rounded-full max-w-[330px] mb-3"></div>
      <div className="h-2.5 bg-slate-800/80 rounded-full max-w-[300px] mb-3"></div>
      <div className="h-2.5 bg-slate-800/80 rounded-full max-w-[360px]"></div>
      <span className="sr-only">Loading...</span>
    </div>
  );
}

// 2. Image Skeleton (Thumbnail & media placeholder)
export function SkeletonImage({ className = "" }: { className?: string }) {
  return (
    <div role="status" className={`space-y-8 animate-pulse md:space-y-0 md:space-x-8 md:flex md:items-center ${className}`}>
      <div className="flex items-center justify-center w-full h-48 bg-slate-800/70 rounded-2xl sm:w-96 border border-slate-700/40">
        <svg className="w-12 h-12 text-slate-600" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m3 16 5-7 6 6.5m6.5 2.5L16 13l-4.286 6M14 10h.01M4 19h16a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1Z"/>
        </svg>
      </div>
      <div className="w-full">
        <div className="h-3 bg-slate-700/80 rounded-full w-48 mb-4"></div>
        <div className="h-2.5 bg-slate-800/80 rounded-full max-w-[480px] mb-3"></div>
        <div className="h-2.5 bg-slate-800/80 rounded-full mb-3"></div>
        <div className="h-2.5 bg-slate-800/80 rounded-full max-w-[440px] mb-3"></div>
        <div className="h-2.5 bg-slate-800/80 rounded-full max-w-[460px] mb-3"></div>
        <div className="h-2.5 bg-slate-800/80 rounded-full max-w-[360px]"></div>
      </div>
      <span className="sr-only">Loading...</span>
    </div>
  );
}

// 3. Video Skeleton
export function SkeletonVideo({ className = "max-w-sm h-56" }: { className?: string }) {
  return (
    <div role="status" className={`flex items-center justify-center bg-slate-800/70 rounded-2xl border border-slate-700/40 animate-pulse ${className}`}>
      <svg className="w-12 h-12 text-slate-600" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <path stroke="currentColor" strokeLinejoin="round" strokeWidth="2" d="M10 3v4a1 1 0 0 1-1 1H5m14-4v16a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7.914a1 1 0 0 1 .293-.707l3.914-3.914A1 1 0 0 1 9.914 3H18a1 1 0 0 1 1 1ZM9 12h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1Zm5.697 2.395v-.733l1.269-1.219v2.984l-1.268-1.032Z"/>
      </svg>
      <span className="sr-only">Loading...</span>
    </div>
  );
}

// 4. Text Block Skeleton (Multilines & headings)
export function SkeletonText({ className = "max-w-lg" }: { className?: string }) {
  return (
    <div role="status" className={`space-y-3 animate-pulse ${className}`}>
      <div className="flex items-center w-full">
        <div className="h-3 bg-slate-700/80 rounded-full w-32"></div>
        <div className="h-3 ms-2 bg-slate-800/80 rounded-full w-24"></div>
        <div className="h-3 ms-2 bg-slate-800/80 rounded-full w-full"></div>
      </div>
      <div className="flex items-center w-full max-w-[480px]">
        <div className="h-3 bg-slate-800/80 rounded-full w-full"></div>
        <div className="h-3 ms-2 bg-slate-800/80 rounded-full w-full"></div>
        <div className="h-3 ms-2 bg-slate-800/80 rounded-full w-24"></div>
      </div>
      <div className="flex items-center w-full max-w-[400px]">
        <div className="h-3 bg-slate-800/80 rounded-full w-full"></div>
        <div className="h-3 ms-2 bg-slate-700/80 rounded-full w-80"></div>
        <div className="h-3 ms-2 bg-slate-800/80 rounded-full w-full"></div>
      </div>
      <div className="flex items-center w-full max-w-[480px]">
        <div className="h-3 ms-2 bg-slate-800/80 rounded-full w-full"></div>
        <div className="h-3 ms-2 bg-slate-800/80 rounded-full w-full"></div>
        <div className="h-3 ms-2 bg-slate-800/80 rounded-full w-24"></div>
      </div>
      <div className="flex items-center w-full max-w-[440px]">
        <div className="h-3 ms-2 bg-slate-700/80 rounded-full w-32"></div>
        <div className="h-3 ms-2 bg-slate-800/80 rounded-full w-24"></div>
        <div className="h-3 ms-2 bg-slate-800/80 rounded-full w-full"></div>
      </div>
      <span className="sr-only">Loading...</span>
    </div>
  );
}

// 5. Card Skeleton
export function SkeletonCard({ className = "max-w-sm" }: { className?: string }) {
  return (
    <div role="status" className={`p-5 border border-slate-800/80 rounded-2xl glass-card shadow-lg animate-pulse ${className}`}>
      <div className="flex items-center justify-center h-44 w-full bg-slate-800/60 rounded-xl mb-5 border border-slate-700/30">
        <svg className="w-10 h-10 text-slate-600" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <path stroke="currentColor" strokeLinejoin="round" strokeWidth="2" d="M10 3v4a1 1 0 0 1-1 1H5m14-4v16a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7.914a1 1 0 0 1 .293-.707l3.914-3.914A1 1 0 0 1 9.914 3H18a1 1 0 0 1 1 1ZM9 12h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1Zm5.697 2.395v-.733l1.269-1.219v2.984l-1.268-1.032Z"/>
        </svg>
      </div>
      <div className="h-3 bg-cyan-500/20 rounded-full w-44 mb-4"></div>
      <div className="h-2.5 bg-slate-800/80 rounded-full mb-3"></div>
      <div className="h-2.5 bg-slate-800/80 rounded-full mb-3"></div>
      <div className="h-2.5 bg-slate-800/80 rounded-full w-4/5"></div>
      <div className="flex items-center mt-5 pt-3 border-t border-slate-800/60">
        <div className="w-9 h-9 rounded-full bg-slate-800/80 me-3 border border-slate-700/40"></div>
        <div>
          <div className="h-2.5 bg-slate-700/80 rounded-full w-28 mb-2"></div>
          <div className="w-36 h-2 bg-slate-800/80 rounded-full"></div>
        </div>
      </div>
      <span className="sr-only">Loading...</span>
    </div>
  );
}

// 6. Widget / Metric Chart Skeleton
export function SkeletonWidget({ className = "max-w-md" }: { className?: string }) {
  return (
    <div role="status" className={`p-6 border border-slate-800/80 rounded-2xl glass-panel shadow-xl animate-pulse ${className}`}>
      <div className="h-3 bg-slate-700/80 rounded-full w-36 mb-3"></div>
      <div className="w-48 h-2 mb-8 bg-slate-800/80 rounded-full"></div>
      <div className="flex items-baseline mt-6 space-x-4">
        <div className="w-full bg-slate-800/80 rounded-t-lg h-56"></div>
        <div className="w-full h-44 bg-cyan-500/20 rounded-t-lg"></div>
        <div className="w-full bg-slate-800/80 rounded-t-lg h-56"></div>
        <div className="w-full h-48 bg-slate-800/80 rounded-t-lg"></div>
        <div className="w-full bg-cyan-500/30 rounded-t-lg h-64"></div>
        <div className="w-full bg-slate-800/80 rounded-t-lg h-56"></div>
      </div>
      <span className="sr-only">Loading...</span>
    </div>
  );
}

// 7. List Items Skeleton
export function SkeletonList({ count = 4, className = "max-w-md" }: { count?: number; className?: string }) {
  return (
    <div role="status" className={`p-5 border border-slate-800/80 divide-y divide-slate-800/80 rounded-2xl glass-card animate-pulse ${className}`}>
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className={`flex items-center justify-between ${idx === 0 ? 'pb-4' : 'py-4'}`}>
          <div>
            <div className="h-3 bg-slate-700/80 rounded-full w-32 mb-2.5"></div>
            <div className="w-44 h-2.5 bg-slate-800/80 rounded-full"></div>
          </div>
          <div className="h-7 bg-slate-800/80 rounded-lg w-16 border border-slate-700/30"></div>
        </div>
      ))}
      <span className="sr-only">Loading...</span>
    </div>
  );
}

// 8. Testimonial / Quote Skeleton
export function SkeletonTestimonial({ className = "max-w-lg" }: { className?: string }) {
  return (
    <div role="status" className={`animate-pulse p-6 rounded-2xl border border-slate-800/80 glass-card text-center ${className}`}>
      <div className="h-3 bg-slate-700/80 rounded-full max-w-[540px] mb-3 mx-auto"></div>
      <div className="h-3 mx-auto bg-slate-800/80 rounded-full max-w-[420px]"></div>
      <div className="flex items-center justify-center mt-6">
        <div className="w-9 h-9 rounded-full bg-slate-800/90 me-3 border border-slate-700/50"></div>
        <div className="w-24 h-3 bg-slate-700/80 rounded-full me-3"></div>
        <div className="w-20 h-2.5 bg-slate-800/80 rounded-full"></div>
      </div>
      <span className="sr-only">Loading...</span>
    </div>
  );
}

// 9. Dashboard Page Full Skeleton
export function SkeletonDashboard() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 space-y-8 animate-pulse">
      {/* Top Header Skeleton */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="h-8 bg-slate-800 rounded-xl w-64 mb-3"></div>
          <div className="h-4 bg-slate-800/60 rounded-lg w-80"></div>
        </div>
        <div className="flex space-x-3">
          <div className="h-10 bg-cyan-600/30 rounded-xl w-36 border border-cyan-500/20"></div>
          <div className="h-10 bg-slate-800 rounded-xl w-32 border border-slate-700/40"></div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="h-3 bg-slate-800 rounded-full w-24 mb-3"></div>
            <div className="h-7 bg-slate-700 rounded-lg w-32 mb-2"></div>
            <div className="h-2.5 bg-slate-800/80 rounded-full w-40"></div>
          </div>
        ))}
      </div>

      {/* Content Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <SkeletonWidget className="max-w-full" />
          <SkeletonList count={4} className="max-w-full" />
        </div>
        <div className="space-y-6">
          <SkeletonCard className="max-w-full" />
          <SkeletonTestimonial className="max-w-full" />
        </div>
      </div>
      <span className="sr-only">Loading dashboard...</span>
    </div>
  );
}

// 10. Analysis Report Skeleton
export function SkeletonAnalysisReport() {
  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8 animate-pulse">
      {/* Header Banner */}
      <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 glass-panel">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-3 flex-1">
            <div className="h-4 bg-cyan-500/30 rounded-full w-32"></div>
            <div className="h-8 bg-slate-700 rounded-xl w-3/4"></div>
            <div className="h-3.5 bg-slate-800 rounded-full w-full max-w-xl"></div>
          </div>
          <div className="w-28 h-28 rounded-full bg-slate-800 border-4 border-slate-700/60 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-slate-700/80"></div>
          </div>
        </div>
      </div>

      {/* Findings Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((idx) => (
          <div key={idx} className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex justify-between items-center">
              <div className="h-4 bg-slate-700 rounded-full w-36"></div>
              <div className="h-6 bg-amber-500/20 rounded-full w-20 border border-amber-500/30"></div>
            </div>
            <div className="h-3 bg-slate-800 rounded-full w-4/5"></div>
            <div className="h-3 bg-slate-800 rounded-full w-full"></div>
            <div className="h-3 bg-slate-800 rounded-full w-2/3"></div>
          </div>
        ))}
      </div>
      <span className="sr-only">Loading analysis report...</span>
    </div>
  );
}

// 11. Resume Builder Skeleton
export function SkeletonResumeBuilder() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row animate-pulse">
      {/* Sidebar Controls */}
      <div className="w-full md:w-96 border-r border-slate-800 p-6 space-y-6 bg-slate-900/40">
        <div className="h-6 bg-slate-800 rounded-lg w-48 mb-6"></div>
        <SkeletonText className="w-full" />
        <div className="space-y-4 pt-6 border-t border-slate-800">
          <div className="h-10 bg-slate-800 rounded-xl w-full"></div>
          <div className="h-10 bg-cyan-600/30 rounded-xl w-full border border-cyan-500/20"></div>
        </div>
      </div>

      {/* Main Resume Canvas */}
      <div className="flex-1 p-8 bg-slate-900/20 flex justify-center items-center">
        <div className="w-full max-w-3xl h-[850px] bg-slate-900/90 rounded-2xl border border-slate-800 p-10 space-y-8 shadow-2xl">
          <div className="space-y-3 pb-6 border-b border-slate-800 text-center">
            <div className="h-8 bg-slate-700 rounded-xl w-64 mx-auto"></div>
            <div className="h-4 bg-slate-800 rounded-full w-96 mx-auto"></div>
          </div>
          <div className="space-y-4">
            <div className="h-5 bg-slate-800 rounded-lg w-40"></div>
            <div className="h-3 bg-slate-800/80 rounded-full w-full"></div>
            <div className="h-3 bg-slate-800/80 rounded-full w-5/6"></div>
          </div>
          <div className="space-y-4 pt-4">
            <div className="h-5 bg-slate-800 rounded-lg w-48"></div>
            <div className="h-3 bg-slate-800/80 rounded-full w-full"></div>
            <div className="h-3 bg-slate-800/80 rounded-full w-4/5"></div>
            <div className="h-3 bg-slate-800/80 rounded-full w-3/4"></div>
          </div>
        </div>
      </div>
      <span className="sr-only">Loading resume builder...</span>
    </div>
  );
}
