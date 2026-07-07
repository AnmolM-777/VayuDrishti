'use client';

import { formatDistanceToNow } from 'date-fns';
import { AlertTriangle, Shield, Info, Zap, MapPin } from 'lucide-react';
import type { PollutionAlert } from '@/types/alert';
import { cn } from '@/lib/utils';

interface RecentAlertsProps {
  alerts: PollutionAlert[];
}

const PRIORITY_CONFIG = {
  green: { label: 'Low', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', Icon: Info },
  yellow: { label: 'Moderate', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', Icon: Info },
  orange: { label: 'High', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', Icon: AlertTriangle },
  red: { label: 'Severe', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', Icon: Zap },
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
    <div className="bg-card border border-border rounded-xl p-4 sm:p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-sm">Recent Alerts</h3>
          <p className="text-muted-foreground text-xs mt-0.5">Live updates from monitoring network</p>
        </div>
        {alerts.some((a) => a.status === 'active' || a.status === 'dispatched') && (
          <span className="flex items-center gap-1.5 text-xs text-red-400">
            <span className="size-2 rounded-full bg-red-400 animate-pulse" />
            Live
          </span>
        )}
      </div>

      <div className="space-y-2">
        {recent.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-4">No recent alerts</p>
        ) : (
          recent.map((alert) => {
            const priorityCfg = PRIORITY_CONFIG[alert.priority];
            const Icon = priorityCfg.Icon;
            return (
              <div
                key={alert.id}
                className={cn(
                  'flex items-start gap-3 p-3 rounded-lg border transition-colors hover:bg-accent/50',
                  priorityCfg.border,
                  alert.status === 'resolved' ? 'opacity-60' : '',
                )}
              >
                {/* Priority icon */}
                <div className={cn('p-1.5 rounded-md mt-0.5 shrink-0', priorityCfg.bg)}>
                  <Icon className={cn('size-3.5', priorityCfg.color)} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium truncate leading-snug">{alert.title}</p>
                    <span
                      className={cn(
                        'shrink-0 text-[10px] px-1.5 py-0.5 rounded-full font-medium capitalize',
                        STATUS_BADGE[alert.status as keyof typeof STATUS_BADGE] ?? 'bg-secondary text-muted-foreground',
                      )}
                    >
                      {alert.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <MapPin className="size-3 text-muted-foreground shrink-0" />
                    <span className="text-xs text-muted-foreground truncate">{alert.location.address}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {alerts.length > 5 && (
        <p className="text-xs text-muted-foreground text-center mt-3 pt-3 border-t border-border">
          +{alerts.length - 5} more alerts
        </p>
      )}
    </div>
  );
}
