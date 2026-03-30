'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Bell,
  Flame,
  Trophy,
  UserPlus,
  CheckCircle2,
  Check,
  Inbox,
} from 'lucide-react';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  type NotificationResponse,
} from '@/lib/api/notifications';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';

function getNotificationIcon(type: string) {
  switch (type) {
    case 'streak.broken':
      return <Flame className="h-5 w-5 text-red-500" />;
    case 'streak.milestone':
      return <Trophy className="h-5 w-5 text-amber-500" />;
    case 'member.joined':
      return <UserPlus className="h-5 w-5 text-blue-500" />;
    case 'habit.completed':
      return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
    default:
      return <Bell className="h-5 w-5 text-surface-400" />;
  }
}

function getNotificationLink(notification: NotificationResponse): string | null {
  const meta = notification.metadata;
  if (!meta) return null;

  switch (notification.type) {
    case 'streak.broken':
    case 'streak.milestone':
    case 'habit.completed':
      return meta.habitId ? `/habits/${meta.habitId}` : null;
    case 'member.joined':
      return meta.groupId ? `/groups/${meta.groupId}` : null;
    default:
      return null;
  }
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

const PAGE_SIZE = 20;

export default function NotificationsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [markingAll, setMarkingAll] = useState(false);

  const { data: notificationsData, isLoading, isError, refetch } = useQuery({
    queryKey: ['notifications', 'all', page],
    queryFn: () => getNotifications({ page, limit: PAGE_SIZE }),
  });

  const notifications = notificationsData?.data;
  const totalPages = notificationsData?.totalPages ?? 1;

  const handleMarkAllRead = useCallback(async () => {
    setMarkingAll(true);
    try {
      await markAllAsRead();
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    } catch {
      // silently fail
    } finally {
      setMarkingAll(false);
    }
  }, [queryClient]);

  const handleClick = useCallback(
    async (notification: NotificationResponse) => {
      if (!notification.isRead) {
        try {
          await markAsRead(notification.id);
          queryClient.invalidateQueries({ queryKey: ['notifications'] });
        } catch {
          // silently fail
        }
      }
      const link = getNotificationLink(notification);
      if (link) router.push(link);
    },
    [queryClient, router],
  );

  const hasUnread = notifications?.some((n) => !n.isRead);

  if (isError) {
    return (
      <div className="mx-auto max-w-2xl py-16 text-center">
        <p className="mb-4 text-surface-500">Failed to load notifications.</p>
        <Button onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-3">
        <div className="mb-6 flex items-center justify-between">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-10 w-36" />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
          Notifications
        </h1>
        {hasUnread && (
          <Button
            variant="secondary"
            onClick={handleMarkAllRead}
            isLoading={markingAll}
          >
            <Check className="h-4 w-4" />
            Mark all as read
          </Button>
        )}
      </div>

      {!notifications?.length ? (
        <div className="flex flex-col items-center gap-3 py-16">
          <Inbox className="h-12 w-12 text-surface-300 dark:text-surface-600" />
          <p className="text-sm text-surface-500">
            You&apos;re all caught up! No notifications yet.
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {notifications.map((n) => (
              <button
                key={n.id}
                onClick={() => handleClick(n)}
                className={`flex w-full items-start gap-4 rounded-xl border p-4 text-left transition-colors hover:bg-surface-50 dark:hover:bg-surface-800 ${
                  !n.isRead
                    ? 'border-brand-200 bg-brand-50/50 dark:border-brand-900 dark:bg-brand-950/30'
                    : 'border-surface-200 bg-surface-0 dark:border-surface-800 dark:bg-surface-900'
                }`}
              >
                <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-100 dark:bg-surface-800">
                  {getNotificationIcon(n.type)}
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-sm ${
                      !n.isRead
                        ? 'font-semibold text-surface-900 dark:text-surface-100'
                        : 'text-surface-700 dark:text-surface-300'
                    }`}
                  >
                    {n.message}
                  </p>
                  <p className="mt-1 text-xs text-surface-400">
                    {timeAgo(n.createdAt)}
                  </p>
                </div>
                {!n.isRead && (
                  <div className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-brand-500" />
                )}
              </button>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center gap-2">
              <Button
                variant="secondary"
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
