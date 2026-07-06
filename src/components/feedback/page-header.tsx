import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  readonly title: string;
  readonly description?: string;
  readonly children?: ReactNode;
  readonly className?: string;
}

export function PageHeader({
  title,
  description,
  children,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between',
        className,
      )}
    >
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {title}
        </h1>
        {description ? (
          <p className="text-muted-foreground text-sm sm:text-base">
            {description}
          </p>
        ) : null}
      </div>
      {children ? (
        <div className="mt-4 flex shrink-0 items-center gap-2 sm:mt-0">
          {children}
        </div>
      ) : null}
    </div>
  );
}
