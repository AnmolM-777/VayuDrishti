'use client';

import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart,
} from 'recharts';
import type { AreaPrediction } from '@/types/prediction';
import { cn } from '@/lib/utils';

interface AqiTrendChartProps {
  prediction: AreaPrediction;
}

function getAqiColor(aqi: number): string {
  if (aqi <= 50) return '#22c55e';
  if (aqi <= 100) return '#84cc16';
  if (aqi <= 200) return '#f59e0b';
  if (aqi <= 300) return '#f97316';
  if (aqi <= 400) return '#ef4444';
  return '#8b5cf6';
}

function formatHour(hour: number): string {
  if (hour === 0) return '12A';
  if (hour < 12) return `${hour}A`;
  if (hour === 12) return '12P';
  return `${hour - 12}P`;
}

// Custom dot that changes color based on AQI level
function CustomDot(props: { cx?: number; cy?: number; payload?: { predictedAqi: number } }) {
  const { cx, cy, payload } = props;
  if (!cx || !cy || !payload) return null;
  const color = getAqiColor(payload.predictedAqi);
  return <circle cx={cx} cy={cy} r={3} fill={color} stroke="none" />;
}

// Custom tooltip
function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; payload: { category: string } }>;
  label?: number;
}) {
  if (!active || !payload?.length) return null;
  const aqi = payload[0].value;
  const color = getAqiColor(aqi);
  return (
    <div className="bg-popover border border-border rounded-lg px-3 py-2 text-xs shadow-lg">
      <p className="text-muted-foreground mb-1">{label !== undefined ? `${formatHour(label)} today` : ''}</p>
      <p className="font-bold text-sm" style={{ color }}>
        AQI {aqi}
      </p>
      <p className="text-muted-foreground capitalize">{payload[0].payload.category.replace('_', ' ')}</p>
    </div>
  );
}

export function AqiTrendChart({ prediction }: AqiTrendChartProps) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 300);
    return () => clearTimeout(t);
  }, []);

  const data = prediction.forecast.map((f) => ({
    hour: f.hour,
    predictedAqi: f.predictedAqi,
    category: f.category,
    confidence: f.confidence,
    upper: Math.round(f.predictedAqi * (1 + (1 - f.confidence) * 0.3)),
    lower: Math.round(f.predictedAqi * (1 - (1 - f.confidence) * 0.3)),
  }));

  return (
    <div className="bg-card border border-border rounded-xl p-4 sm:p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-sm">24-Hour AQI Forecast</h3>
          <p className="text-muted-foreground text-xs mt-0.5">{prediction.areaName} • Updates hourly</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <span
            className={cn(
              'px-2 py-0.5 rounded-full font-medium',
              prediction.trend === 'worsening'
                ? 'bg-red-500/10 text-red-400'
                : prediction.trend === 'improving'
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'bg-amber-500/10 text-amber-400',
            )}
          >
            {prediction.trend === 'worsening' ? '↑ Worsening' : prediction.trend === 'improving' ? '↓ Improving' : '→ Stable'}
          </span>
        </div>
      </div>

      <div
        className={cn(
          'transition-all duration-700',
          animated ? 'opacity-100' : 'opacity-0',
        )}
        style={{ height: 180 }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="aqiGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} vertical={false} />
            <XAxis
              dataKey="hour"
              tickFormatter={formatHour}
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={false}
              tickLine={false}
              interval={3}
            />
            <YAxis
              domain={[0, 500]}
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={false}
              tickLine={false}
              ticks={[0, 100, 200, 300, 400, 500]}
            />
            <Tooltip content={<CustomTooltip />} />
            {/* AQI threshold lines */}
            <ReferenceLine y={100} stroke="#84cc16" strokeDasharray="3 3" strokeOpacity={0.5} />
            <ReferenceLine y={200} stroke="#f59e0b" strokeDasharray="3 3" strokeOpacity={0.5} />
            <ReferenceLine y={300} stroke="#f97316" strokeDasharray="3 3" strokeOpacity={0.5} />
            <Area
              type="monotone"
              dataKey="predictedAqi"
              stroke="#f59e0b"
              strokeWidth={2}
              fill="url(#aqiGradient)"
              dot={<CustomDot />}
              activeDot={{ r: 5, fill: '#f59e0b' }}
              isAnimationActive={animated}
              animationDuration={1200}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Peak + Safe window summary */}
      <div className="flex gap-3 mt-4 pt-4 border-t border-border">
        <div className="flex-1 text-center">
          <p className="text-xs text-muted-foreground">Peak AQI</p>
          <p className="text-lg font-bold text-red-400">{prediction.peakAqi}</p>
          <p className="text-xs text-muted-foreground">{formatHour(prediction.peakHour)}</p>
        </div>
        <div className="w-px bg-border" />
        <div className="flex-1 text-center">
          <p className="text-xs text-muted-foreground">Safe Hours</p>
          <p className="text-lg font-bold text-emerald-400">{prediction.safeHours.length}h</p>
          <p className="text-xs text-muted-foreground">today</p>
        </div>
        <div className="w-px bg-border" />
        <div className="flex-1 text-center">
          <p className="text-xs text-muted-foreground">Current</p>
          <p className="text-lg font-bold" style={{ color: getAqiColor(prediction.currentAqi) }}>
            {prediction.currentAqi}
          </p>
          <p className="text-xs text-muted-foreground capitalize">{prediction.currentCategory.replace('_', ' ')}</p>
        </div>
      </div>
    </div>
  );
}
