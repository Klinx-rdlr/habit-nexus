'use client';

import { Crown, Flame, ListTodo, Trash2 } from 'lucide-react';
import type { MemberResponse } from '@/lib/api/groups';

interface MemberCardProps {
  member: MemberResponse;
  isCurrentUser: boolean;
  isAdmin: boolean;
  onRemove?: () => void;
}

export function MemberCard({
  member,
  isCurrentUser,
  isAdmin,
  onRemove,
}: MemberCardProps) {
  return (
    <div
      className={`rounded-xl border p-4 transition-colors ${
        isCurrentUser
          ? 'border-brand-200 bg-brand-50/50 dark:border-brand-900 dark:bg-brand-950/30'
          : 'border-surface-200 bg-surface-0 dark:border-surface-800 dark:bg-surface-900'
      }`}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-200 text-sm font-semibold text-surface-600 dark:bg-surface-700 dark:text-surface-300">
            {member.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-medium text-surface-900 dark:text-surface-100">
                {member.username}
              </span>
              {isCurrentUser && (
                <span className="text-2xs text-surface-400">(you)</span>
              )}
            </div>
            {member.role === 'admin' && (
              <span className="inline-flex items-center gap-0.5 text-2xs font-medium text-amber-600 dark:text-amber-400">
                <Crown className="h-3 w-3" />
                Admin
              </span>
            )}
          </div>
        </div>

        {isAdmin && !isCurrentUser && onRemove && (
          <button
            onClick={onRemove}
            className="rounded-lg p-1.5 text-surface-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 dark:hover:text-red-400"
            title="Remove member"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex gap-4 text-xs text-surface-500">
        <div className="flex items-center gap-1">
          <ListTodo className="h-3.5 w-3.5" />
          <span>{member.activeHabitCount ?? 0} habits</span>
        </div>
        <div className="flex items-center gap-1">
          <Flame className="h-3.5 w-3.5" />
          <span>{member.totalStreakDays ?? 0} streak days</span>
        </div>
      </div>
    </div>
  );
}
