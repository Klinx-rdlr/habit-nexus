'use client';

import { useEffect, useRef, useState } from 'react';
import { Flame } from 'lucide-react';

interface StreakBadgeProps {
  streak: number;
  className?: string;
}

function getStreakColor(streak: number): string {
  if (streak >= 100) return 'text-amber-500 bg-amber-50 dark:bg-amber-950 dark:text-amber-400';
  if (streak >= 30) return 'text-orange-500 bg-orange-50 dark:bg-orange-950 dark:text-orange-400';
  if (streak >= 7) return 'text-red-500 bg-red-50 dark:bg-red-950 dark:text-red-400';
  return 'text-surface-400 bg-surface-100 dark:bg-surface-800 dark:text-surface-400';
}

export function StreakBadge({ streak, className = '' }: StreakBadgeProps) {
  const [displayCount, setDisplayCount] = useState(streak);
  const prevStreak = useRef(streak);

  useEffect(() => {
    if (streak === prevStreak.current) return;
    const from = prevStreak.current;
    const to = streak;
    prevStreak.current = streak;

    if (to === 0 || Math.abs(to - from) > 10) {
      setDisplayCount(to);
      return;
    }

    const step = to > from ? 1 : -1;
    let current = from;
    const interval = setInterval(() => {
      current += step;
      setDisplayCount(current);
      if (current === to) clearInterval(interval);
    }, 50);

    return () => clearInterval(interval);
  }, [streak]);

  if (streak === 0 && displayCount === 0) return null;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums ${getStreakColor(displayCount)} ${className}`}
    >
      <Flame className="h-3 w-3" />
      {displayCount}
    </span>
  );
}
