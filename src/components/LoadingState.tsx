import { Loader2 } from 'lucide-react';

export function DeputadoCardSkeleton() {
  return (
    <div className="bg-slate-card border border-white/5 rounded-2xl overflow-hidden animate-pulse">
      <div className="h-48 bg-white/5" />
      <div className="p-5 space-y-3">
        <div className="h-5 w-3/4 bg-white/5 rounded" />
        <div className="h-4 w-1/2 bg-white/5 rounded" />
        <div className="flex gap-2">
          <div className="h-6 w-16 bg-white/5 rounded-full" />
          <div className="h-6 w-12 bg-white/5 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function DeputadoGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <DeputadoCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function StatSkeleton() {
  return (
    <div className="bg-slate-card border border-white/5 rounded-2xl p-6 animate-pulse">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 bg-white/5 rounded-xl" />
        <div className="h-4 w-32 bg-white/5 rounded" />
      </div>
      <div className="h-8 w-24 bg-white/5 rounded" />
    </div>
  );
}

export function TableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="bg-slate-card border border-white/5 rounded-2xl overflow-hidden">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 border-b border-white/5 animate-pulse">
          <div className="h-10 w-10 bg-white/5 rounded-xl shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-48 bg-white/5 rounded" />
            <div className="h-3 w-32 bg-white/5 rounded" />
          </div>
          <div className="h-5 w-24 bg-white/5 rounded" />
        </div>
      ))}
    </div>
  );
}

export function SpinnerFullPage() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <Loader2 className="w-12 h-12 text-gold animate-spin" />
    </div>
  );
}
