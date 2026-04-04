'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { LandingPage } from '@/components/landing/LandingPage';
import { useEffect } from 'react';

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.push('/today');
    }
  }, [user, isLoading, router]);

  if (isLoading || user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
      </div>
    );
  }

  return <LandingPage />;
}
