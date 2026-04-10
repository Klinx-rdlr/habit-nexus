'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalendarCheck, ListTodo, Users, User, LogOut, Settings } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { NotificationBell } from '@/components/NotificationBell';

const navItems = [
  { href: '/today',    label: 'Today',    icon: CalendarCheck },
  { href: '/habits',   label: 'Habits',   icon: ListTodo },
  { href: '/groups',   label: 'Groups',   icon: Users },
  { href: '/profile',  label: 'Profile',  icon: User },
  { href: '/settings', label: 'Settings', icon: Settings },
];

interface SidebarProps {
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="flex h-full flex-col border-r border-hm-surface bg-hm-bg-elevated">
      {/* Wordmark row + notification bell */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-hm-surface px-5">
        <div className="flex items-center gap-2.5">
          {/* Logo mark */}
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-hm-accent text-xs font-bold text-white">
            H
          </div>
          <span className="font-display text-base font-semibold text-hm-text-primary">
            HabitMap
          </span>
        </div>
        <NotificationBell />
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 p-3">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-card px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-hm-accent-subtle text-hm-accent'
                  : 'text-hm-text-secondary hover:bg-hm-bg-sunken hover:text-hm-text-primary'
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" strokeWidth={isActive ? 2.5 : 1.75} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User info + logout */}
      <div className="shrink-0 space-y-0.5 border-t border-hm-surface p-3">
        {user && (
          <div className="flex items-center gap-3 rounded-card px-3 py-2">
            {/* Avatar initial */}
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-hm-accent-subtle text-xs font-semibold text-hm-accent">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <span className="truncate text-sm font-medium text-hm-text-secondary">
              {user.username}
            </span>
          </div>
        )}
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-card px-3 py-2.5 text-sm font-medium text-hm-text-tertiary transition-colors hover:bg-hm-bg-sunken hover:text-hm-text-secondary"
        >
          <LogOut className="h-5 w-5 shrink-0" strokeWidth={1.75} />
          Log out
        </button>
      </div>
    </aside>
  );
}
