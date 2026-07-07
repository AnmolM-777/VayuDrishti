'use client';

import { formatDistanceToNow } from 'date-fns';
import { MapPin, Users, Shield, AlertTriangle, Zap, Info, ExternalLink } from 'lucide-react';
import type { PollutionAlert } from '@/types/alert';
import { SOURCE_TYPE_CONFIG } from '@/types/report';
import { cn } from '@/lib/utils';

interface AlertCardProps {
  alert: PollutionAlert;
}

const PRIORITY_CONFIG = {
  green:  { label: 'Low',       color: '#22c55e', bg: 'bg-emerald-500/10', border: 'border-emerald-500/25', Icon: Info },
  yellow: { label: 'Moderate',  color: '#eab308', bg: 'bg-amber-500/10',   border: 'border-amber-500/25',   Icon: Info },
  orange: { label: 'High',      color: '#f97316', bg: 'bg-orange-500/10',  border: 'border-orange-500/25',  Icon: AlertTriangle },
  red:    { label: 'Severe',    color: '#ef4444', bg: 'bg-red-500/10',     border: 'border-red-500/25',     Icon: Zap },
  purple: { label: 'Emergency', color: '#8b5cf6', bg: 'bg-purple-500/10',  border: 'border-purple-500/25',  Icon: Shield },
} as const;

const STATUS_BADGE: Record<string, string> = {
  active:       'bg-blue-500/10 text-blue-400 border border-blue-500/25',
  dispatched:   'bg-amber-500/10 text-amber-400 border border-amber-500/25',
  resolved:     'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25',
  acknowledged: 'bg-slate-500/10 text-slate-400 border border-slate-500/25',
};

export function AlertCard({ alert }: AlertCardProps) {
  const cfg = PRIORITY_CONFIG[alert.priority];
  const Icon = cfg.Icon;
  const sourceCfg = SOURCE_TYPE_CONFIG[alert.sourceType];

  return (
    <div
      className={cn(
        'bg-card border rounded-xl p-4 transition-all duration-200 hover:shadow-md',
        cfg.border,
        alert.status === 'resolved' ? 'opacity-60' : '',
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        {/* Priority icon */}
        <div className={cn('p-2 rounded-lg mt-0.5 shrink-0', cfg.bg)}>
          <Icon className="size-4" style={{ color: cfg.color }} />
        </div>

        <div className="flex-1 min-w-0">
          {/* Title + status */}
          <div className="flex items-start gap-2 mb-1">
            <h3 className="text-sm font-semibold leading-snug flex-1">{alert.title}</h3>
            <span className={cn('shrink-0 text-[10px] px-1.5 py-0.5 rounded-full font-semibold capitalize', STATUS_BADGE[alert.status] ?? '')}>
              {alert.status}
            </span>
          </div>

          {/* Priority badge + source */}
          <div className="flex items-center gap-2 mb-2">
            <span
              className="text-[10px] px-2 py-0.5 rounded-full font-bold"
              style={{ color: cfg.color, backgroundColor: `${cfg.color}18` }}
            >
              {cfg.label} Priority
            </span>
            {sourceCfg && (
              <span className="text-[10px] text-muted-foreground">
                {sourceCfg.emoji} {sourceCfg.label}
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-xs text-muted-foreground leading-relaxed mb-3">{alert.description}</p>

          {/* Location + AQI */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-3">
            <div className="flex items-center gap-1">
              <MapPin className="size-3 shrink-0" />
              <span className="truncate max-w-48">{alert.location.address}</span>
            </div>
            {alert.estimatedAqi && (
              <div className="flex items-center gap-1">
                <span className="font-medium" style={{ color: cfg.color }}>AQI ~{alert.estimatedAqi}</span>
              </div>
            )}
            {alert.affectedPopulation && (
              <div className="flex items-center gap-1">
                <Users className="size-3" />
                <span>{alert.affectedPopulation.toLocaleString()} affected</span>
              </div>
            )}
          </div>

          {/* Recommended action */}
          {alert.recommendedAction && (
            <div className={cn('text-xs p-2 rounded-lg', cfg.bg)}>
              <span className="font-medium" style={{ color: cfg.color }}>Action: </span>
              <span className="text-muted-foreground">{alert.recommendedAction}</span>
            </div>
          )}

          {/* Nearby schools warning */}
          {alert.nearbySchools && alert.nearbySchools.length > 0 && (
            <div className="mt-2 text-xs text-amber-400 flex items-center gap-1">
              <AlertTriangle className="size-3" />
              Nearby: {alert.nearbySchools.join(', ')}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
        <span className="text-[10px] text-muted-foreground">
          {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}
          {alert.resolvedAt && ` · resolved ${formatDistanceToNow(new Date(alert.resolvedAt), { addSuffix: true })}`}
        </span>
        {alert.hotspotId && (
          <a
            href={`/hotspots`}
            className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
          >
            View hotspot <ExternalLink className="size-3" />
          </a>
        )}
      </div>
    </div>
  );
}
