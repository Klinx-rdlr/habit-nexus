'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Menu } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getUnreadCount } from '@/lib/api/notifications';

interface HeaderProps {
  onMenuClick: () => void;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!user) return;
    getUnreadCount()
      .then((data) => setUnread(data.unreadCount))
      .catch(() => {});

    const interval = setInterval(() => {
      getUnreadCount()
        .then((data) => setUnread(data.unreadCount))
        .catch(() => {});
    }, 30_000);

    return () => clearInterval(interval);
  }, [user]);

  return (
    <header className="flex h-16 items-center gap-4 border-b border-surface-200 bg-surface-0 px-4 dark:border-surface-800 dark:bg-surface-900 lg:px-6">
      <button
        onClick={onMenuClick}
        className="rounded-lg p-2 text-surface-500 hover:bg-surface-100 lg:hidden dark:hover:bg-surface-800"
        aria-label="Toggle menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex-1">
        <p className="text-sm font-medium text-surface-900 dark:text-surface-100">
          {getGreeting()}, {user?.username}
        </p>
      </div>

      <button
        onClick={() => router.push('/notifications')}
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
    </header>
  );
}
