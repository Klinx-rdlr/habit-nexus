import { Skeleton } from '@/components/ui/Skeleton';

export default function GroupsLoading() {
  return (
    <div className="mx-auto max-w-2xl space-y-3">
      <div className="mb-6 flex items-center justify-between">
        <Skeleton className="h-8 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-24 w-full" />
      ))}
    </div>
  );
}
