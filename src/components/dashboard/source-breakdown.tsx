'use client';

import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import type { PollutionReport } from '@/types/report';
import { SOURCE_TYPE_CONFIG } from '@/types/report';
import { cn } from '@/lib/utils';

interface SourceBreakdownProps {
  reports: PollutionReport[];
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: { color: string } }>;
}) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  if (!item) return null;
  return (
    <div className="bg-popover border border-border rounded-lg px-3 py-2 text-xs shadow-lg">
      <p className="font-medium">{item.name}</p>
      <p className="text-muted-foreground">{item.value} reports</p>
    </div>
  );
}

export function SourceBreakdown({ reports }: SourceBreakdownProps) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 400);
    return () => clearTimeout(t);
  }, []);

  // Aggregate by source type
  const counts: Record<string, number> = {};
  for (const r of reports) {
    const type = r.aiAnalysis?.sourceType ?? 'unknown';
    counts[type] = (counts[type] ?? 0) + 1;
  }

  const data = Object.entries(counts)
    .map(([key, value]) => ({
      name: SOURCE_TYPE_CONFIG[key as keyof typeof SOURCE_TYPE_CONFIG]?.label ?? key,
      emoji: SOURCE_TYPE_CONFIG[key as keyof typeof SOURCE_TYPE_CONFIG]?.emoji ?? '❓',
      value,
      color: SOURCE_TYPE_CONFIG[key as keyof typeof SOURCE_TYPE_CONFIG]?.color ?? '#6b7280',
    }))
    .sort((a, b) => b.value - a.value);

  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="bg-card border border-border rounded-xl p-4 sm:p-5">
      <div className="mb-4">
        <h3 className="font-semibold text-sm">Pollution Source Breakdown</h3>
        <p className="text-muted-foreground text-xs mt-0.5">{total} reports today</p>
      </div>

      <div className="flex items-center gap-4">
        {/* Donut chart */}
        <div
          className={cn('transition-all duration-700 shrink-0', animated ? 'opacity-100 scale-100' : 'opacity-0 scale-75')}
          style={{ width: 120, height: 120 }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={35}
                outerRadius={55}
                paddingAngle={2}
                dataKey="value"
                isAnimationActive={animated}
                animationBegin={0}
                animationDuration={900}
              >
                {data.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-2 min-w-0">
          {data.map((item) => {
            const pct = Math.round((item.value / total) * 100);
            return (
              <div key={item.name} className="flex items-center gap-2 text-xs">
                <span className="text-base leading-none shrink-0">{item.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="truncate text-muted-foreground">{item.name}</span>
                    <span className="font-medium ml-2 shrink-0">{pct}%</span>
                  </div>
                  <div className="h-1 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{
                        width: animated ? `${pct}%` : '0%',
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
