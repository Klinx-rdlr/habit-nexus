'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalendarCheck, ListTodo, Users, User, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { NotificationBell } from '@/components/NotificationBell';

const navItems = [
  { href: '/today',   label: 'Today',   icon: CalendarCheck },
  { href: '/habits',  label: 'Habits',  icon: ListTodo },
  { href: '/groups',  label: 'Groups',  icon: Users },
  { href: '/profile', label: 'Profile', icon: User },
];

interface SidebarProps {
  // Kept for backward-compat with MobileNav which still passes this
  onNavigate?: () => void;
  className?: string;
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <aside className="flex h-full flex-col border-r border-hm-surface bg-hm-bg-elevated">
      {/* Logo + notification bell */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-hm-surface px-5">
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
      </div>

      {/* Nav items */}
      <nav className="flex-1 space-y-0.5 p-3">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className="flex items-center gap-3 rounded-card px-3 py-2.5 text-sm font-medium transition-colors"
              style={{
                backgroundColor: isActive ? 'var(--hm-accent-subtle)' : 'transparent',
                color: isActive ? 'var(--hm-accent)' : 'var(--hm-text-secondary)',
              }}
            >
              <Icon
                className="h-5 w-5 shrink-0"
                strokeWidth={isActive ? 2.5 : 1.75}
              />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="shrink-0 border-t border-hm-surface p-3">
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-card px-3 py-2.5 text-sm font-medium transition-colors hover:bg-hm-bg-sunken"
          style={{ color: 'var(--hm-text-tertiary)' }}
        >
          <LogOut className="h-5 w-5 shrink-0" strokeWidth={1.75} />
          Log out
        </button>
      </div>
    </aside>
  );
}
