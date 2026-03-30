import { Skeleton } from '@/components/ui/Skeleton';

export default function NotificationsLoading() {
  return (
    <div className="mx-auto max-w-2xl space-y-3">
      <Skeleton className="mb-6 h-8 w-40" />
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  );
}
