'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { BottomTabBar } from '@/components/layout/BottomTabBar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-hm-bg">
        <div
          className="h-8 w-8 animate-spin rounded-full border-[3px]"
          style={{
            borderColor: 'var(--hm-surface)',
            borderTopColor: 'var(--hm-accent)',
          }}
        />
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-hm-bg">
      {/* Desktop: slim sidebar */}
      <div className="hidden w-56 shrink-0 lg:block">
        <Sidebar />
      </div>

      {/* Main column */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile: top bar */}
        <Header />

        {/* Scrollable content area */}
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          {/*
            Mobile: pb accounts for the fixed 56px bottom tab bar.
            Desktop: standard padding, no pb needed.
          */}
          <div className="animate-fade-in px-4 pb-24 pt-5 lg:px-8 lg:pb-8 lg:pt-6">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile: bottom tab bar */}
      <BottomTabBar />
    </div>
  );
}
