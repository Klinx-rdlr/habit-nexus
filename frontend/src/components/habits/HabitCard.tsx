'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check } from 'lucide-react';
import type { TodayHabitResponse } from '@/lib/api/habits';

interface HabitCardProps {
  habit: TodayHabitResponse;
  onToggle: (habitId: string, completed: boolean) => Promise<void>;
  index?: number;
}

// API uses 0=Mon…6=Sun; JS Date.getDay() uses 0=Sun…6=Sat
function isScheduledToday(habit: TodayHabitResponse): boolean {
  if (habit.frequencyType === 'daily') return true;
  if (!habit.scheduledDays?.length) return false;
  const apiDay = (new Date().getDay() + 6) % 7;
  return habit.scheduledDays.includes(apiDay);
}

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export function HabitCard({ habit, onToggle, index = 0 }: HabitCardProps) {
  const router = useRouter();
  const [completed, setCompleted] = useState(habit.completedToday);
  const [isToggling, setIsToggling] = useState(false);
  const [ripple, setRipple] = useState(false);

  const scheduledToday = isScheduledToday(habit);
  const atRisk = !completed && scheduledToday && habit.currentStreak > 0;
  const streak = habit.currentStreak;
  const todayApiDay = (new Date().getDay() + 6) % 7;

  async function handleToggle(e: React.MouseEvent) {
    e.stopPropagation();
    if (isToggling) return;
    setIsToggling(true);
    const prev = completed;
    setCompleted(!prev);
    if (!prev) {
      setRipple(true);
      setTimeout(() => setRipple(false), 500);
    }
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
      className="animate-slide-up"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div
        className={[
          'group flex cursor-pointer items-center gap-3 rounded-card border p-4',
          'shadow-hm-sm transition-all duration-200',
          'hover:-translate-y-0.5 hover:shadow-hm-md',
          completed
            ? 'border-hm-success-subtle'
            : 'border-hm-surface bg-hm-bg-elevated',
        ].join(' ')}
        style={
          completed
            ? {
                backgroundColor:
                  'color-mix(in srgb, var(--hm-success-subtle) 35%, var(--hm-bg-elevated))',
              }
            : undefined
        }
        onClick={() => router.push(`/habits/${habit.id}`)}
      >
        {/* Check button with ripple */}
        <div className="relative shrink-0">
          <button
            onClick={handleToggle}
            disabled={isToggling}
            className={[
              'relative flex h-9 w-9 items-center justify-center rounded-full border-2',
              'transition-all duration-200 focus:outline-none',
              'focus-visible:ring-2 focus-visible:ring-hm-accent focus-visible:ring-offset-2',
              completed
                ? 'border-hm-success bg-hm-success text-white'
                : 'border-hm-surface hover:border-hm-accent hover:bg-hm-accent-subtle',
              ripple ? 'animate-check-pulse' : '',
            ].join(' ')}
            aria-label={completed ? 'Undo completion' : 'Mark as complete'}
          >
            {completed && <Check className="h-4 w-4" strokeWidth={3} />}
          </button>
          {ripple && (
            <span
              className="pointer-events-none absolute inset-0 rounded-full bg-hm-success animate-check-ripple"
              aria-hidden
            />
          )}
        </div>

        {/* Color dot */}
        <div
          className="h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: habit.color }}
        />

        {/* Name + schedule days */}
        <div className="min-w-0 flex-1">
          <p
            className={[
              'font-medium leading-snug transition-colors duration-200',
              completed
                ? 'text-hm-text-tertiary line-through decoration-hm-text-tertiary'
                : 'text-hm-text-primary',
            ].join(' ')}
          >
            {habit.name}
          </p>
          {habit.frequencyType === 'custom' && habit.scheduledDays?.length ? (
            <div className="mt-1.5 flex gap-0.5">
              {DAY_LABELS.map((label, i) => {
                const scheduled = habit.scheduledDays!.includes(i);
                const isToday = i === todayApiDay;
                return (
                  <span
                    key={i}
                    className={[
                      'flex h-4 w-4 items-center justify-center rounded-full',
                      'text-[9px] font-semibold leading-none',
                      scheduled && isToday
                        ? 'bg-hm-accent text-white'
                        : scheduled
                          ? 'bg-hm-surface text-hm-text-secondary'
                          : 'text-hm-text-tertiary',
                    ].join(' ')}
                  >
                    {label}
                  </span>
                );
              })}
            </div>
          ) : null}
        </div>

        {/* Streak badge */}
        {streak > 0 && (
          <div
            className={[
              'flex items-center gap-1 rounded-full px-2.5 py-1 shrink-0',
              atRisk
                ? 'bg-hm-warning-subtle animate-urgent-pulse'
                : streak >= 30
                  ? 'bg-hm-accent-subtle'
                  : 'bg-hm-bg-sunken',
            ].join(' ')}
          >
            <span
              className={['text-sm leading-none', streak >= 7 ? 'animate-flame-flicker' : ''].join(
                ' ',
              )}
            >
              🔥
            </span>
            <span
              className={[
                'font-mono text-xs font-semibold tabular-nums',
                atRisk
                  ? 'text-hm-warning'
                  : streak >= 30
                    ? 'text-hm-accent'
                    : 'text-hm-text-secondary',
              ].join(' ')}
            >
              {streak}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
