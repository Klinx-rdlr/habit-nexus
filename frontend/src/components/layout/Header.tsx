'use client';

import { usePathname } from 'next/navigation';
import { NotificationBell } from '@/components/NotificationBell';

const EXACT_TITLES: Record<string, string> = {
  '/today':          'Today',
  '/habits':         'My Habits',
  '/habits/new':     'New Habit',
  '/groups':         'Groups',
  '/groups/new':     'New Group',
  '/groups/join':    'Join Group',
  '/profile':        'Profile',
  '/notifications':  'Notifications',
  '/settings':       'Settings',
};

function getTitle(pathname: string): string {
  if (EXACT_TITLES[pathname]) return EXACT_TITLES[pathname];
  if (pathname.startsWith('/habits/') && pathname.endsWith('/edit')) return 'Edit Habit';
  if (pathname.startsWith('/habits/')) return 'Habit';
  if (pathname.includes('/leaderboard')) return 'Leaderboard';
  if (pathname.startsWith('/groups/')) return 'Group';
  return 'HabitMap';
}

// Mobile-only top bar — hidden on lg+ (sidebar handles branding + nav there).
export function Header() {
  const pathname = usePathname();
  const title = getTitle(pathname);

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-hm-surface bg-hm-bg-elevated px-4 lg:hidden">
      <div className="flex items-center gap-2.5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-hm-accent text-xs font-bold text-white">
          H
        </div>
        <span className="font-display text-base font-semibold text-hm-text-primary">
          {title}
        </span>
      </div>
      <NotificationBell />
    </header>
  );
}
