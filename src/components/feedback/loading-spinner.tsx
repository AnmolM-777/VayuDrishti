import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  readonly className?: string;
  readonly size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'size-4 border-2',
  md: 'size-8 border-2',
  lg: 'size-12 border-3',
} as const;

export function LoadingSpinner({
  className,
  size = 'md',
}: LoadingSpinnerProps) {
  return (
    <div
      className={cn(
        'border-muted-foreground/20 border-t-primary animate-spin rounded-full',
        sizeClasses[size],
        className,
      )}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}
