interface SkeletonProps {
  className?: string;
  circle?: boolean;
}

export function Skeleton({ className = '', circle }: SkeletonProps) {
  return (
    <div
      className={`
        animate-pulse bg-surface-200 dark:bg-surface-700
        ${circle ? 'rounded-full' : 'rounded-lg'}
        ${className}
      `}
    />
  );
}
