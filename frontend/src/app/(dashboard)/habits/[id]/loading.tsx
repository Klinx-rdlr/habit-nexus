import { Skeleton } from '@/components/ui/Skeleton';

export default function HabitDetailLoading() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-fade-in">
      {/* Back */}
      <Skeleton className="h-4 w-16" />

      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-5 w-5" circle />
          <Skeleton className="h-8 w-52" />
        </div>
        <Skeleton className="mt-2 h-4 w-40" />
        <Skeleton className="mt-1.5 h-3 w-32" />
      </div>

      {/* Streak pair */}
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
      </div>

      {/* Heatmap */}
      <Skeleton className="h-[185px] w-full" />

      {/* Secondary stats */}
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
      </div>

      {/* Completions */}
      <Skeleton className="h-52" />
    </div>
  );
}
