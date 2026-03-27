import { Skeleton } from '@/components/ui/Skeleton';

export default function HabitDetailLoading() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Skeleton className="h-5 w-16" />
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <Skeleton className="h-4 w-4" circle />
          <Skeleton className="h-8 w-56" />
        </div>
        <Skeleton className="h-4 w-40" />
      </div>
      <div className="flex gap-4">
        <Skeleton className="h-24 flex-1" />
        <Skeleton className="h-24 flex-1" />
      </div>
      <Skeleton className="h-[160px] w-full" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    </div>
  );
}
