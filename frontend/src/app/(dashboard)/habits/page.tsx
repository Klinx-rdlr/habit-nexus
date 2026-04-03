'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { getHabits } from '@/lib/api/habits';
import { StreakBadge } from '@/components/habits/StreakBadge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';

export default function HabitsPage() {
  const router = useRouter();
  const { data: habits, isLoading, isError, refetch } = useQuery({
    queryKey: ['habits'],
    queryFn: () => getHabits(false),
  });

  useEffect(() => {
    document.title = 'My Habits | HabitMap';
  }, []);

  if (isError) {
    return (
      <div className="mx-auto max-w-2xl py-16 text-center">
        <p className="mb-4 text-surface-500">Failed to load habits.</p>
        <Button onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
          My Habits
        </h1>
        <Button onClick={() => router.push('/habits/new')}>
          <Plus className="h-4 w-4" />
          New habit
        </Button>
      </div>

      {!habits?.length ? (
        <EmptyState
          icon={<Plus className="h-12 w-12" />}
          title="No habits yet"
          description="Create your first habit to start tracking."
          actionLabel="Create habit"
          onAction={() => router.push('/habits/new')}
        />
      ) : (
        <div className="space-y-2">
          {habits.map((habit) => (
            <button
              key={habit.id}
              onClick={() => router.push(`/habits/${habit.id}`)}
              className="flex w-full items-center gap-4 rounded-xl border border-surface-200 bg-surface-0 p-4 text-left transition-all duration-200 hover:shadow-card hover:-translate-y-0.5 dark:border-surface-800 dark:bg-surface-900 dark:hover:bg-surface-800"
            >
              <div
                className="h-3 w-3 shrink-0 rounded-full"
                style={{ backgroundColor: habit.color }}
              />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-surface-900 dark:text-surface-100">
                  {habit.name}
                </p>
                <p className="text-xs text-surface-500">
                  {habit.frequencyType === 'daily' ? 'Every day' : 'Custom schedule'}
                </p>
              </div>
              <StreakBadge streak={habit.currentStreak} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
