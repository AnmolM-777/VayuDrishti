'use client';

import { useState } from 'react';
import type { HotspotSeverity, HotspotStatus } from '@/types/hotspot';
import type { PollutionSourceType } from '@/types/report';
import { SOURCE_TYPE_CONFIG } from '@/types/report';
import { cn } from '@/lib/utils';
import { SlidersHorizontal } from 'lucide-react';

export interface HotspotFilterState {
  severity: HotspotSeverity | 'all';
  status: HotspotStatus | 'all';
  sourceType: PollutionSourceType | 'all';
}

interface HotspotFiltersProps {
  filters: HotspotFilterState;
  onChange: (f: HotspotFilterState) => void;
  totalCount: number;
  filteredCount: number;
}

function ToggleChip({
  active,
  onClick,
  children,
  color,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  color?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'rounded-full border px-3 py-1 text-xs font-medium transition-all',
        active
          ? 'border-transparent text-white'
          : 'border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground',
      )}
      style={active && color ? { backgroundColor: color } : undefined}
    >
      {children}
    </button>
  );
}

const SEVERITY_OPTIONS: {
  value: HotspotSeverity | 'all';
  label: string;
  color: string;
}[] = [
  { value: 'all', label: 'All', color: '#6b7280' },
  { value: 'critical', label: '🔴 Critical', color: '#ef4444' },
  { value: 'high', label: '🟠 High', color: '#f97316' },
  { value: 'medium', label: '🟡 Medium', color: '#eab308' },
  { value: 'low', label: '🟢 Low', color: '#22c55e' },
];

const STATUS_OPTIONS: { value: HotspotStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All statuses' },
  { value: 'detected', label: 'Detected' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'dispatched', label: 'Dispatched' },
  { value: 'resolved', label: 'Resolved' },
];

export function HotspotFilters({
  filters,
  onChange,
  totalCount,
  filteredCount,
}: HotspotFiltersProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-card border-border rounded-xl border p-3">
      {/* Toggle bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-muted-foreground hover:text-foreground flex items-center gap-2 text-sm font-medium transition-colors"
        >
          <SlidersHorizontal className="size-4" />
          Filters
          {filteredCount !== totalCount && (
            <span className="bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 text-[10px] font-semibold">
              {filteredCount}/{totalCount}
            </span>
          )}
        </button>

        {/* Quick severity filter (always visible) */}
        <div className="flex gap-1.5">
          {SEVERITY_OPTIONS.map((opt) => (
            <ToggleChip
              key={opt.value}
              active={filters.severity === opt.value}
              onClick={() => onChange({ ...filters, severity: opt.value })}
              color={opt.color}
            >
              {opt.label}
            </ToggleChip>
          ))}
        </div>
      </div>

      {/* Expanded filters */}
      {expanded && (
        <div className="border-border mt-3 grid grid-cols-1 gap-3 border-t pt-3 sm:grid-cols-2">
          {/* Status */}
          <div>
            <p className="text-muted-foreground mb-1.5 text-xs font-medium">
              Status
            </p>
            <div className="flex flex-wrap gap-1.5">
              {STATUS_OPTIONS.map((opt) => (
                <ToggleChip
                  key={opt.value}
                  active={filters.status === opt.value}
                  onClick={() => onChange({ ...filters, status: opt.value })}
                  color="#3b82f6"
                >
                  {opt.label}
                </ToggleChip>
              ))}
            </div>
          </div>

          {/* Source type */}
          <div>
            <p className="text-muted-foreground mb-1.5 text-xs font-medium">
              Source Type
            </p>
            <div className="flex flex-wrap gap-1.5">
              <ToggleChip
                active={filters.sourceType === 'all'}
                onClick={() => onChange({ ...filters, sourceType: 'all' })}
                color="#6b7280"
              >
                All types
              </ToggleChip>
              {Object.entries(SOURCE_TYPE_CONFIG).map(([key, cfg]) => (
                <ToggleChip
                  key={key}
                  active={filters.sourceType === key}
                  onClick={() =>
                    onChange({
                      ...filters,
                      sourceType: key as PollutionSourceType,
                    })
                  }
                  color={cfg.color}
                >
                  {cfg.emoji} {cfg.label}
                </ToggleChip>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
