'use client';

import { Sun, Moon, Cloud } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SafeHoursProps {
  safeHours: number[];
  forecast: Array<{ hour: number; predictedAqi: number; category: string }>;
}

function formatHour(h: number) {
  if (h === 0) return '12 AM';
  if (h < 12) return `${h} AM`;
  if (h === 12) return '12 PM';
  return `${h - 12} PM`;
}

function getTimeOfDayIcon(hour: number) {
  if (hour >= 6 && hour < 18) return Sun;
  return Moon;
}

function groupConsecutive(hours: number[]): number[][] {
  if (!hours.length) return [];
  const sorted = [...hours].sort((a, b) => a - b);
  const first = sorted[0];
  if (first === undefined) return [];
  const groups: number[][] = [[first]];
  for (let i = 1; i < sorted.length; i++) {
    const curr = sorted[i];
    const prev = sorted[i - 1];
    const lastGroup = groups[groups.length - 1];
    if (
      curr !== undefined &&
      prev !== undefined &&
      lastGroup &&
      curr === prev + 1
    ) {
      lastGroup.push(curr);
    } else if (curr !== undefined) {
      groups.push([curr]);
    }
  }
  return groups;
}

export function SafeHours({ safeHours, forecast }: SafeHoursProps) {
  const groups = groupConsecutive(safeHours);
  const totalSafe = safeHours.length;

  // Best single window
  const bestGroup =
    groups.length > 0
      ? [...groups].sort((a, b) => b.length - a.length)[0]
      : undefined;

  return (
    <div className="bg-card border-border rounded-xl border p-5">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="font-semibold">Safe Hours for Outdoor Activity</h3>
          <p className="text-muted-foreground mt-0.5 text-xs">
            AQI ≤ 100 (Good / Satisfactory)
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-emerald-400">{totalSafe}h</p>
          <p className="text-muted-foreground text-xs">of 24h safe</p>
        </div>
      </div>

      {totalSafe === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Cloud className="mb-2 size-10 text-red-400" />
          <p className="text-sm font-medium text-red-400">
            No safe hours today
          </p>
          <p className="text-muted-foreground mt-1 text-xs">
            Avoid prolonged outdoor exposure. Wear N95 masks if going out.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Best window highlight */}
          {bestGroup && (
            <div className="rounded-lg border border-emerald-500/25 bg-emerald-500/10 p-3">
              <div className="flex items-center gap-2">
                <Sun className="size-4 text-emerald-400" />
                <div>
                  <p className="text-sm font-semibold text-emerald-400">
                    Best window: {formatHour(bestGroup[0] ?? 0)} –{' '}
                    {formatHour(
                      ((bestGroup[bestGroup.length - 1] ?? 0) + 1) % 24,
                    )}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {bestGroup.length} consecutive safe hours
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 24h bar visualization */}
          <div>
            <p className="text-muted-foreground mb-2 text-xs">
              24-hour air quality timeline
            </p>
            <div className="flex gap-0.5 overflow-hidden rounded-md">
              {forecast.map((f) => {
                const isSafe = safeHours.includes(f.hour);
                const color = isSafe
                  ? '#22c55e'
                  : f.predictedAqi <= 200
                    ? '#f59e0b'
                    : f.predictedAqi <= 300
                      ? '#f97316'
                      : '#ef4444';
                return (
                  <div
                    key={f.hour}
                    className="group relative h-6 flex-1 cursor-default transition-opacity hover:opacity-80"
                    style={{ backgroundColor: color }}
                    title={`${formatHour(f.hour)}: AQI ${f.predictedAqi}`}
                  />
                );
              })}
            </div>
            <div className="text-muted-foreground mt-1 flex justify-between text-[10px]">
              <span>12 AM</span>
              <span>6 AM</span>
              <span>12 PM</span>
              <span>6 PM</span>
              <span>11 PM</span>
            </div>
          </div>

          {/* Safe windows list */}
          <div className="space-y-2">
            {groups.map((group, i) => {
              const Icon = getTimeOfDayIcon(group[0] ?? 0);
              const avgAqi = Math.round(
                group.reduce(
                  (sum, h) =>
                    sum +
                    (forecast.find((f) => f.hour === h)?.predictedAqi ?? 0),
                  0,
                ) / group.length,
              );
              return (
                <div key={i} className="flex items-center gap-3 text-xs">
                  <Icon className="size-3.5 shrink-0 text-emerald-400" />
                  <span className="font-medium">
                    {formatHour(group[0] ?? 0)} –{' '}
                    {formatHour(((group[group.length - 1] ?? 0) + 1) % 24)}
                  </span>
                  <span className="text-muted-foreground">
                    {group.length}h · avg AQI {avgAqi}
                  </span>
                  <span
                    className={cn(
                      'ml-auto rounded-full px-2 py-0.5 text-[10px] font-semibold',
                      group.length >= 4
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-lime-500/10 text-lime-400',
                    )}
                  >
                    {group.length >= 4 ? 'Ideal' : 'OK'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tip */}
      <div className="border-border text-muted-foreground mt-4 border-t pt-4 text-xs">
        💡{' '}
        <span>
          AQI &gt;200: limit outdoor activity. AQI &gt;300: stay indoors. Wear
          N95 if AQI &gt;150.
        </span>
      </div>
    </div>
  );
}
