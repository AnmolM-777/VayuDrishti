'use client';

import { formatDistanceToNow } from 'date-fns';
import { MapPin, Users, Radio } from 'lucide-react';
import type { PollutionHotspot } from '@/types/hotspot';
import {
  HOTSPOT_SEVERITY_CONFIG,
  HOTSPOT_STATUS_CONFIG,
} from '@/types/hotspot';
import { SOURCE_TYPE_CONFIG } from '@/types/report';
import { cn } from '@/lib/utils';

interface HotspotCardProps {
  hotspot: PollutionHotspot;
}

export function HotspotCard({ hotspot }: HotspotCardProps) {
  const severityCfg = HOTSPOT_SEVERITY_CONFIG[hotspot.severity];
  const statusCfg = HOTSPOT_STATUS_CONFIG[hotspot.status];
  const sourceCfg = SOURCE_TYPE_CONFIG[hotspot.sourceType];

  return (
    <div
      className={cn(
        'bg-card group cursor-pointer rounded-xl border p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md',
        hotspot.severity === 'critical'
          ? 'border-red-500/30'
          : hotspot.severity === 'high'
            ? 'border-orange-500/30'
            : hotspot.severity === 'medium'
              ? 'border-amber-500/30'
              : 'border-border',
      )}
    >
      {/* Header row */}
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          {/* Source emoji */}
          <span className="text-xl">{sourceCfg?.emoji ?? '❓'}</span>
          <div>
            <p className="line-clamp-1 text-sm leading-snug font-semibold">
              {sourceCfg?.label ?? hotspot.sourceType}
            </p>
            <p className="text-muted-foreground text-xs">
              {hotspot.reportCount} report{hotspot.reportCount !== 1 ? 's' : ''}{' '}
              • {Math.round(hotspot.avgConfidence * 100)}% confidence
            </p>
          </div>
        </div>

        {/* Severity badge */}
        <span
          className="shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold"
          style={{
            color: severityCfg.color,
            backgroundColor: `${severityCfg.color}18`,
          }}
        >
          {severityCfg.label}
        </span>
      </div>

      {/* Severity bar */}
      <div className="mb-3">
        <div className="mb-1 flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Severity score</span>
          <span className="font-mono font-medium">
            {hotspot.severityScore}/100
          </span>
        </div>
        <div className="bg-secondary h-1.5 overflow-hidden rounded-full">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${hotspot.severityScore}%`,
              backgroundColor: severityCfg.color,
            }}
          />
        </div>
      </div>

      {/* Location */}
      <div className="text-muted-foreground mb-3 flex items-center gap-1.5 text-xs">
        <MapPin className="size-3 shrink-0" />
        <span className="truncate">{hotspot.location.address}</span>
      </div>

      {/* Info row */}
      <div className="mb-3 flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1">
          <Radio className="text-muted-foreground size-3" />
          <span className="text-muted-foreground">
            {hotspot.radius}m radius
          </span>
        </div>
        {hotspot.estimatedAqi && (
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground">
              AQI ~{hotspot.estimatedAqi}
            </span>
          </div>
        )}
        {hotspot.dispatch?.eta && (
          <div className="flex items-center gap-1 text-blue-400">
            <Users className="size-3" />
            <span>ETA {hotspot.dispatch.eta}</span>
          </div>
        )}
      </div>

      {/* Footer: status + time */}
      <div className="border-border flex items-center justify-between border-t pt-3">
        <span
          className="rounded-full px-2 py-0.5 text-xs font-medium"
          style={{
            color: statusCfg.color,
            backgroundColor: `${statusCfg.color}18`,
          }}
        >
          {statusCfg.label}
        </span>
        <span className="text-muted-foreground text-xs">
          {formatDistanceToNow(new Date(hotspot.detectedAt), {
            addSuffix: true,
          })}
        </span>
      </div>

      {/* Description (collapsed by default, expand on hover) */}
      <div className="mt-3 max-h-0 overflow-hidden transition-all duration-300 group-hover:max-h-20">
        <p className="text-muted-foreground border-border border-t pt-2 text-xs leading-relaxed">
          {hotspot.description}
        </p>
      </div>
    </div>
  );
}
