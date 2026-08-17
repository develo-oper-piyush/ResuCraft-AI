import { SkeletonDefault, SkeletonImage } from '@/components/ui/skeleton';

export default function AnalyzeLoading() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 flex flex-col items-center justify-center space-y-8">
      <div className="w-full max-w-3xl p-8 rounded-3xl bg-slate-900/60 border border-slate-800 glass-panel">
        <SkeletonImage className="mb-6" />
        <SkeletonDefault className="max-w-full" />
      </div>
    </div>
  );
}
