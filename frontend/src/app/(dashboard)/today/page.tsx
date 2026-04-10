'use client';

import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Plus, RefreshCw } from 'lucide-react';
import {
  getTodayHabits,
  completeHabit,
  undoCompletion,
} from '@/lib/api/habits';
import { HabitCard } from '@/components/habits/HabitCard';
import { ProgressRing } from '@/components/habits/ProgressRing';
import { useToast } from '@/hooks/useToast';

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

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

  useEffect(() => {
    document.title = 'Today | HabitMap';
  }, []);

  const {
    data: habits,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['habits', 'today'],
    queryFn: getTodayHabits,
  });

  const completed = habits?.filter((h) => h.completedToday).length ?? 0;
  const total = habits?.length ?? 0;
  const progressPct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const allDone = total > 0 && completed === total;

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

  if (isError) {
    return (
      <div className="mx-auto max-w-3xl py-20 text-center">
        <p className="mb-6 text-base" style={{ color: 'var(--hm-text-secondary)' }}>
          Couldn&apos;t load today&apos;s habits.
        </p>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 rounded-card px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-90"
          style={{
            backgroundColor: 'var(--hm-accent)',
            color: 'var(--hm-accent-text)',
          }}
        >
          <RefreshCw className="h-4 w-4" />
          Try again
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl">
        {/* Header skeleton */}
        <div className="mb-8 flex items-start justify-between">
          <div className="space-y-2">
            <div
              className="h-9 w-44 animate-pulse rounded-lg"
              style={{ backgroundColor: 'var(--hm-surface)' }}
            />
            <div
              className="h-4 w-36 animate-pulse rounded"
              style={{ backgroundColor: 'var(--hm-surface)' }}
            />
          </div>
          <div
            className="h-14 w-14 animate-pulse rounded-full"
            style={{ backgroundColor: 'var(--hm-surface)' }}
          />
        </div>
        {/* Progress bar skeleton */}
        <div
          className="mb-6 h-2 animate-pulse rounded-full"
          style={{ backgroundColor: 'var(--hm-surface)' }}
        />
        {/* Card skeletons */}
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="mb-3 h-[68px] animate-pulse rounded-card"
            style={{
              backgroundColor: 'var(--hm-surface)',
              animationDelay: `${i * 80}ms`,
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1
            className="text-3xl font-semibold leading-tight tracking-tight"
            style={{
              fontFamily: '"Bricolage Grotesque", sans-serif',
              color: 'var(--hm-text-primary)',
            }}
          >
            {getGreeting()}
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--hm-text-secondary)' }}>
            {formatToday()}
          </p>
        </div>
        {total > 0 && <ProgressRing completed={completed} total={total} />}
      </div>

      {/* ── Progress bar ───────────────────────────────────── */}
      {total > 0 && (
        <div className="mb-7">
          <div
            className="h-2 w-full overflow-hidden rounded-full"
            style={{ backgroundColor: 'var(--hm-surface)' }}
          >
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${progressPct}%`,
                backgroundColor: allDone ? 'var(--hm-success)' : 'var(--hm-accent)',
              }}
            />
          </div>
          <p className="mt-1.5 text-xs" style={{ color: 'var(--hm-text-tertiary)' }}>
            {allDone
              ? '🎉 All done for today!'
              : `${completed} of ${total} completed`}
          </p>
        </div>
      )}

      {/* ── Habit list / empty state ────────────────────────── */}
      {total === 0 ? (
        <div
          className="mt-12 flex flex-col items-center gap-5 rounded-card border py-16 text-center"
          style={{
            borderColor: 'var(--hm-surface)',
            backgroundColor: 'var(--hm-bg-elevated)',
          }}
        >
          <div
            className="flex h-14 w-14 items-center justify-center rounded-full text-2xl"
            style={{ backgroundColor: 'var(--hm-accent-subtle)' }}
          >
            🌱
          </div>
          <div>
            <p
              className="text-base font-semibold"
              style={{ color: 'var(--hm-text-primary)' }}
            >
              No habits yet
            </p>
            <p className="mt-1 text-sm" style={{ color: 'var(--hm-text-secondary)' }}>
              Start building momentum. Create your first habit.
            </p>
          </div>
          <button
            onClick={() => router.push('/habits/new')}
            className="inline-flex items-center gap-2 rounded-card px-5 py-2.5 text-sm font-medium transition-all duration-200 hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]"
            style={{
              backgroundColor: 'var(--hm-accent)',
              color: 'var(--hm-accent-text)',
            }}
          >
            <Plus className="h-4 w-4" />
            Create your first habit
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {habits?.map((habit, i) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              onToggle={handleToggle}
              index={i}
            />
          ))}
        </div>
      )}
    </div>
  );
}
