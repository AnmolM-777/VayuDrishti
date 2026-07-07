'use client';

import { formatDistanceToNow } from 'date-fns';
import { MapPin, Users, Radio, ArrowRight } from 'lucide-react';
import type { PollutionHotspot } from '@/types/hotspot';
import { HOTSPOT_SEVERITY_CONFIG, HOTSPOT_STATUS_CONFIG } from '@/types/hotspot';
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
        'bg-card border rounded-xl p-4 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 group cursor-pointer',
        hotspot.severity === 'critical' ? 'border-red-500/30' :
        hotspot.severity === 'high' ? 'border-orange-500/30' :
        hotspot.severity === 'medium' ? 'border-amber-500/30' :
        'border-border',
      )}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          {/* Source emoji */}
          <span className="text-xl">{sourceCfg?.emoji ?? '❓'}</span>
          <div>
            <p className="text-sm font-semibold leading-snug line-clamp-1">{sourceCfg?.label ?? hotspot.sourceType}</p>
            <p className="text-xs text-muted-foreground">{hotspot.reportCount} report{hotspot.reportCount !== 1 ? 's' : ''} • {Math.round(hotspot.avgConfidence * 100)}% confidence</p>
          </div>
        </div>

        {/* Severity badge */}
        <span
          className="shrink-0 text-xs px-2 py-0.5 rounded-full font-semibold"
          style={{ color: severityCfg.color, backgroundColor: `${severityCfg.color}18` }}
        >
          {severityCfg.label}
        </span>
      </div>

      {/* Severity bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-muted-foreground">Severity score</span>
          <span className="font-mono font-medium">{hotspot.severityScore}/100</span>
        </div>
        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${hotspot.severityScore}%`, backgroundColor: severityCfg.color }}
          />
        </div>
      </div>

      {/* Location */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
        <MapPin className="size-3 shrink-0" />
        <span className="truncate">{hotspot.location.address}</span>
      </div>

      {/* Info row */}
      <div className="flex items-center gap-4 text-xs mb-3">
        <div className="flex items-center gap-1">
          <Radio className="size-3 text-muted-foreground" />
          <span className="text-muted-foreground">{hotspot.radius}m radius</span>
        </div>
        {hotspot.estimatedAqi && (
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground">AQI ~{hotspot.estimatedAqi}</span>
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
      <div className="flex items-center justify-between pt-3 border-t border-border">
        <span
          className="text-xs px-2 py-0.5 rounded-full font-medium"
          style={{ color: statusCfg.color, backgroundColor: `${statusCfg.color}18` }}
        >
          {statusCfg.label}
        </span>
        <span className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(hotspot.detectedAt), { addSuffix: true })}
        </span>
      </div>

      {/* Description (collapsed by default, expand on hover) */}
      <div className="mt-3 overflow-hidden max-h-0 group-hover:max-h-20 transition-all duration-300">
        <p className="text-xs text-muted-foreground leading-relaxed border-t border-border pt-2">{hotspot.description}</p>
      </div>
    </div>
  );
}
