'use client';

import { ExternalLink } from 'lucide-react';
import type { PollutionHotspot } from '@/types/hotspot';
import { SOURCE_TYPE_CONFIG } from '@/types/report';
import { cn } from '@/lib/utils';

interface MiniMapProps {
  hotspots: PollutionHotspot[];
}

const SEVERITY_COLOR = {
  low: '#22c55e',
  medium: '#f59e0b',
  high: '#f97316',
  critical: '#ef4444',
  extreme: '#8b5cf6',
} as const;

// Simple SVG-based map placeholder showing Delhi region with pins
// This renders without a Maps API key and provides visual context
export function MiniMap({ hotspots }: MiniMapProps) {
  // Delhi approximate bounding box for coordinate mapping
  const DELHI_BOUNDS = {
    minLat: 28.4,
    maxLat: 28.88,
    minLng: 76.84,
    maxLng: 77.35,
  };

  function latLngToPercent(lat: number, lng: number) {
    const x =
      ((lng - DELHI_BOUNDS.minLng) /
        (DELHI_BOUNDS.maxLng - DELHI_BOUNDS.minLng)) *
      100;
    const y =
      ((DELHI_BOUNDS.maxLat - lat) /
        (DELHI_BOUNDS.maxLat - DELHI_BOUNDS.minLat)) *
      100;
    return { x, y };
  }

  const topHotspots = hotspots.slice(0, 5);

  return (
    <div className="bg-card border-border rounded-xl border p-4 sm:p-5">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold">Hotspot Locations</h3>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Top {topHotspots.length} active hotspots • Delhi
          </p>
        </div>
        <a
          href="/map"
          className="text-primary flex items-center gap-1 text-xs hover:underline"
        >
          Full map
          <ExternalLink className="size-3" />
        </a>
      </div>

      {/* SVG Mini Map */}
      <div
        className="relative overflow-hidden rounded-lg bg-slate-900"
        style={{ height: 160 }}
      >
        {/* Grid lines to simulate map feel */}
        <svg width="100%" height="100%" className="absolute inset-0 opacity-10">
          {[25, 50, 75].map((p) => (
            <g key={p}>
              <line
                x1={`${p}%`}
                y1="0"
                x2={`${p}%`}
                y2="100%"
                stroke="#94a3b8"
                strokeWidth="0.5"
              />
              <line
                x1="0"
                y1={`${p}%`}
                x2="100%"
                y2={`${p}%`}
                stroke="#94a3b8"
                strokeWidth="0.5"
              />
            </g>
          ))}
        </svg>

        {/* Delhi city label */}
        <div className="absolute top-2 left-3 text-[10px] font-medium tracking-wider text-slate-500 uppercase">
          Delhi NCR
        </div>

        {/* Hotspot pins */}
        {topHotspots.map((hs) => {
          const { x, y } = latLngToPercent(hs.location.lat, hs.location.lng);
          const color = SEVERITY_COLOR[hs.severity];
          const sourceEmoji = SOURCE_TYPE_CONFIG[hs.sourceType]?.emoji ?? '❓';

          return (
            <div
              key={hs.id}
              className="group absolute -translate-x-1/2 -translate-y-1/2 transform cursor-pointer"
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              {/* Pulse ring */}
              {hs.status !== 'resolved' && (
                <div
                  className="absolute inset-0 animate-ping rounded-full opacity-40"
                  style={{ backgroundColor: color, transform: 'scale(2.5)' }}
                />
              )}
              {/* Pin circle */}
              <div
                className="border-background relative flex size-6 items-center justify-center rounded-full border-2 text-[10px] shadow-lg"
                style={{ backgroundColor: color }}
              >
                {sourceEmoji}
              </div>

              {/* Tooltip on hover */}
              <div className="absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 group-hover:block">
                <div className="bg-popover border-border rounded border px-2 py-1 text-xs whitespace-nowrap shadow-lg">
                  <p className="font-medium">{hs.location.address}</p>
                  <p className="text-muted-foreground">
                    AQI ~{hs.estimatedAqi ?? 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          );
        })}

        {/* Legend */}
        <div className="absolute right-2 bottom-2 flex gap-2">
          {(['critical', 'high', 'medium'] as const).map((sev) => (
            <div key={sev} className="flex items-center gap-1">
              <div
                className="size-2 rounded-full"
                style={{ backgroundColor: SEVERITY_COLOR[sev] }}
              />
              <span className="text-[9px] text-slate-400 capitalize">
                {sev}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Hotspot list */}
      <div className="mt-3 space-y-1.5">
        {topHotspots.map((hs) => {
          const color = SEVERITY_COLOR[hs.severity];
          const cfg = SOURCE_TYPE_CONFIG[hs.sourceType];
          return (
            <div key={hs.id} className="flex items-center gap-2 text-xs">
              <div
                className="size-1.5 shrink-0 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="shrink-0">{cfg?.emoji}</span>
              <span className="text-muted-foreground flex-1 truncate">
                {hs.location.address}
              </span>
              <span
                className={cn('shrink-0 font-medium capitalize')}
                style={{ color }}
              >
                {hs.severity}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
