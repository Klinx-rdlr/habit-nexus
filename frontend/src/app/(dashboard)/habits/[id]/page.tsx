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

function formatSchedule(frequencyType: string, scheduledDays?: number[]): string {
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
    if (habit) document.title = `${habit.name} | HabitMap`;
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
      <div className="mx-auto max-w-3xl py-20 text-center">
        <div className="mb-4 flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-hm-danger-subtle">
            <Archive className="h-6 w-6 text-hm-danger" />
          </div>
        </div>
        <h1 className="font-display text-2xl font-bold text-hm-text-primary">
          Habit not found
        </h1>
        <p className="mt-2 text-sm text-hm-text-secondary">
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
      <div className="mx-auto max-w-3xl space-y-6 animate-fade-in">
        <Skeleton className="h-4 w-16" />
        <div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-5 w-5" circle />
            <Skeleton className="h-8 w-52" />
          </div>
          <Skeleton className="mt-2 h-4 w-40" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
        <Skeleton className="h-[180px] w-full" />
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
        <Skeleton className="h-48" />
      </div>
    );
  }

  const currentStreak = stats?.currentStreak ?? habit.currentStreak;
  const longestStreak = stats?.longestStreak ?? habit.longestStreak;
  const totalCompletions = stats?.totalCompletions ?? completions?.length ?? 0;
  const recentCompletions = (completions ?? []).slice(0, 10);

  return (
    <div className="mx-auto max-w-3xl animate-fade-in">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-hm-text-tertiary transition-colors hover:text-hm-text-secondary"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            {/* Habit color dot */}
            <div
              className="h-5 w-5 shrink-0 rounded-full shadow-hm-sm"
              style={{ backgroundColor: habit.color }}
            />
            <h1 className="font-display text-2xl font-bold text-hm-text-primary">
              {habit.name}
            </h1>
            <StreakBadge streak={currentStreak} />
          </div>
          {habit.description && (
            <p className="mt-2 text-sm text-hm-text-secondary">{habit.description}</p>
          )}
          <p className="mt-1.5 text-xs text-hm-text-tertiary">
            {formatSchedule(habit.frequencyType, habit.scheduledDays)}
            {' · '}
            Since{' '}
            {new Date(habit.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        </div>

        <div className="flex shrink-0 gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => router.push(`/habits/${id}/edit`)}
          >
            <Edit3 className="h-3.5 w-3.5" />
            Edit
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => setShowArchiveModal(true)}
          >
            <Archive className="h-3.5 w-3.5" />
            Archive
          </Button>
        </div>
      </div>

      {/* Streak pair — the emotional core */}
      <div className="mb-6 grid grid-cols-2 gap-3">
        {/* Current streak — lights up when active */}
        <div
          className={`rounded-card border p-5 transition-colors ${
            currentStreak > 0
              ? 'border-hm-accent-subtle bg-hm-accent-subtle'
              : 'border-hm-surface bg-hm-bg-elevated'
          }`}
        >
          <div className="mb-3 flex items-center gap-1.5 text-xs font-medium text-hm-text-tertiary">
            <Flame
              className={`h-3.5 w-3.5 ${
                currentStreak >= 7
                  ? 'animate-flame-flicker text-hm-accent'
                  : currentStreak > 0
                    ? 'text-hm-accent'
                    : ''
              }`}
            />
            Current streak
          </div>
          <p
            className={`font-mono text-4xl font-bold ${
              currentStreak > 0 ? 'text-hm-accent' : 'text-hm-text-tertiary'
            }`}
          >
            {currentStreak}
          </p>
          <p className="mt-1 text-xs text-hm-text-tertiary">days</p>
        </div>

        {/* Longest streak */}
        <div className="rounded-card border border-hm-surface bg-hm-bg-elevated p-5">
          <div className="mb-3 flex items-center gap-1.5 text-xs font-medium text-hm-text-tertiary">
            <Trophy className="h-3.5 w-3.5 text-hm-warning" />
            Longest streak
          </div>
          <p className="font-mono text-4xl font-bold text-hm-text-primary">
            {longestStreak}
          </p>
          <p className="mt-1 text-xs text-hm-text-tertiary">days</p>
        </div>
      </div>

      {/* Heatmap */}
      <div className="mb-6 rounded-card border border-hm-surface bg-hm-bg-elevated p-5 shadow-hm-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-hm-text-primary">
            <Calendar className="h-4 w-4 text-hm-text-tertiary" />
            Last 6 months
          </h2>
          {/* Legend */}
          <div className="flex items-center gap-3 text-xs text-hm-text-tertiary">
            <span className="flex items-center gap-1.5">
              <span
                className="inline-block h-2.5 w-2.5 rounded-sm"
                style={{ backgroundColor: `rgba(${hexToRgbInline(habit.color)}, 0.12)` }}
              />
              Missed
            </span>
            <span className="flex items-center gap-1.5">
              <span
                className="inline-block h-2.5 w-2.5 rounded-sm"
                style={{ backgroundColor: habit.color }}
              />
              Done
            </span>
          </div>
        </div>
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

      {/* Secondary stats — total & rate (streaks shown above, no duplication) */}
      <div className="mb-6 grid grid-cols-2 gap-3">
        <StatCard
          icon={<CheckCircle2 className="h-4 w-4 text-hm-success" />}
          label="Total check-offs"
          value={`${totalCompletions}`}
        />
        <StatCard
          icon={<Percent className="h-4 w-4 text-hm-text-tertiary" />}
          label="Completion rate"
          value={
            stats?.completionRate !== undefined ? `${stats.completionRate}%` : '—'
          }
        />
      </div>

      {/* Recent completions */}
      <div className="rounded-card border border-hm-surface bg-hm-bg-elevated p-5 shadow-hm-sm">
        <h2 className="mb-4 text-sm font-semibold text-hm-text-primary">
          Recent completions
        </h2>
        {recentCompletions.length > 0 ? (
          <ul className="divide-y divide-hm-surface">
            {recentCompletions.map((c: CompletionResponse) => (
              <li key={c.id} className="flex items-center justify-between py-2.5">
                <span className="text-sm text-hm-text-primary">
                  {formatDateDisplay(c.completedDate)}
                </span>
                <div className="flex items-center gap-2">
                  {c.note && (
                    <span className="max-w-[140px] truncate text-xs text-hm-text-tertiary">
                      {c.note}
                    </span>
                  )}
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-hm-success" />
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-hm-bg-sunken">
              <Calendar className="h-5 w-5 text-hm-text-tertiary" />
            </div>
            <p className="text-sm font-medium text-hm-text-secondary">
              No completions yet
            </p>
            <p className="text-xs text-hm-text-tertiary">
              Check off this habit from Today to get started
            </p>
          </div>
        )}
      </div>

      {/* Archive confirmation */}
      <Modal
        open={showArchiveModal}
        onClose={() => setShowArchiveModal(false)}
        title="Archive habit"
      >
        <p className="mb-6 text-sm text-hm-text-secondary">
          Are you sure you want to archive{' '}
          <strong className="text-hm-text-primary">{habit.name}</strong>? It will
          be hidden from your dashboard. Your completion history is preserved.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setShowArchiveModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" isLoading={isArchiving} onClick={handleArchive}>
            Archive
          </Button>
        </div>
      </Modal>
    </div>
  );
}

/** Inline helper — only used for the heatmap legend swatch */
function hexToRgbInline(hex: string): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `${r}, ${g}, ${b}`;
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
    <div className="rounded-card border border-hm-surface bg-hm-bg-elevated p-4 shadow-hm-sm">
      <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-hm-text-tertiary">
        {icon}
        {label}
      </div>
      <p className="font-mono text-2xl font-bold text-hm-text-primary">{value}</p>
    </div>
  );
}
