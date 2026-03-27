'use client';

import { useState } from 'react';
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

  return (
    <div className="mx-auto max-w-2xl">
      {/* Back */}
      <button
        onClick={() => router.push(`/groups/${id}`)}
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-surface-500 hover:text-surface-700 dark:hover:text-surface-300"
      >
        <ArrowLeft className="h-4 w-4" />
        {group?.name ?? 'Back to group'}
      </button>

      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-amber-500" />
          <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
            Leaderboard
          </h1>
        </div>

        {/* Toggle */}
        <div className="inline-flex rounded-lg border border-surface-200 bg-surface-50 p-1 dark:border-surface-700 dark:bg-surface-800">
          <button
            onClick={() => setRankBy('streaks')}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              rankBy === 'streaks'
                ? 'bg-surface-0 text-surface-900 shadow-sm dark:bg-surface-700 dark:text-surface-100'
                : 'text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'
            }`}
          >
            By Streaks
          </button>
          <button
            onClick={() => setRankBy('completion')}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              rankBy === 'completion'
                ? 'bg-surface-0 text-surface-900 shadow-sm dark:bg-surface-700 dark:text-surface-100'
                : 'text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'
            }`}
          >
            By Completion Rate
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
          icon={<Trophy className="h-12 w-12" />}
          title="No data yet"
          description="Members need to start completing habits to appear on the leaderboard."
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-surface-200 bg-surface-0 dark:border-surface-800 dark:bg-surface-900">
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
