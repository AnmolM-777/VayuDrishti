'use client';

import { formatDistanceToNow } from 'date-fns';
import {
  MapPin,
  Users,
  Shield,
  AlertTriangle,
  Zap,
  Info,
  ExternalLink,
} from 'lucide-react';
import type { PollutionAlert } from '@/types/alert';
import { SOURCE_TYPE_CONFIG } from '@/types/report';
import { cn } from '@/lib/utils';

interface AlertCardProps {
  alert: PollutionAlert;
}

const PRIORITY_CONFIG = {
  green: {
    label: 'Low',
    color: '#22c55e',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/25',
    Icon: Info,
  },
  yellow: {
    label: 'Moderate',
    color: '#eab308',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/25',
    Icon: Info,
  },
  orange: {
    label: 'High',
    color: '#f97316',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/25',
    Icon: AlertTriangle,
  },
  red: {
    label: 'Severe',
    color: '#ef4444',
    bg: 'bg-red-500/10',
    border: 'border-red-500/25',
    Icon: Zap,
  },
  purple: {
    label: 'Emergency',
    color: '#8b5cf6',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/25',
    Icon: Shield,
  },
} as const;

const STATUS_BADGE: Record<string, string> = {
  active: 'bg-blue-500/10 text-blue-400 border border-blue-500/25',
  dispatched: 'bg-amber-500/10 text-amber-400 border border-amber-500/25',
  resolved: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25',
  acknowledged: 'bg-slate-500/10 text-slate-400 border border-slate-500/25',
};

export function AlertCard({ alert }: AlertCardProps) {
  const cfg = PRIORITY_CONFIG[alert.priority];
  const Icon = cfg.Icon;
  const sourceCfg = SOURCE_TYPE_CONFIG[alert.sourceType];

  return (
    <div
      className={cn(
        'bg-card rounded-xl border p-4 transition-all duration-200 hover:shadow-md',
        cfg.border,
        alert.status === 'resolved' ? 'opacity-60' : '',
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        {/* Priority icon */}
        <div className={cn('mt-0.5 shrink-0 rounded-lg p-2', cfg.bg)}>
          <Icon className="size-4" style={{ color: cfg.color }} />
        </div>

        <div className="min-w-0 flex-1">
          {/* Title + status */}
          <div className="mb-1 flex items-start gap-2">
            <h3 className="flex-1 text-sm leading-snug font-semibold">
              {alert.title}
            </h3>
            <span
              className={cn(
                'shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold capitalize',
                STATUS_BADGE[alert.status] ?? '',
              )}
            >
              {alert.status}
            </span>
          </div>

          {/* Priority badge + source */}
          <div className="mb-2 flex items-center gap-2">
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-bold"
              style={{ color: cfg.color, backgroundColor: `${cfg.color}18` }}
            >
              {cfg.label} Priority
            </span>
            {sourceCfg && (
              <span className="text-muted-foreground text-[10px]">
                {sourceCfg.emoji} {sourceCfg.label}
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-muted-foreground mb-3 text-xs leading-relaxed">
            {alert.description}
          </p>

          {/* Location + AQI */}
          <div className="text-muted-foreground mb-3 flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-1">
              <MapPin className="size-3 shrink-0" />
              <span className="max-w-48 truncate">
                {alert.location.address}
              </span>
            </div>
            {alert.estimatedAqi && (
              <div className="flex items-center gap-1">
                <span className="font-medium" style={{ color: cfg.color }}>
                  AQI ~{alert.estimatedAqi}
                </span>
              </div>
            )}
            {alert.affectedPopulation && (
              <div className="flex items-center gap-1">
                <Users className="size-3" />
                <span>
                  {alert.affectedPopulation.toLocaleString()} affected
                </span>
              </div>
            )}
          </div>

          {/* Recommended action */}
          {alert.recommendedAction && (
            <div className={cn('rounded-lg p-2 text-xs', cfg.bg)}>
              <span className="font-medium" style={{ color: cfg.color }}>
                Action:{' '}
              </span>
              <span className="text-muted-foreground">
                {alert.recommendedAction}
              </span>
            </div>
          )}

          {/* Nearby schools warning */}
          {alert.nearbySchools && alert.nearbySchools.length > 0 && (
            <div className="mt-2 flex items-center gap-1 text-xs text-amber-400">
              <AlertTriangle className="size-3" />
              Nearby: {alert.nearbySchools.join(', ')}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="border-border mt-3 flex items-center justify-between border-t pt-3">
        <span className="text-muted-foreground text-[10px]">
          {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}
          {alert.resolvedAt &&
            ` · resolved ${formatDistanceToNow(new Date(alert.resolvedAt), { addSuffix: true })}`}
        </span>
        {alert.hotspotId && (
          <a
            href={`/hotspots`}
            className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-[10px] transition-colors"
          >
            View hotspot <ExternalLink className="size-3" />
          </a>
        )}
      </div>
    </div>
  );
}
