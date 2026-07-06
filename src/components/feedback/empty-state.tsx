'use client';

import {
  LayoutDashboard,
  Map,
  FileText,
  Flame,
  TrendingUp,
  Trophy,
  Bell,
  ClipboardCheck,
  Truck,
  Radio,
  BarChart3,
  LogIn,
  UserPlus,
  Package,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard,
  Map,
  FileText,
  Flame,
  TrendingUp,
  Trophy,
  Bell,
  ClipboardCheck,
  Truck,
  Radio,
  BarChart3,
  LogIn,
  UserPlus,
  Package,
};

interface EmptyStateProps {
  readonly iconName: string;
  readonly title: string;
  readonly description: string;
  readonly className?: string;
}

export function EmptyState({
  iconName,
  title,
  description,
  className,
}: EmptyStateProps) {
  const Icon = ICON_MAP[iconName] ?? Package;

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center sm:p-12',
        className,
      )}
    >
      <div className="bg-muted flex size-12 items-center justify-center rounded-full sm:size-14">
        <Icon className="text-muted-foreground size-6 sm:size-7" />
      </div>
      <h3 className="mt-4 text-base font-semibold sm:text-lg">{title}</h3>
      <p className="text-muted-foreground mt-1.5 max-w-sm text-sm">
        {description}
      </p>
    </div>
  );
}
