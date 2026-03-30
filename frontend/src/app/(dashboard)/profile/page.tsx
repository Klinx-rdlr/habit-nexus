'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  User,
  Flame,
  Trophy,
  CheckCircle2,
  Calendar,
  Percent,
  Zap,
  Users,
  Crown,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getHabits, getHabitStats, type HabitResponse, type HabitStatsResponse } from '@/lib/api/habits';
import { getGroups } from '@/lib/api/groups';
import { StreakBadge } from '@/components/habits/StreakBadge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();

  const { data: allHabits, isLoading: habitsLoading, isError: habitsError, refetch: refetchHabits } = useQuery({
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

  // Aggregate stats
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
    : user
      ? Math.floor((Date.now() - new Date().getTime()) / 86400000) || 1
      : 0;

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
        <p className="mb-4 text-surface-500">Failed to load profile data.</p>
        <Button onClick={() => refetchHabits()}>Retry</Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-16 w-16" circle />
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-56" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
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
    <div className="mx-auto max-w-3xl">
      {/* User info header */}
      <div className="mb-8 flex items-center gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
          <User className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
            {user?.username}
          </h1>
          <p className="text-sm text-surface-500">
            {user?.email}
          </p>
          <p className="text-xs text-surface-400">
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

      {/* Stats grid */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard
          icon={<CheckCircle2 className="h-4 w-4" />}
          label="Total habits"
          value={`${totalHabits}`}
        />
        <StatCard
          icon={<Calendar className="h-4 w-4" />}
          label="Total completions"
          value={`${totalCompletions}`}
        />
        <StatCard
          icon={<Trophy className="h-4 w-4" />}
          label="Longest ever streak"
          value={bestStreakHabit ? `${bestStreakHabit.streak}` : '0'}
          subtitle={bestStreakHabit?.name}
        />
        <StatCard
          icon={<Zap className="h-4 w-4" />}
          label="Active streaks"
          value={`${activeStreaks}`}
        />
        <StatCard
          icon={<Flame className="h-4 w-4" />}
          label="Days active"
          value={`${Math.max(daysSinceCreation, 1)}`}
        />
        <StatCard
          icon={<Percent className="h-4 w-4" />}
          label="Completion rate"
          value={`${overallCompletionRate}%`}
        />
      </div>

      {/* My habits summary */}
      <div className="mb-8 rounded-xl border border-surface-200 bg-surface-0 p-5 dark:border-surface-800 dark:bg-surface-900">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-medium text-surface-700 dark:text-surface-300">
            My habits
          </h2>
          <button
            onClick={() => router.push('/habits')}
            className="text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
          >
            View all
          </button>
        </div>
        {activeHabits.length === 0 ? (
          <p className="py-4 text-center text-sm text-surface-400">
            No active habits yet.
          </p>
        ) : (
          <div className="divide-y divide-surface-100 dark:divide-surface-800">
            {activeHabits.map((habit) => (
              <button
                key={habit.id}
                onClick={() => router.push(`/habits/${habit.id}`)}
                className="flex w-full items-center gap-3 py-2.5 text-left transition-colors hover:bg-surface-50 dark:hover:bg-surface-800 -mx-2 px-2 rounded-lg"
              >
                <div
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{ backgroundColor: habit.color }}
                />
                <span className="flex-1 text-sm font-medium text-surface-900 dark:text-surface-100 truncate">
                  {habit.name}
                </span>
                <StreakBadge streak={habit.currentStreak} />
                <ChevronRight className="h-4 w-4 shrink-0 text-surface-300 dark:text-surface-600" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Groups summary */}
      <div className="rounded-xl border border-surface-200 bg-surface-0 p-5 dark:border-surface-800 dark:bg-surface-900">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-medium text-surface-700 dark:text-surface-300">
            My groups
          </h2>
          <button
            onClick={() => router.push('/groups')}
            className="text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
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
          <p className="py-4 text-center text-sm text-surface-400">
            Not in any groups yet.
          </p>
        ) : (
          <div className="divide-y divide-surface-100 dark:divide-surface-800">
            {groups.map((group) => (
              <button
                key={group.id}
                onClick={() => router.push(`/groups/${group.id}`)}
                className="flex w-full items-center gap-3 py-2.5 text-left transition-colors hover:bg-surface-50 dark:hover:bg-surface-800 -mx-2 px-2 rounded-lg"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
                  <Users className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-surface-900 dark:text-surface-100 truncate">
                      {group.name}
                    </span>
                    {group.createdBy === user?.id && (
                      <Crown className="h-3 w-3 shrink-0 text-amber-500" />
                    )}
                  </div>
                  <span className="text-xs text-surface-500">
                    {group.memberCount} {group.memberCount === 1 ? 'member' : 'members'}
                  </span>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-surface-300 dark:text-surface-600" />
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
    <div className="rounded-xl border border-surface-200 bg-surface-0 p-4 dark:border-surface-800 dark:bg-surface-900">
      <div className="flex items-center gap-1.5 text-surface-400">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className="mt-1 text-xl font-bold text-surface-900 dark:text-surface-100">
        {value}
      </p>
      {subtitle && (
        <p className="mt-0.5 truncate text-xs text-surface-400">{subtitle}</p>
      )}
    </div>
  );
}
