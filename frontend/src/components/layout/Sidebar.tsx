'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  CalendarCheck,
  ListTodo,
  Users,
  User,
  Settings,
  Bell,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const navItems = [
  { href: '/today', label: 'Today', icon: CalendarCheck },
  { href: '/habits', label: 'My Habits', icon: ListTodo },
  { href: '/groups', label: 'Groups', icon: Users },
  { href: '/notifications', label: 'Notifications', icon: Bell },
  { href: '/profile', label: 'Profile', icon: User },
  { href: '/settings', label: 'Settings', icon: Settings },
];

interface SidebarProps {
  className?: string;
  onNavigate?: () => void;
}

export function Sidebar({ className = '', onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <aside
      className={`flex h-full flex-col border-r border-surface-200 bg-surface-0 dark:border-surface-800 dark:bg-surface-900 ${className}`}
    >
      <div className="flex h-16 items-center gap-2 border-b border-surface-200 px-6 dark:border-surface-800">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-600">
          <span className="text-xs font-bold text-white">H</span>
        </div>
        <span className="text-lg font-bold text-surface-900 dark:text-surface-100">
          HabitMap
        </span>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + '/');

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`
                flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors
                ${
                  isActive
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300'
                    : 'text-surface-600 hover:bg-surface-100 hover:text-surface-900 dark:text-surface-400 dark:hover:bg-surface-800 dark:hover:text-surface-100'
                }
              `}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-surface-200 p-3 dark:border-surface-800">
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-surface-600 transition-colors hover:bg-surface-100 hover:text-surface-900 dark:text-surface-400 dark:hover:bg-surface-800 dark:hover:text-surface-100"
        >
          <LogOut className="h-5 w-5" />
          Log out
        </button>
      </div>
    </aside>
  );
}
