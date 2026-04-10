'use client';

import { useEffect, useRef, useState } from 'react';
import { Flame } from 'lucide-react';

interface StreakBadgeProps {
  streak: number;
  className?: string;
}

function getStreakStyle(streak: number): string {
  if (streak >= 60) return 'text-hm-warning bg-hm-warning-subtle';
  if (streak >= 7)  return 'text-hm-accent bg-hm-accent-subtle';
  return 'text-hm-text-tertiary bg-hm-bg-sunken';
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
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums ${getStreakStyle(displayCount)} ${className}`}
    >
      <Flame className={`h-3 w-3 ${displayCount >= 7 ? 'animate-flame-flicker' : ''}`} />
      {displayCount}
    </span>
  );
}
