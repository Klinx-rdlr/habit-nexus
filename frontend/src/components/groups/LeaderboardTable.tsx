'use client';

import { useState } from 'react';
import { Trophy, Flame, ChevronDown, ChevronUp } from 'lucide-react';
import type { LeaderboardEntry } from '@/lib/api/groups';

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  currentUserId: string;
  rankBy: 'streaks' | 'completion';
}

function getRankBadgeStyle(rank: number): string {
  if (rank === 1) return 'bg-hm-warning-subtle text-hm-warning';
  if (rank === 2) return 'bg-hm-surface text-hm-text-secondary';
  if (rank === 3) return 'bg-hm-accent-subtle text-hm-accent';
  return 'bg-hm-bg-sunken text-hm-text-tertiary';
}

function getRowBorderStyle(rank: number): string {
  if (rank === 1) return 'border-l-hm-warning';
  if (rank === 2) return 'border-l-hm-surface';
  if (rank === 3) return 'border-l-hm-accent';
  return 'border-l-transparent';
}

export function LeaderboardTable({
  entries,
  currentUserId,
  rankBy,
}: LeaderboardTableProps) {
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  return (
    <div className="divide-y divide-hm-surface">
      {entries.map((entry) => {
        const isCurrentUser = entry.userId === currentUserId;
        const isExpanded = expandedUser === entry.userId;
        const isTop3 = entry.rank <= 3;

        return (
          <div key={entry.userId}>
            <button
              onClick={() => setExpandedUser(isExpanded ? null : entry.userId)}
              className={`
                flex w-full items-center gap-4 border-l-4 px-4 text-left transition-colors
                ${isTop3 ? 'py-4' : 'py-3'}
                ${getRowBorderStyle(entry.rank)}
                ${isCurrentUser
                  ? 'bg-hm-accent-subtle hover:bg-hm-accent-subtle'
                  : 'hover:bg-hm-bg-sunken'
                }
              `}
            >
              {/* Rank badge */}
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${getRankBadgeStyle(entry.rank)}`}
              >
                {isTop3 ? <Trophy className="h-3.5 w-3.5" /> : entry.rank}
              </div>

              {/* User info */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-medium text-hm-text-primary">
                    {entry.username}
                  </span>
                  {isCurrentUser && (
                    <span className="text-2xs text-hm-text-tertiary">(you)</span>
                  )}
                </div>
                <p className="text-xs text-hm-text-tertiary">
                  {entry.habitCount} active{' '}
                  {entry.habitCount === 1 ? 'habit' : 'habits'}
                </p>
              </div>

              {/* Primary stat */}
              <div className="flex shrink-0 items-center gap-3">
                <div className="text-right tabular-nums">
                  <p className="font-mono text-sm font-bold text-hm-text-primary">
                    {rankBy === 'streaks'
                      ? entry.totalStreakDays ?? 0
                      : `${entry.completionRate ?? 0}%`}
                  </p>
                  <p className="text-2xs text-hm-text-tertiary">
                    {rankBy === 'streaks' ? 'streak days' : 'completion'}
                  </p>
                </div>
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 text-hm-text-tertiary" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-hm-text-tertiary" />
                )}
              </div>
            </button>

            {/* Per-habit breakdown */}
            {isExpanded && (
              <div className="border-t border-hm-surface bg-hm-bg-sunken px-4 py-3">
                {entry.habits.length === 0 ? (
                  <p className="ml-12 text-xs text-hm-text-tertiary">
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
                        <span className="min-w-0 flex-1 truncate text-hm-text-secondary">
                          {habit.name}
                        </span>
                        <div className="flex shrink-0 items-center gap-1 tabular-nums text-hm-text-secondary">
                          <Flame className="h-3 w-3 text-hm-accent" />
                          <span className="font-mono">{habit.currentStreak}d</span>
                        </div>
                        <span className="shrink-0 tabular-nums text-hm-text-tertiary">
                          best{' '}
                          <span className="font-mono">{habit.longestStreak}d</span>
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
