'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import {
  getTodayHabits,
  completeHabit,
  undoCompletion,
} from '@/lib/api/habits';
import { HabitCard } from '@/components/habits/HabitCard';
import { ProgressRing } from '@/components/habits/ProgressRing';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/hooks/useToast';

function formatToday(): string {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

function todayDateString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function TodayPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const toast = useToast();

  const { data: habits, isLoading } = useQuery({
    queryKey: ['habits', 'today'],
    queryFn: getTodayHabits,
  });

  const completed = habits?.filter((h) => h.completedToday).length ?? 0;
  const total = habits?.length ?? 0;

  async function handleToggle(
    habitId: string,
    shouldComplete: boolean,
  ): Promise<void> {
    try {
      if (shouldComplete) {
        await completeHabit(habitId);
      } else {
        await undoCompletion(habitId, todayDateString());
      }
      await queryClient.invalidateQueries({ queryKey: ['habits', 'today'] });
      await queryClient.invalidateQueries({ queryKey: ['habit', habitId] });
    } catch {
      toast.error('Failed to update habit. Please try again.');
      throw new Error('toggle failed');
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-12 w-12" circle />
        </div>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[72px] w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
            Today
          </h1>
          <p className="text-sm text-surface-500">{formatToday()}</p>
        </div>
        {total > 0 && <ProgressRing completed={completed} total={total} />}
      </div>

      {total === 0 ? (
        <EmptyState
          icon={<Plus className="h-12 w-12" />}
          title="No habits yet"
          description="Start building better habits today. Create your first habit and track your progress."
          actionLabel="Create your first habit"
          onAction={() => router.push('/habits/new')}
        />
      ) : (
        <div className="space-y-3">
          {habits?.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              onToggle={handleToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}
