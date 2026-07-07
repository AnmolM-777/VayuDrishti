'use client';

import type { AlertPriority } from '@/types/alert';
import { cn } from '@/lib/utils';

export interface AlertFilterState {
  priority: AlertPriority | 'all';
  status: string;
}

interface AlertFiltersProps {
  filters: AlertFilterState;
  onChange: (f: AlertFilterState) => void;
}

const PRIORITY_OPTIONS: { value: AlertPriority | 'all'; label: string; color: string }[] = [
  { value: 'all',    label: 'All',       color: '#6b7280' },
  { value: 'purple', label: '🚨 Emergency', color: '#8b5cf6' },
  { value: 'red',    label: '🔴 Severe',    color: '#ef4444' },
  { value: 'orange', label: '🟠 High',      color: '#f97316' },
  { value: 'yellow', label: '🟡 Moderate',  color: '#eab308' },
  { value: 'green',  label: '🟢 Low',       color: '#22c55e' },
];

const STATUS_OPTIONS = [
  { value: 'all',      label: 'All' },
  { value: 'active',   label: 'Active' },
  { value: 'dispatched', label: 'Dispatched' },
  { value: 'resolved', label: 'Resolved' },
];

interface ChipProps { active: boolean; onClick: () => void; children: React.ReactNode; color?: string }

function Chip({ active, onClick, children, color }: ChipProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-3 py-1 rounded-full text-xs font-medium border transition-all',
        active ? 'border-transparent text-white' : 'border-border text-muted-foreground hover:text-foreground hover:border-foreground/30',
      )}
      style={active && color ? { backgroundColor: color } : undefined}
    >
      {children}
    </button>
  );
}

export function AlertFilters({ filters, onChange }: AlertFiltersProps) {
  return (
    <div className="flex flex-wrap gap-4 items-center">
      <div className="flex flex-wrap gap-1.5 items-center">
        <span className="text-xs text-muted-foreground font-medium mr-1">Priority:</span>
        {PRIORITY_OPTIONS.map((opt) => (
          <Chip
            key={opt.value}
            active={filters.priority === opt.value}
            onClick={() => onChange({ ...filters, priority: opt.value })}
            color={opt.color}
          >
            {opt.label}
          </Chip>
        ))}
      </div>
      <div className="flex flex-wrap gap-1.5 items-center">
        <span className="text-xs text-muted-foreground font-medium mr-1">Status:</span>
        {STATUS_OPTIONS.map((opt) => (
          <Chip
            key={opt.value}
            active={filters.status === opt.value}
            onClick={() => onChange({ ...filters, status: opt.value })}
            color="#3b82f6"
          >
            {opt.label}
          </Chip>
        ))}
      </div>
    </div>
  );
}
