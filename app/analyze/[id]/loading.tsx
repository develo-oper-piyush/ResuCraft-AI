import { SkeletonAnalysisReport } from '@/components/ui/skeleton';

export default function AnalyzeDetailLoading() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4">
      <SkeletonAnalysisReport />
    </div>
  );
}
