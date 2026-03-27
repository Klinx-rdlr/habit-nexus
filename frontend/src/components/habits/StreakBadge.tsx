import { Flame } from 'lucide-react';

interface StreakBadgeProps {
  streak: number;
  className?: string;
}

function getStreakColor(streak: number): string {
  if (streak >= 100) return 'text-amber-500 bg-amber-50 dark:bg-amber-950';
  if (streak >= 30) return 'text-orange-500 bg-orange-50 dark:bg-orange-950';
  if (streak >= 7) return 'text-red-500 bg-red-50 dark:bg-red-950';
  return 'text-surface-400 bg-surface-100 dark:bg-surface-800';
}

export function StreakBadge({ streak, className = '' }: StreakBadgeProps) {
  if (streak === 0) return null;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${getStreakColor(streak)} ${className}`}
    >
      <Flame className="h-3 w-3" />
      {streak}
    </span>
  );
}
