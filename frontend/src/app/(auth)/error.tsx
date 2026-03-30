'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Auth error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-50 dark:bg-surface-900 px-4">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
          <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
        </div>
        <h2 className="mb-2 text-xl font-semibold text-surface-900 dark:text-surface-100">
          Something went wrong
        </h2>
        <p className="mb-6 text-surface-500">
          We encountered an unexpected error. Please try again.
        </p>
        <Button onClick={reset}>Try again</Button>
      </div>
    </div>
  );
}
