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
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 flex h-14 border-t bg-hm-bg-elevated border-hm-surface lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {tabs.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href || pathname.startsWith(href + '/');
        return (
          <Link
            key={href}
            href={href}
            className="flex flex-1 flex-col items-center justify-center gap-0.5 transition-colors"
            style={{ color: isActive ? 'var(--hm-accent)' : 'var(--hm-text-tertiary)' }}
          >
            <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 1.75} />
            <span
              className="text-[10px] leading-none"
              style={{ fontWeight: isActive ? 600 : 400 }}
            >
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
