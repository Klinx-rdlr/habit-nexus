'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
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
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  type NotificationResponse,
} from '@/lib/api/notifications';

function getNotificationIcon(type: string) {
  switch (type) {
    case 'streak.broken':
      return <Flame className="h-4 w-4 text-red-500" />;
    case 'streak.milestone':
      return <Trophy className="h-4 w-4 text-amber-500" />;
    case 'member.joined':
      return <UserPlus className="h-4 w-4 text-blue-500" />;
    case 'habit.completed':
      return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
    default:
      return <Bell className="h-4 w-4 text-surface-400" />;
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
  });
}

export function NotificationBell() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: countData } = useQuery({
    queryKey: ['notifications', 'count'],
    queryFn: getUnreadCount,
    refetchInterval: 30_000,
  });

  const { data: notificationsData, isLoading } = useQuery({
    queryKey: ['notifications', 'recent'],
    queryFn: () => getNotifications({ limit: 10 }),
    enabled: open,
  });

  const notifications = notificationsData?.data;

  const unread = countData?.unreadCount ?? 0;

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClick);
      return () => document.removeEventListener('mousedown', handleClick);
    }
  }, [open]);

  const handleMarkAllRead = useCallback(async () => {
    try {
      await markAllAsRead();
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    } catch {
      // silently fail
    }
  }, [queryClient]);

  const handleNotificationClick = useCallback(
    async (notification: NotificationResponse) => {
      if (!notification.isRead) {
        try {
          await markAsRead(notification.id);
          queryClient.invalidateQueries({ queryKey: ['notifications'] });
        } catch {
          // silently fail
        }
      }
      setOpen(false);
      const link = getNotificationLink(notification);
      if (link) router.push(link);
    },
    [queryClient, router],
  );

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative rounded-lg p-2 text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-red-500 px-1 text-2xs font-bold text-white">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-xl border border-surface-200 bg-surface-0 shadow-lg dark:border-surface-700 dark:bg-surface-900 sm:w-96">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-surface-200 px-4 py-3 dark:border-surface-700">
            <p className="text-sm font-medium text-surface-900 dark:text-surface-100">
              Notifications
            </p>
            {unread > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
              >
                <Check className="h-3 w-3" />
                Mark all as read
              </button>
            )}
          </div>

          {/* Body */}
          <div className="max-h-80 overflow-y-auto">
            {isLoading ? (
              <div className="space-y-2 p-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="h-8 w-8 animate-pulse rounded-full bg-surface-200 dark:bg-surface-700" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 w-3/4 animate-pulse rounded bg-surface-200 dark:bg-surface-700" />
                      <div className="h-2 w-1/3 animate-pulse rounded bg-surface-200 dark:bg-surface-700" />
                    </div>
                  </div>
                ))}
              </div>
            ) : !notifications?.length ? (
              <div className="flex flex-col items-center gap-2 py-10">
                <Inbox className="h-8 w-8 text-surface-300 dark:text-surface-600" />
                <p className="text-sm text-surface-400">
                  You&apos;re all caught up!
                </p>
              </div>
            ) : (
              <div>
                {notifications.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => handleNotificationClick(n)}
                    className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-50 dark:hover:bg-surface-800 ${
                      !n.isRead ? 'bg-brand-50/50 dark:bg-brand-950/30' : ''
                    }`}
                  >
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-100 dark:bg-surface-800">
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
                      <p className="mt-0.5 text-xs text-surface-400">
                        {timeAgo(n.createdAt)}
                      </p>
                    </div>
                    {!n.isRead && (
                      <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-brand-500" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-surface-200 px-4 py-2.5 dark:border-surface-700">
            <button
              onClick={() => {
                setOpen(false);
                router.push('/notifications');
              }}
              className="w-full text-center text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
            >
              View all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
