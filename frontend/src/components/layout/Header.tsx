'use client';

import { NotificationBell } from '@/components/NotificationBell';

// Mobile-only top bar. Hidden on lg+ (sidebar handles navigation there).
export function Header() {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-hm-surface bg-hm-bg-elevated px-4 lg:hidden">
      <div className="flex items-center gap-2.5">
        <div
          className="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold text-white"
          style={{ backgroundColor: 'var(--hm-accent)' }}
        >
          H
        </div>
        <span className="font-display text-base font-semibold text-hm-text-primary">
          HabitMap
        </span>
      </div>
      <NotificationBell />
    </header>
  );
}
