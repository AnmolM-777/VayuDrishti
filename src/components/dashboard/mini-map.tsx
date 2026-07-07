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
    minLat: 28.40,
    maxLat: 28.88,
    minLng: 76.84,
    maxLng: 77.35,
  };

  function latLngToPercent(lat: number, lng: number) {
    const x = ((lng - DELHI_BOUNDS.minLng) / (DELHI_BOUNDS.maxLng - DELHI_BOUNDS.minLng)) * 100;
    const y = ((DELHI_BOUNDS.maxLat - lat) / (DELHI_BOUNDS.maxLat - DELHI_BOUNDS.minLat)) * 100;
    return { x, y };
  }

  const topHotspots = hotspots.slice(0, 5);

  return (
    <div className="bg-card border border-border rounded-xl p-4 sm:p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-sm">Hotspot Locations</h3>
          <p className="text-muted-foreground text-xs mt-0.5">Top {topHotspots.length} active hotspots • Delhi</p>
        </div>
        <a
          href="/map"
          className="flex items-center gap-1 text-xs text-primary hover:underline"
        >
          Full map
          <ExternalLink className="size-3" />
        </a>
      </div>

      {/* SVG Mini Map */}
      <div className="relative bg-slate-900 rounded-lg overflow-hidden" style={{ height: 160 }}>
        {/* Grid lines to simulate map feel */}
        <svg width="100%" height="100%" className="absolute inset-0 opacity-10">
          {[25, 50, 75].map((p) => (
            <g key={p}>
              <line x1={`${p}%`} y1="0" x2={`${p}%`} y2="100%" stroke="#94a3b8" strokeWidth="0.5" />
              <line x1="0" y1={`${p}%`} x2="100%" y2={`${p}%`} stroke="#94a3b8" strokeWidth="0.5" />
            </g>
          ))}
        </svg>

        {/* Delhi city label */}
        <div className="absolute top-2 left-3 text-[10px] text-slate-500 font-medium tracking-wider uppercase">
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
              className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              {/* Pulse ring */}
              {hs.status !== 'resolved' && (
                <div
                  className="absolute inset-0 rounded-full animate-ping opacity-40"
                  style={{ backgroundColor: color, transform: 'scale(2.5)' }}
                />
              )}
              {/* Pin circle */}
              <div
                className="relative size-6 rounded-full border-2 border-background flex items-center justify-center text-[10px] shadow-lg"
                style={{ backgroundColor: color }}
              >
                {sourceEmoji}
              </div>

              {/* Tooltip on hover */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                <div className="bg-popover border border-border rounded px-2 py-1 text-xs whitespace-nowrap shadow-lg">
                  <p className="font-medium">{hs.location.address}</p>
                  <p className="text-muted-foreground">AQI ~{hs.estimatedAqi ?? 'N/A'}</p>
                </div>
              </div>
            </div>
          );
        })}

        {/* Legend */}
        <div className="absolute bottom-2 right-2 flex gap-2">
          {(['critical', 'high', 'medium'] as const).map((sev) => (
            <div key={sev} className="flex items-center gap-1">
              <div className="size-2 rounded-full" style={{ backgroundColor: SEVERITY_COLOR[sev] }} />
              <span className="text-[9px] text-slate-400 capitalize">{sev}</span>
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
              <div className="size-1.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
              <span className="shrink-0">{cfg?.emoji}</span>
              <span className="text-muted-foreground truncate flex-1">{hs.location.address}</span>
              <span className={cn('font-medium capitalize shrink-0')} style={{ color }}>
                {hs.severity}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
