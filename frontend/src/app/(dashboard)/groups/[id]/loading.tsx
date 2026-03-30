import { Skeleton } from '@/components/ui/Skeleton';

export default function GroupDashboardLoading() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-8 w-8" />
        <Skeleton className="h-8 w-48" />
      </div>
      {/* Invite section */}
      <Skeleton className="h-16 w-full" />
      {/* Members */}
      <div className="space-y-3">
        <Skeleton className="h-6 w-24" />
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    </div>
  );
}
