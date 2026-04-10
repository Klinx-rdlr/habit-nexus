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
      className={`rounded-card border p-4 transition-colors ${
        isCurrentUser
          ? 'border-hm-accent-subtle bg-hm-accent-subtle'
          : 'border-hm-surface bg-hm-bg-elevated'
      }`}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {/* Avatar initial */}
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-hm-bg-sunken text-sm font-semibold text-hm-text-secondary">
            {member.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-medium text-hm-text-primary">
                {member.username}
              </span>
              {isCurrentUser && (
                <span className="text-2xs text-hm-text-tertiary">(you)</span>
              )}
            </div>
            {member.role === 'admin' && (
              <span className="inline-flex items-center gap-0.5 text-2xs font-medium text-hm-warning">
                <Crown className="h-3 w-3" />
                Admin
              </span>
            )}
          </div>
        </div>

        {isAdmin && !isCurrentUser && onRemove && (
          <button
            onClick={onRemove}
            className="rounded-lg p-1.5 text-hm-text-tertiary transition-colors hover:bg-hm-danger-subtle hover:text-hm-danger"
            title="Remove member"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex gap-4 text-xs text-hm-text-tertiary">
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
