interface SkeletonProps {
  className?: string;
  circle?: boolean;
}

export function Skeleton({ className = '', circle }: SkeletonProps) {
  return (
    <div
      className={`
        animate-pulse bg-hm-surface
        ${circle ? 'rounded-full' : 'rounded-card'}
        ${className}
      `}
    />
  );
}
