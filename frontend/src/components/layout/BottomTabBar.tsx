'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalendarCheck, ListTodo, Users, User } from 'lucide-react';

const tabs = [
  { href: '/today',   label: 'Today',   icon: CalendarCheck },
  { href: '/habits',  label: 'Habits',  icon: ListTodo },
  { href: '/groups',  label: 'Groups',  icon: Users },
  { href: '/profile', label: 'Profile', icon: User },
];

export function BottomTabBar() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 lg:hidden">
      {/* Tab row — fixed height, independent of safe area */}
      <nav className="flex h-14 items-stretch border-t border-hm-surface bg-hm-bg-elevated">
        {tabs.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-1 flex-col items-center justify-center gap-1 py-1 transition-opacity active:opacity-70"
            >
              {/* Icon wrapped in pill when active */}
              <div
                className={`flex items-center justify-center rounded-full px-4 py-1 transition-colors ${
                  isActive ? 'bg-hm-accent-subtle' : ''
                }`}
              >
                <Icon
                  className={`h-5 w-5 transition-colors ${
                    isActive ? 'text-hm-accent' : 'text-hm-text-tertiary'
                  }`}
                  strokeWidth={isActive ? 2.5 : 1.75}
                />
              </div>
              <span
                className={`text-[10px] leading-none transition-colors ${
                  isActive
                    ? 'font-semibold text-hm-accent'
                    : 'font-normal text-hm-text-tertiary'
                }`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Safe area fill for notched phones — extends background behind home indicator */}
      <div
        className="bg-hm-bg-elevated"
        style={{ height: 'env(safe-area-inset-bottom)' }}
      />
    </div>
  );
}
