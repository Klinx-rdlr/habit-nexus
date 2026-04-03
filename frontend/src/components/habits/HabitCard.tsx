'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check } from 'lucide-react';
import { StreakBadge } from './StreakBadge';
import type { TodayHabitResponse } from '@/lib/api/habits';

interface HabitCardProps {
  habit: TodayHabitResponse;
  onToggle: (habitId: string, completed: boolean) => Promise<void>;
}

export function HabitCard({ habit, onToggle }: HabitCardProps) {
  const router = useRouter();
  const [completed, setCompleted] = useState(habit.completedToday);
  const [isToggling, setIsToggling] = useState(false);
  const [justToggled, setJustToggled] = useState(false);

  async function handleToggle() {
    if (isToggling) return;
    setIsToggling(true);
    const prev = completed;
    setCompleted(!prev);
    setJustToggled(true);
    setTimeout(() => setJustToggled(false), 300);

    try {
      await onToggle(habit.id, !prev);
    } catch {
      setCompleted(prev);
    } finally {
      setIsToggling(false);
    }
  }

  return (
    <div
      onClick={() => router.push(`/habits/${habit.id}`)}
      className={`
        flex cursor-pointer items-center gap-4 rounded-xl border bg-surface-0 p-4
        transition-all duration-200
        hover:shadow-card hover:-translate-y-0.5
        dark:bg-surface-900 dark:hover:bg-surface-800
        ${completed ? 'border-brand-200 dark:border-brand-900' : 'border-surface-200 dark:border-surface-800'}
      `}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleToggle();
        }}
        disabled={isToggling}
        className={`
          flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200
          ${justToggled ? 'animate-check-pulse' : ''}
          ${
            completed
              ? 'border-brand-500 bg-brand-500 text-white'
              : 'border-surface-300 hover:border-brand-400 dark:border-surface-600'
          }
        `}
        aria-label={completed ? 'Undo completion' : 'Mark as complete'}
      >
        {completed && <Check className="h-4 w-4" strokeWidth={3} />}
      </button>

      <div
        className="h-3 w-3 shrink-0 rounded-full"
        style={{ backgroundColor: habit.color }}
      />

      <div className="min-w-0 flex-1">
        <p
          className={`font-medium transition-colors duration-200 ${completed ? 'text-surface-400 line-through dark:text-surface-500' : 'text-surface-900 dark:text-surface-100'}`}
        >
          {habit.name}
        </p>
      </div>

      <StreakBadge streak={habit.currentStreak} />
    </div>
  );
}
