'use client';

import { formatDistanceToNow } from 'date-fns';
import { AlertTriangle, Shield, Info, Zap, MapPin } from 'lucide-react';
import type { PollutionAlert } from '@/types/alert';
import { cn } from '@/lib/utils';

interface RecentAlertsProps {
  alerts: PollutionAlert[];
}

const PRIORITY_CONFIG = {
  green: {
    label: 'Low',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    Icon: Info,
  },
  yellow: {
    label: 'Moderate',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    Icon: Info,
  },
  orange: {
    label: 'High',
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/20',
    Icon: AlertTriangle,
  },
  red: {
    label: 'Severe',
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    Icon: Zap,
  },
  purple: {
    label: 'Emergency',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
    Icon: Shield,
  },
} as const;

const STATUS_BADGE = {
  active: 'bg-blue-500/10 text-blue-400',
  dispatched: 'bg-amber-500/10 text-amber-400',
  resolved: 'bg-emerald-500/10 text-emerald-400',
  acknowledged: 'bg-slate-500/10 text-slate-400',
} as const;

export function RecentAlerts({ alerts }: RecentAlertsProps) {
  const recent = alerts.slice(0, 5);

  return (
    <div className="bg-card border-border rounded-xl border p-4 sm:p-5">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold">Recent Alerts</h3>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Live updates from monitoring network
          </p>
        </div>
        {alerts.some(
          (a) => a.status === 'active' || a.status === 'dispatched',
        ) && (
          <span className="flex items-center gap-1.5 text-xs text-red-400">
            <span className="size-2 animate-pulse rounded-full bg-red-400" />
            Live
          </span>
        )}
      </div>

      <div className="space-y-2">
        {recent.length === 0 ? (
          <p className="text-muted-foreground py-4 text-center text-sm">
            No recent alerts
          </p>
        ) : (
          recent.map((alert) => {
            const priorityCfg = PRIORITY_CONFIG[alert.priority];
            const Icon = priorityCfg.Icon;
            return (
              <div
                key={alert.id}
                className={cn(
                  'hover:bg-accent/50 flex items-start gap-3 rounded-lg border p-3 transition-colors',
                  priorityCfg.border,
                  alert.status === 'resolved' ? 'opacity-60' : '',
                )}
              >
                {/* Priority icon */}
                <div
                  className={cn(
                    'mt-0.5 shrink-0 rounded-md p-1.5',
                    priorityCfg.bg,
                  )}
                >
                  <Icon className={cn('size-3.5', priorityCfg.color)} />
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="truncate text-sm leading-snug font-medium">
                      {alert.title}
                    </p>
                    <span
                      className={cn(
                        'shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium capitalize',
                        STATUS_BADGE[
                          alert.status as keyof typeof STATUS_BADGE
                        ] ?? 'bg-secondary text-muted-foreground',
                      )}
                    >
                      {alert.status}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <MapPin className="text-muted-foreground size-3 shrink-0" />
                    <span className="text-muted-foreground truncate text-xs">
                      {alert.location.address}
                    </span>
                  </div>
                  <p className="text-muted-foreground mt-0.5 text-[10px]">
                    {formatDistanceToNow(new Date(alert.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {alerts.length > 5 && (
        <p className="text-muted-foreground border-border mt-3 border-t pt-3 text-center text-xs">
          +{alerts.length - 5} more alerts
        </p>
      )}
    </div>
  );
}
