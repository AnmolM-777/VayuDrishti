'use client';

import { useState } from 'react';
import type { PollutionSourceType } from '@/types/report';
import { SOURCE_TYPE_CONFIG } from '@/types/report';
import { Layers } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface MapFilterState {
  sourceTypes: PollutionSourceType[];
  severity: string[];
  showHotspots: boolean;
  showStations: boolean;
  showReports: boolean;
  showHeatmap: boolean;
}

interface MapControlsProps {
  filters: MapFilterState;
  onChange: (f: MapFilterState) => void;
}

const SOURCE_OPTIONS = Object.entries(SOURCE_TYPE_CONFIG).map(([key, cfg]) => ({
  value: key as PollutionSourceType,
  label: cfg.label,
  emoji: cfg.emoji,
  color: cfg.color,
}));

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer text-xs">
      <div
        onClick={() => onChange(!checked)}
        className={cn(
          'relative w-8 h-4 rounded-full transition-colors',
          checked ? 'bg-primary' : 'bg-secondary border border-border',
        )}
      >
        <div
          className={cn(
            'absolute top-0.5 size-3 rounded-full bg-white shadow transition-transform',
            checked ? 'translate-x-4' : 'translate-x-0.5',
          )}
        />
      </div>
      {label}
    </label>
  );
}

export function MapControls({ filters, onChange }: MapControlsProps) {
  const [expanded, setExpanded] = useState(false);

  function toggleSource(src: PollutionSourceType) {
    const set = new Set(filters.sourceTypes);
    if (set.has(src)) set.delete(src); else set.add(src);
    onChange({ ...filters, sourceTypes: Array.from(set) });
  }

  return (
    <div className="absolute top-4 left-4 z-10 space-y-2">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 px-3 py-2 bg-card/95 backdrop-blur-md border border-border rounded-lg text-xs font-medium shadow-lg hover:bg-card transition-colors"
      >
        <Layers className="size-3.5" />
        Layers & Filters
      </button>

      {expanded && (
        <div className="bg-card/95 backdrop-blur-md border border-border rounded-xl p-4 space-y-4 shadow-xl w-56">
          {/* Layer toggles */}
          <div>
            <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-2">Layers</p>
            <div className="space-y-2">
              <Toggle checked={filters.showHeatmap} onChange={(v) => onChange({ ...filters, showHeatmap: v })} label="Heatmap" />
              <Toggle checked={filters.showHotspots} onChange={(v) => onChange({ ...filters, showHotspots: v })} label="Hotspots" />
              <Toggle checked={filters.showStations} onChange={(v) => onChange({ ...filters, showStations: v })} label="CPCB Stations" />
              <Toggle checked={filters.showReports} onChange={(v) => onChange({ ...filters, showReports: v })} label="Citizen Reports" />
            </div>
          </div>

          {/* Source type filter */}
          <div>
            <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-2">Source Types</p>
            <div className="space-y-1.5">
              {SOURCE_OPTIONS.map((opt) => (
                <label key={opt.value} className="flex items-center gap-2 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={filters.sourceTypes.includes(opt.value)}
                    onChange={() => toggleSource(opt.value)}
                    className="rounded border-border"
                  />
                  <span>{opt.emoji}</span>
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
