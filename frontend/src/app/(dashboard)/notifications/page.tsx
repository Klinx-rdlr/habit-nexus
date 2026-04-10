'use client';

import { useEffect, useState, useCallback } from 'react';
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

function NotificationIcon({ type }: { type: string }) {
  switch (type) {
    case 'streak.broken':
      return <Flame className="h-5 w-5 text-hm-danger" />;
    case 'streak.milestone':
      return <Trophy className="h-5 w-5 text-hm-warning" />;
    case 'member.joined':
      return <UserPlus className="h-5 w-5 text-hm-accent" />;
    case 'habit.completed':
      return <CheckCircle2 className="h-5 w-5 text-hm-success" />;
    default:
      return <Bell className="h-5 w-5 text-hm-text-tertiary" />;
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

  useEffect(() => {
    document.title = 'Notifications | HabitMap';
  }, []);

  const { data: notificationsData, isLoading, isError, refetch } = useQuery({
    queryKey: ['notifications', 'all', page],
    queryFn: () => getNotifications({ page, limit: PAGE_SIZE }),
  });

  const notifications = notificationsData?.data;
  const totalPages = notificationsData?.totalPages ?? 1;
  const hasUnread = notifications?.some((n) => !n.isRead);

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

  if (isError) {
    return (
      <div className="mx-auto max-w-2xl py-16 text-center">
        <p className="mb-4 text-sm text-hm-text-secondary">
          Failed to load notifications.
        </p>
        <Button onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-2 animate-fade-in">
        <div className="mb-6 flex items-center justify-between">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-8 w-36" />
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-[72px] w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl animate-fade-in">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display text-2xl font-bold text-hm-text-primary">
          Notifications
        </h1>
        {hasUnread && (
          <Button
            variant="secondary"
            size="sm"
            onClick={handleMarkAllRead}
            isLoading={markingAll}
          >
            <Check className="h-3.5 w-3.5" />
            Mark all as read
          </Button>
        )}
      </div>

      {/* Empty state */}
      {!notifications?.length ? (
        <div className="flex flex-col items-center gap-3 py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-hm-bg-sunken">
            <Inbox className="h-7 w-7 text-hm-text-tertiary" />
          </div>
          <p className="font-display text-base font-semibold text-hm-text-primary">
            All caught up
          </p>
          <p className="text-sm text-hm-text-secondary">
            No notifications yet. Complete habits and join groups to get started.
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {notifications.map((n) => (
              <button
                key={n.id}
                onClick={() => handleClick(n)}
                className={`flex w-full items-start gap-4 rounded-card border p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-hm-md ${
                  !n.isRead
                    ? 'border-hm-accent-subtle bg-hm-accent-subtle'
                    : 'border-hm-surface bg-hm-bg-elevated'
                }`}
              >
                {/* Icon */}
                <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-hm-bg-sunken">
                  <NotificationIcon type={n.type} />
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-sm leading-snug ${
                      !n.isRead
                        ? 'font-semibold text-hm-text-primary'
                        : 'text-hm-text-secondary'
                    }`}
                  >
                    {n.message}
                  </p>
                  <p className="mt-1 text-xs text-hm-text-tertiary">
                    {timeAgo(n.createdAt)}
                  </p>
                </div>

                {/* Unread dot */}
                {!n.isRead && (
                  <div className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-hm-accent" />
                )}
              </button>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-3">
              <Button
                variant="secondary"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <span className="text-xs text-hm-text-tertiary tabular-nums">
                {page} / {totalPages}
              </span>
              <Button
                variant="secondary"
                size="sm"
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
