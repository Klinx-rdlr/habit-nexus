'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Trophy } from 'lucide-react';
import { getLeaderboard, getGroup } from '@/lib/api/groups';
import { LeaderboardTable } from '@/components/groups/LeaderboardTable';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAuth } from '@/hooks/useAuth';

type RankBy = 'streaks' | 'completion';

export default function LeaderboardPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [rankBy, setRankBy] = useState<RankBy>('streaks');

  const { data: group } = useQuery({
    queryKey: ['group', id],
    queryFn: () => getGroup(id),
  });

  const { data: entries, isLoading } = useQuery({
    queryKey: ['leaderboard', id, rankBy],
    queryFn: () => getLeaderboard(id, rankBy),
  });

  useEffect(() => {
    document.title = group
      ? `Leaderboard — ${group.name} | HabitMap`
      : 'Leaderboard | HabitMap';
  }, [group]);

  return (
    <div className="mx-auto max-w-2xl animate-fade-in">
      {/* Back */}
      <button
        onClick={() => router.push(`/groups/${id}`)}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-hm-text-tertiary transition-colors hover:text-hm-text-secondary"
      >
        <ArrowLeft className="h-4 w-4" />
        {group?.name ?? 'Back to group'}
      </button>

      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <Trophy className="h-5 w-5 text-hm-warning" />
          <h1 className="font-display text-2xl font-bold text-hm-text-primary">
            Leaderboard
          </h1>
        </div>

        {/* Segmented control */}
        <div className="inline-flex rounded-card border border-hm-surface bg-hm-bg-sunken p-1">
          <button
            onClick={() => setRankBy('streaks')}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              rankBy === 'streaks'
                ? 'bg-hm-bg-elevated text-hm-text-primary shadow-hm-sm'
                : 'text-hm-text-tertiary hover:text-hm-text-secondary'
            }`}
          >
            Streaks
          </button>
          <button
            onClick={() => setRankBy('completion')}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              rankBy === 'completion'
                ? 'bg-hm-bg-elevated text-hm-text-primary shadow-hm-sm'
                : 'text-hm-text-tertiary hover:text-hm-text-secondary'
            }`}
          >
            Completion
          </button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : !entries?.length ? (
        <EmptyState
          icon={<Trophy className="h-8 w-8" />}
          title="No data yet"
          description="Members need to complete habits to appear on the leaderboard."
        />
      ) : (
        <div className="overflow-hidden rounded-card border border-hm-surface bg-hm-bg-elevated shadow-hm-sm">
          <LeaderboardTable
            entries={entries}
            currentUserId={user?.id ?? ''}
            rankBy={rankBy}
          />
        </div>
      )}
    </div>
  );
}
