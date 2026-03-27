'use client';

import { useState } from 'react';
import { Trophy, Flame, ChevronDown, ChevronUp } from 'lucide-react';
import type { LeaderboardEntry } from '@/lib/api/groups';

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  currentUserId: string;
  rankBy: 'streaks' | 'completion';
}

function getRankStyle(rank: number): string {
  if (rank === 1)
    return 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400';
  if (rank === 2)
    return 'bg-gray-50 text-gray-600 dark:bg-gray-900 dark:text-gray-400';
  if (rank === 3)
    return 'bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-400';
  return 'bg-surface-100 text-surface-500 dark:bg-surface-800 dark:text-surface-400';
}

function getRankIcon(rank: number) {
  if (rank <= 3) return <Trophy className="h-3.5 w-3.5" />;
  return null;
}

export function LeaderboardTable({
  entries,
  currentUserId,
  rankBy,
}: LeaderboardTableProps) {
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  return (
    <div className="divide-y divide-surface-100 dark:divide-surface-800">
      {entries.map((entry) => {
        const isCurrentUser = entry.userId === currentUserId;
        const isExpanded = expandedUser === entry.userId;

        return (
          <div key={entry.userId}>
            <button
              onClick={() =>
                setExpandedUser(isExpanded ? null : entry.userId)
              }
              className={`flex w-full items-center gap-4 px-4 py-3 text-left transition-colors hover:bg-surface-50 dark:hover:bg-surface-800/50 ${
                isCurrentUser
                  ? 'bg-brand-50/50 dark:bg-brand-950/20'
                  : ''
              }`}
            >
              {/* Rank badge */}
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${getRankStyle(entry.rank)}`}
              >
                {getRankIcon(entry.rank) ?? entry.rank}
              </div>

              {/* User info */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-medium text-surface-900 dark:text-surface-100">
                    {entry.username}
                  </span>
                  {isCurrentUser && (
                    <span className="text-2xs text-surface-400">(you)</span>
                  )}
                </div>
                <p className="text-xs text-surface-500">
                  {entry.habitCount} active{' '}
                  {entry.habitCount === 1 ? 'habit' : 'habits'}
                </p>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-3 shrink-0">
                {rankBy === 'streaks' ? (
                  <div className="text-right">
                    <p className="text-sm font-bold text-surface-900 dark:text-surface-100">
                      {entry.totalStreakDays ?? 0}
                    </p>
                    <p className="text-2xs text-surface-400">streak days</p>
                  </div>
                ) : (
                  <div className="text-right">
                    <p className="text-sm font-bold text-surface-900 dark:text-surface-100">
                      {entry.completionRate ?? 0}%
                    </p>
                    <p className="text-2xs text-surface-400">completion</p>
                  </div>
                )}
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 text-surface-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-surface-400" />
                )}
              </div>
            </button>

            {/* Expanded detail — per-habit breakdown */}
            {isExpanded && (
              <div className="border-t border-surface-100 bg-surface-50/50 px-4 py-3 dark:border-surface-800 dark:bg-surface-800/30">
                {entry.habits.length === 0 ? (
                  <p className="ml-12 text-xs text-surface-400">
                    No habits yet
                  </p>
                ) : (
                  <div className="ml-12 space-y-2">
                    {entry.habits.map((habit) => (
                      <div
                        key={habit.id}
                        className="flex items-center gap-2 text-xs"
                      >
                        <div
                          className="h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: habit.color }}
                        />
                        <span className="min-w-0 flex-1 truncate text-surface-700 dark:text-surface-300">
                          {habit.name}
                        </span>
                        <div className="flex items-center gap-1 shrink-0 text-surface-500">
                          <Flame className="h-3 w-3" />
                          <span>{habit.currentStreak}d</span>
                        </div>
                        <span className="shrink-0 text-surface-400">
                          best {habit.longestStreak}d
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
