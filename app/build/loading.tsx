import { SkeletonCard, SkeletonList } from '@/components/ui/skeleton';

export default function BuildLoading() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 max-w-7xl mx-auto space-y-8">
      <div className="h-8 bg-slate-800 rounded-xl w-64 animate-pulse"></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SkeletonCard className="max-w-full" />
        <SkeletonCard className="max-w-full" />
        <SkeletonCard className="max-w-full" />
      </div>
      <SkeletonList count={5} className="max-w-full" />
    </div>
  );
}
