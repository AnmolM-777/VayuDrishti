'use client';

import type { HourlyPrediction } from '@/types/prediction';
import { cn } from '@/lib/utils';

interface HourlyBreakdownProps {
  forecast: HourlyPrediction[];
  currentHour: number;
}

const CATEGORY_CONFIG: Record<
  string,
  { color: string; bg: string; label: string }
> = {
  good: { color: '#22c55e', bg: 'bg-emerald-500/10', label: 'Good' },
  satisfactory: {
    color: '#84cc16',
    bg: 'bg-lime-500/10',
    label: 'Satisfactory',
  },
  moderate: { color: '#f59e0b', bg: 'bg-amber-500/10', label: 'Moderate' },
  poor: { color: '#f97316', bg: 'bg-orange-500/10', label: 'Poor' },
  very_poor: { color: '#ef4444', bg: 'bg-red-500/10', label: 'Very Poor' },
  severe: { color: '#8b5cf6', bg: 'bg-purple-500/10', label: 'Severe' },
};

function formatHour(h: number) {
  if (h === 0) return '12 AM';
  if (h < 12) return `${h} AM`;
  if (h === 12) return '12 PM';
  return `${h - 12} PM`;
}

export function HourlyBreakdown({
  forecast,
  currentHour,
}: HourlyBreakdownProps) {
  return (
    <div className="bg-card border-border rounded-xl border p-5">
      <h3 className="mb-4 font-semibold">Hour-by-Hour Breakdown</h3>
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-8 xl:grid-cols-12">
        {forecast.map((entry) => {
          const fallback = {
            color: '#f59e0b',
            bg: 'bg-amber-500/10',
            label: 'Moderate',
          };
          const cfg: { color: string; bg: string; label: string } =
            CATEGORY_CONFIG[entry.category] ?? fallback;
          const isNow = entry.hour === currentHour;
          return (
            <div
              key={entry.hour}
              className={cn(
                'flex flex-col items-center rounded-lg border p-2 text-center transition-all',
                cfg.bg,
                isNow
                  ? 'border-primary ring-primary/30 scale-105 ring-2'
                  : 'border-transparent',
              )}
              title={`${formatHour(entry.hour)}: AQI ${entry.predictedAqi} (${cfg.label})`}
            >
              <span className="text-muted-foreground mb-1 text-[10px] font-medium">
                {isNow ? 'Now' : formatHour(entry.hour)}
              </span>
              <span
                className="text-sm font-bold tabular-nums"
                style={{ color: cfg.color }}
              >
                {entry.predictedAqi}
              </span>
              <span className="text-muted-foreground mt-0.5 text-[9px]">
                {Math.round(entry.confidence * 100)}%
              </span>
            </div>
          );
        })}
      </div>

      {/* Category legend */}
      <div className="border-border mt-4 flex flex-wrap gap-3 border-t pt-4">
        {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => (
          <div key={key} className="flex items-center gap-1.5 text-xs">
            <div
              className="size-2.5 rounded-full"
              style={{ backgroundColor: cfg.color }}
            />
            <span className="text-muted-foreground">{cfg.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
