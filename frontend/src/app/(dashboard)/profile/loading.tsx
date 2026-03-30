import { Skeleton } from '@/components/ui/Skeleton';

export default function ProfileLoading() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Profile header */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-16 w-16" circle />
        <div className="space-y-2">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
      {/* Habits section */}
      <Skeleton className="h-6 w-24" />
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    </div>
  );
}
