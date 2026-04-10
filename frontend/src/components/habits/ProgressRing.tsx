interface ProgressRingProps {
  completed: number;
  total: number;
  size?: number;
  strokeWidth?: number;
}

export function ProgressRing({
  completed,
  total,
  size = 56,
  strokeWidth = 4,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = total > 0 ? completed / total : 0;
  const offset = circumference - progress * circumference;
  const allDone = total > 0 && completed === total;

  return (
    <div className="relative inline-flex shrink-0 items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--hm-surface)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={allDone ? 'var(--hm-success)' : 'var(--hm-accent)'}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center leading-none gap-0.5">
        <span
          className="font-mono text-sm font-bold tabular-nums"
          style={{ color: allDone ? 'var(--hm-success)' : 'var(--hm-accent)' }}
        >
          {completed}
        </span>
        <span
          className="font-mono text-[10px] tabular-nums"
          style={{ color: 'var(--hm-text-tertiary)' }}
        >
          /{total}
        </span>
      </div>
    </div>
  );
}
