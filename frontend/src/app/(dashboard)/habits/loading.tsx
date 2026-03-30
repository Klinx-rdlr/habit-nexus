import { Skeleton } from '@/components/ui/Skeleton';

export default function HabitsLoading() {
  return (
    <div className="mx-auto max-w-2xl space-y-3">
      <div className="mb-6 flex items-center justify-between">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-10 w-28" />
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  );
}
