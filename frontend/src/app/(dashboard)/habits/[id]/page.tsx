'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Calendar,
  Edit3,
  Archive,
  Flame,
  Trophy,
  CheckCircle2,
  Percent,
} from 'lucide-react';
import {
  getHabit,
  getHabitStats,
  getCompletions,
  deleteHabit,
  type CompletionResponse,
} from '@/lib/api/habits';
import { HeatmapCalendar } from '@/components/habits/HeatmapCalendar';
import { StreakBadge } from '@/components/habits/StreakBadge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/hooks/useToast';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function formatSchedule(
  frequencyType: string,
  scheduledDays?: number[],
): string {
  if (frequencyType === 'daily') return 'Every day';
  if (!scheduledDays?.length) return 'Custom schedule';
  return scheduledDays.map((d) => DAYS[d]).join(', ');
}

function formatDateDisplay(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export default function HabitDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);

  const {
    data: habit,
    isLoading: habitLoading,
    error: habitError,
  } = useQuery({
    queryKey: ['habit', id],
    queryFn: () => getHabit(id),
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['habit', id, 'stats'],
    queryFn: () => getHabitStats(id),
    enabled: !!habit,
  });

  const { data: completions } = useQuery({
    queryKey: ['habit', id, 'completions', 'recent'],
    queryFn: () => getCompletions(id),
    enabled: !!habit,
  });

  useEffect(() => {
    if (habit) {
      document.title = `${habit.name} | HabitMap`;
    }
  }, [habit]);

  async function handleArchive() {
    setIsArchiving(true);
    try {
      await deleteHabit(id);
      toast.success('Habit archived');
      await queryClient.invalidateQueries({ queryKey: ['habits'] });
      router.push('/habits');
    } catch {
      toast.error('Failed to archive habit');
    } finally {
      setIsArchiving(false);
      setShowArchiveModal(false);
    }
  }

  if (habitError) {
    return (
      <div className="mx-auto max-w-3xl py-16 text-center">
        <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
          Habit not found
        </h1>
        <p className="mt-2 text-surface-500">
          This habit doesn&apos;t exist or has been archived.
        </p>
        <Button onClick={() => router.push('/habits')} className="mt-6">
          Back to habits
        </Button>
      </div>
    );
  }

  if (habitLoading || !habit) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <Skeleton className="h-6 w-32" />
        <div className="space-y-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-5 w-40" />
        </div>
        <div className="flex gap-4">
          <Skeleton className="h-24 w-32" />
          <Skeleton className="h-24 w-32" />
        </div>
        <Skeleton className="h-[140px] w-full" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const recentCompletions = (completions ?? []).slice(0, 10);
  const totalCompletions = stats?.totalCompletions ?? completions?.length ?? 0;

  return (
    <div className="mx-auto max-w-3xl">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-surface-500 transition-colors hover:text-surface-700 dark:hover:text-surface-300"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div
              className="h-4 w-4 rounded-full"
              style={{ backgroundColor: habit.color }}
            />
            <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
              {habit.name}
            </h1>
            <StreakBadge streak={habit.currentStreak} />
          </div>
          {habit.description && (
            <p className="mt-1.5 text-sm text-surface-500">
              {habit.description}
            </p>
          )}
          <p className="mt-1 text-xs text-surface-400">
            {formatSchedule(habit.frequencyType, habit.scheduledDays)}
            {' \u00b7 '}
            Active since{' '}
            {new Date(habit.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 shrink-0">
          <Button
            variant="secondary"
            onClick={() => router.push(`/habits/${id}/edit`)}
          >
            <Edit3 className="h-4 w-4" />
            Edit
          </Button>
          <Button variant="danger" onClick={() => setShowArchiveModal(true)}>
            <Archive className="h-4 w-4" />
            Archive
          </Button>
        </div>
      </div>

      {/* Streak highlight */}
      <div className="mb-8 grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-surface-200 bg-surface-0 p-4 dark:border-surface-800 dark:bg-surface-900">
          <div className="flex items-center gap-2 text-sm text-surface-500">
            <Flame className="h-4 w-4" />
            Current streak
          </div>
          <p className="mt-1 text-3xl font-bold text-surface-900 dark:text-surface-100">
            {stats?.currentStreak ?? habit.currentStreak}
            <span className="ml-1 text-base font-normal text-surface-400">
              days
            </span>
          </p>
        </div>
        <div className="rounded-xl border border-surface-200 bg-surface-0 p-4 dark:border-surface-800 dark:bg-surface-900">
          <div className="flex items-center gap-2 text-sm text-surface-500">
            <Trophy className="h-4 w-4" />
            Longest streak
          </div>
          <p className="mt-1 text-3xl font-bold text-surface-900 dark:text-surface-100">
            {stats?.longestStreak ?? habit.longestStreak}
            <span className="ml-1 text-base font-normal text-surface-400">
              days
            </span>
          </p>
        </div>
      </div>

      {/* Heatmap */}
      <div className="mb-8 rounded-xl border border-surface-200 bg-surface-0 p-4 dark:border-surface-800 dark:bg-surface-900">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-medium text-surface-700 dark:text-surface-300">
          <Calendar className="h-4 w-4" />
          Last 6 months
        </h2>
        {statsLoading ? (
          <Skeleton className="h-[130px] w-full" />
        ) : (
          <HeatmapCalendar
            heatmap={stats?.heatmap ?? {}}
            color={habit.color}
            frequencyType={habit.frequencyType}
            scheduledDays={habit.scheduledDays}
          />
        )}
      </div>

      {/* Stats grid */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          icon={<Flame className="h-4 w-4" />}
          label="Current streak"
          value={`${stats?.currentStreak ?? habit.currentStreak}`}
        />
        <StatCard
          icon={<Trophy className="h-4 w-4" />}
          label="Longest streak"
          value={`${stats?.longestStreak ?? habit.longestStreak}`}
        />
        <StatCard
          icon={<CheckCircle2 className="h-4 w-4" />}
          label="Total completions"
          value={`${totalCompletions}`}
        />
        <StatCard
          icon={<Percent className="h-4 w-4" />}
          label="Completion rate"
          value={
            stats?.completionRate !== undefined
              ? `${stats.completionRate}%`
              : '\u2014'
          }
        />
      </div>

      {/* Recent completions */}
      <div className="rounded-xl border border-surface-200 bg-surface-0 p-4 dark:border-surface-800 dark:bg-surface-900">
        <h2 className="mb-4 text-sm font-medium text-surface-700 dark:text-surface-300">
          Recent completions
        </h2>
        {recentCompletions.length > 0 ? (
          <ul className="divide-y divide-surface-100 dark:divide-surface-800">
            {recentCompletions.map((c: CompletionResponse) => (
              <li key={c.id} className="flex items-center justify-between py-2.5">
                <span className="text-sm text-surface-900 dark:text-surface-100">
                  {formatDateDisplay(c.completedDate)}
                </span>
                {c.note && (
                  <span className="ml-4 truncate text-xs text-surface-400">
                    {c.note}
                  </span>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="py-6 text-center text-sm text-surface-400">
            No completions yet. Check off this habit to get started!
          </p>
        )}
      </div>

      {/* Archive confirmation modal */}
      <Modal
        open={showArchiveModal}
        onClose={() => setShowArchiveModal(false)}
        title="Archive habit"
      >
        <p className="mb-6 text-sm text-surface-600 dark:text-surface-400">
          Are you sure you want to archive <strong>{habit.name}</strong>? This
          will hide the habit from your dashboard. Your completion history will
          be preserved.
        </p>
        <div className="flex justify-end gap-3">
          <Button
            variant="secondary"
            onClick={() => setShowArchiveModal(false)}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            isLoading={isArchiving}
            onClick={handleArchive}
          >
            Archive
          </Button>
        </div>
      </Modal>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-surface-200 bg-surface-0 p-4 dark:border-surface-800 dark:bg-surface-900">
      <div className="flex items-center gap-1.5 text-surface-400">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className="mt-1 text-xl font-bold text-surface-900 dark:text-surface-100">
        {value}
      </p>
    </div>
  );
}
