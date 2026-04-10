'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  Flame,
  Trophy,
  CheckCircle2,
  Calendar,
  Percent,
  Zap,
  Users,
  Crown,
  ChevronRight,
  Settings,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getHabits, getHabitStats, type HabitStatsResponse } from '@/lib/api/habits';
import { getGroups } from '@/lib/api/groups';
import { StreakBadge } from '@/components/habits/StreakBadge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    document.title = user?.username
      ? `${user.username} | HabitMap`
      : 'Profile | HabitMap';
  }, [user?.username]);

  const {
    data: allHabits,
    isLoading: habitsLoading,
    isError: habitsError,
    refetch: refetchHabits,
  } = useQuery({
    queryKey: ['habits', 'all-for-profile'],
    queryFn: () => getHabits(),
  });

  const { data: archivedHabits } = useQuery({
    queryKey: ['habits', 'archived-for-profile'],
    queryFn: () => getHabits(true),
  });

  const activeHabits = allHabits?.filter((h) => !h.isArchived) ?? [];

  const { data: statsMap, isLoading: statsLoading } = useQuery({
    queryKey: ['habits', 'all-stats', activeHabits.map((h) => h.id).join(',')],
    queryFn: async () => {
      const entries = await Promise.all(
        activeHabits.map(async (h) => {
          try {
            const s = await getHabitStats(h.id);
            return [h.id, s] as [string, HabitStatsResponse];
          } catch {
            return null;
          }
        }),
      );
      return Object.fromEntries(entries.filter(Boolean) as [string, HabitStatsResponse][]);
    },
    enabled: activeHabits.length > 0,
  });

  const { data: groups, isLoading: groupsLoading } = useQuery({
    queryKey: ['groups'],
    queryFn: getGroups,
  });

  const isLoading = habitsLoading || statsLoading;

  const totalHabits = (allHabits?.length ?? 0) + (archivedHabits?.length ?? 0);
  const totalCompletions = statsMap
    ? Object.values(statsMap).reduce((sum, s) => sum + s.totalCompletions, 0)
    : 0;

  let bestStreakHabit: { name: string; streak: number } | null = null;
  if (allHabits && statsMap) {
    for (const h of allHabits) {
      const s = statsMap[h.id];
      if (s && (!bestStreakHabit || s.longestStreak > bestStreakHabit.streak)) {
        bestStreakHabit = { name: h.name, streak: s.longestStreak };
      }
    }
  }

  const activeStreaks = activeHabits.filter((h) => h.currentStreak > 0).length;

  const daysSinceCreation = user?.createdAt
    ? Math.floor((Date.now() - new Date(user.createdAt).getTime()) / 86400000)
    : 1;

  const overallCompletionRate = statsMap
    ? (() => {
        const rates = Object.values(statsMap).filter((s) => s.completionRate > 0);
        if (rates.length === 0) return 0;
        return Math.round(rates.reduce((sum, s) => sum + s.completionRate, 0) / rates.length);
      })()
    : 0;

  if (habitsError) {
    return (
      <div className="mx-auto max-w-3xl py-16 text-center">
        <p className="mb-4 text-sm text-hm-text-secondary">Failed to load profile data.</p>
        <Button onClick={() => refetchHabits()}>Retry</Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-6 animate-fade-in">
        <div className="flex items-center gap-4">
          <Skeleton className="h-16 w-16" circle />
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-56" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl animate-fade-in">
      {/* ── User header ──────────────────────────────────────────────────── */}
      <div className="mb-8 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* Initial avatar */}
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-hm-accent-subtle text-2xl font-bold text-hm-accent">
            {user?.username?.charAt(0).toUpperCase() ?? '?'}
          </div>
          <div className="min-w-0">
            <h1 className="font-display text-2xl font-bold text-hm-text-primary">
              {user?.username}
            </h1>
            <p className="truncate text-sm text-hm-text-secondary">{user?.email}</p>
            <p className="mt-0.5 text-xs text-hm-text-tertiary">
              Member since{' '}
              {user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric',
                  })
                : 'recently'}
              {' · '}
              {user?.timezone ?? 'Unknown timezone'}
            </p>
          </div>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => router.push('/settings')}
          className="shrink-0"
        >
          <Settings className="h-3.5 w-3.5" />
          Settings
        </Button>
      </div>

      {/* ── Stats grid ───────────────────────────────────────────────────── */}
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard
          icon={<CheckCircle2 className="h-4 w-4 text-hm-success" />}
          label="Total habits"
          value={`${totalHabits}`}
        />
        <StatCard
          icon={<Calendar className="h-4 w-4 text-hm-accent" />}
          label="Total completions"
          value={`${totalCompletions}`}
        />
        <StatCard
          icon={<Trophy className="h-4 w-4 text-hm-warning" />}
          label="Longest ever streak"
          value={bestStreakHabit ? `${bestStreakHabit.streak}` : '0'}
          subtitle={bestStreakHabit?.name}
        />
        <StatCard
          icon={<Zap className="h-4 w-4 text-hm-warning" />}
          label="Active streaks"
          value={`${activeStreaks}`}
        />
        <StatCard
          icon={<Flame className="h-4 w-4 text-hm-danger" />}
          label="Days active"
          value={`${Math.max(daysSinceCreation, 1)}`}
        />
        <StatCard
          icon={<Percent className="h-4 w-4 text-hm-success" />}
          label="Completion rate"
          value={`${overallCompletionRate}%`}
        />
      </div>

      {/* ── My habits ────────────────────────────────────────────────────── */}
      <div className="mb-4 rounded-card border border-hm-surface bg-hm-bg-elevated p-5 shadow-hm-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-hm-text-primary">My habits</h2>
          <button
            onClick={() => router.push('/habits')}
            className="text-xs font-medium text-hm-accent transition-colors hover:text-hm-accent-hover"
          >
            View all
          </button>
        </div>
        {activeHabits.length === 0 ? (
          <p className="py-4 text-center text-sm text-hm-text-tertiary">
            No active habits yet.
          </p>
        ) : (
          <div className="divide-y divide-hm-surface">
            {activeHabits.map((habit) => (
              <button
                key={habit.id}
                onClick={() => router.push(`/habits/${habit.id}`)}
                className="-mx-2 flex w-[calc(100%+1rem)] items-center gap-3 rounded-lg px-2 py-2.5 text-left transition-colors hover:bg-hm-bg-sunken"
              >
                <div
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{ backgroundColor: habit.color }}
                />
                <span className="flex-1 truncate text-sm font-medium text-hm-text-primary">
                  {habit.name}
                </span>
                <StreakBadge streak={habit.currentStreak} />
                <ChevronRight className="h-4 w-4 shrink-0 text-hm-text-tertiary" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── My groups ────────────────────────────────────────────────────── */}
      <div className="rounded-card border border-hm-surface bg-hm-bg-elevated p-5 shadow-hm-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-hm-text-primary">My groups</h2>
          <button
            onClick={() => router.push('/groups')}
            className="text-xs font-medium text-hm-accent transition-colors hover:text-hm-accent-hover"
          >
            View all
          </button>
        </div>
        {groupsLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : !groups?.length ? (
          <p className="py-4 text-center text-sm text-hm-text-tertiary">
            Not in any groups yet.
          </p>
        ) : (
          <div className="divide-y divide-hm-surface">
            {groups.map((group) => (
              <button
                key={group.id}
                onClick={() => router.push(`/groups/${group.id}`)}
                className="-mx-2 flex w-[calc(100%+1rem)] items-center gap-3 rounded-lg px-2 py-2.5 text-left transition-colors hover:bg-hm-bg-sunken"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-hm-accent-subtle text-hm-accent">
                  <Users className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium text-hm-text-primary">
                      {group.name}
                    </span>
                    {group.createdBy === user?.id && (
                      <Crown className="h-3 w-3 shrink-0 text-hm-warning" />
                    )}
                  </div>
                  <span className="text-xs text-hm-text-tertiary">
                    {group.memberCount} {group.memberCount === 1 ? 'member' : 'members'}
                  </span>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-hm-text-tertiary" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  subtitle,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtitle?: string;
}) {
  return (
    <div className="rounded-card border border-hm-surface bg-hm-bg-elevated p-4 shadow-hm-sm">
      <div className="mb-1 flex items-center gap-1.5 text-hm-text-tertiary">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className="font-mono text-xl font-bold text-hm-text-primary">{value}</p>
      {subtitle && (
        <p className="mt-0.5 truncate text-xs text-hm-text-tertiary">{subtitle}</p>
      )}
    </div>
  );
}
