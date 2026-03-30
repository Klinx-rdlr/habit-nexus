'use client';

import { Menu } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { NotificationBell } from '@/components/NotificationBell';

interface HeaderProps {
  onMenuClick: () => void;
}

function getGreeting(timezone?: string): string {
  let hour: number;
  try {
    if (timezone) {
      const formatter = new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        hour12: false,
        timeZone: timezone,
      });
      hour = parseInt(formatter.format(new Date()), 10);
    } else {
      hour = new Date().getHours();
    }
  } catch {
    hour = new Date().getHours();
  }
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user } = useAuth();

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
          {getGreeting(user?.timezone)}, {user?.username}
        </p>
      </div>

      <NotificationBell />
    </header>
  );
}
