'use client';

import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Plus, RefreshCw } from 'lucide-react';
import {
  getTodayHabits,
  completeHabit,
  undoCompletion,
  type TodayHabitResponse,
} from '@/lib/api/habits';
import { HabitCard } from '@/components/habits/HabitCard';
import { ProgressRing } from '@/components/habits/ProgressRing';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';

// ─── Helpers ─────────────────────────────────────────────────

function getGreeting(timezone?: string): string {
  let hour: number;
  try {
    hour = timezone
      ? parseInt(
          new Intl.DateTimeFormat('en-US', {
            hour: 'numeric',
            hour12: false,
            timeZone: timezone,
          }).format(new Date()),
          10,
        )
      : new Date().getHours();
  } catch {
    hour = new Date().getHours();
  }
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
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

// Sort: incomplete+scheduled-today → incomplete+not-scheduled → completed
function sortHabits(habits: TodayHabitResponse[]): TodayHabitResponse[] {
  const todayApiDay = (new Date().getDay() + 6) % 7; // 0=Mon, 6=Sun
  function score(h: TodayHabitResponse): number {
    if (h.completedToday) return 2;
    const scheduledToday =
      h.frequencyType === 'daily' ||
      (h.scheduledDays?.includes(todayApiDay) ?? false);
    return scheduledToday ? 0 : 1;
  }
  return [...habits].sort((a, b) => score(a) - score(b));
}

// ─── Page ─────────────────────────────────────────────────────

export default function TodayPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const toast = useToast();
  const { user } = useAuth();

  useEffect(() => {
    document.title = 'Today | HabitMap';
  }, []);

  const {
    data: rawHabits,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['habits', 'today'],
    queryFn: getTodayHabits,
  });

  const habits = rawHabits ? sortHabits(rawHabits) : undefined;
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

  // ── Error ──────────────────────────────────────────────────

  if (isError) {
    return (
      <div className="mx-auto max-w-3xl py-20 text-center">
        <p className="mb-6 text-base text-hm-text-secondary">
          Couldn&apos;t load today&apos;s habits.
        </p>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 rounded-card px-5 py-2.5 text-sm font-medium bg-hm-accent text-white transition-opacity hover:opacity-90"
        >
          <RefreshCw className="h-4 w-4" />
          Try again
        </button>
      </div>
    );
  }

  // ── Loading ────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-start justify-between">
          <div className="space-y-2">
            <div className="h-9 w-52 animate-pulse rounded-lg bg-hm-surface" />
            <div className="h-4 w-36 animate-pulse rounded bg-hm-surface" />
          </div>
          <div className="h-14 w-14 animate-pulse rounded-full bg-hm-surface" />
        </div>
        <div className="mb-6 h-2 animate-pulse rounded-full bg-hm-surface" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="mb-3 h-[68px] animate-pulse rounded-card bg-hm-surface"
            style={{ animationDelay: `${i * 80}ms` }}
          />
        ))}
      </div>
    );
  }

  // ── Page ───────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-3xl">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold leading-tight tracking-tight text-hm-text-primary">
            {getGreeting(user?.timezone)}
            {user?.username && (
              <span className="text-hm-text-secondary">, {user.username}</span>
            )}
          </h1>
          <p className="mt-1 text-sm text-hm-text-secondary">{formatToday()}</p>
        </div>
        {total > 0 && <ProgressRing completed={completed} total={total} />}
      </div>

      {/* Progress bar */}
      {total > 0 && (
        <div className="mb-7">
          <div className="h-2 w-full overflow-hidden rounded-full bg-hm-surface">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${progressPct}%`,
                backgroundColor: allDone
                  ? 'var(--hm-success)'
                  : 'var(--hm-accent)',
              }}
            />
          </div>
          <p className="mt-1.5 text-xs text-hm-text-tertiary">
            {allDone ? '🎉 All done for today!' : `${completed} of ${total} completed`}
          </p>
        </div>
      )}

      {/* Habit list or empty state */}
      {total === 0 ? (
        <div className="mt-12 flex flex-col items-center gap-5 rounded-card border border-hm-surface bg-hm-bg-elevated py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-hm-accent-subtle text-2xl">
            🌱
          </div>
          <div>
            <p className="text-base font-semibold text-hm-text-primary">
              No habits yet
            </p>
            <p className="mt-1 text-sm text-hm-text-secondary">
              Start building momentum. Create your first habit.
            </p>
          </div>
          <button
            onClick={() => router.push('/habits/new')}
            className="inline-flex items-center gap-2 rounded-card bg-hm-accent px-5 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]"
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
