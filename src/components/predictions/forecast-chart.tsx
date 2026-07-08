'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import type { AreaPrediction } from '@/types/prediction';

interface ForecastChartProps {
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

function formatHour(h: number) {
  if (h === 0) return '12 AM';
  if (h < 12) return `${h} AM`;
  if (h === 12) return '12 PM';
  return `${h - 12} PM`;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: { category: string; confidence: number };
  }>;
  label?: number;
}) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  if (!item) return null;
  const aqi = item.value;
  const color = getAqiColor(aqi);
  const cat = item.payload.category.replace('_', ' ');
  const conf = Math.round(item.payload.confidence * 100);
  return (
    <div className="bg-popover border-border space-y-1 rounded-lg border px-3 py-2 text-xs shadow-lg">
      <p className="text-muted-foreground font-medium">
        {label !== undefined ? formatHour(label) : ''}
      </p>
      <p className="text-sm font-bold" style={{ color }}>
        AQI {aqi}
      </p>
      <p className="text-muted-foreground capitalize">{cat}</p>
      <p className="text-muted-foreground">{conf}% confidence</p>
    </div>
  );
}

export function ForecastChart({ prediction }: ForecastChartProps) {
  const data = prediction.forecast.map((f) => ({
    hour: f.hour,
    predictedAqi: f.predictedAqi,
    category: f.category,
    confidence: f.confidence,
    upper: Math.round(f.predictedAqi * (1 + (1 - f.confidence) * 0.25)),
    lower: Math.round(
      Math.max(0, f.predictedAqi * (1 - (1 - f.confidence) * 0.25)),
    ),
  }));

  return (
    <div className="bg-card border-border rounded-xl border p-5">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h2 className="font-semibold">24-Hour AQI Forecast</h2>
          <p className="text-muted-foreground mt-0.5 text-xs">
            {prediction.areaName} · Shaded band = confidence interval
          </p>
        </div>
        <div className="text-right">
          <p className="text-muted-foreground text-xs">
            Peak at {formatHour(prediction.peakHour)}
          </p>
          <p className="text-lg font-bold text-red-400">{prediction.peakAqi}</p>
        </div>
      </div>

      <div style={{ height: 240 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, bottom: 0, left: -15 }}
          >
            <defs>
              <linearGradient id="confBand" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              strokeOpacity={0.4}
              vertical={false}
            />
            <XAxis
              dataKey="hour"
              tickFormatter={formatHour}
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={false}
              tickLine={false}
              interval={3}
            />
            <YAxis
              domain={[0, 'auto']}
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine
              y={100}
              stroke="#84cc16"
              strokeDasharray="4 4"
              strokeOpacity={0.6}
              label={{
                value: 'Sat.',
                fontSize: 9,
                fill: '#84cc16',
                position: 'insideTopRight',
              }}
            />
            <ReferenceLine
              y={200}
              stroke="#f59e0b"
              strokeDasharray="4 4"
              strokeOpacity={0.6}
              label={{
                value: 'Mod.',
                fontSize: 9,
                fill: '#f59e0b',
                position: 'insideTopRight',
              }}
            />
            <ReferenceLine
              y={300}
              stroke="#ef4444"
              strokeDasharray="4 4"
              strokeOpacity={0.6}
              label={{
                value: 'Poor',
                fontSize: 9,
                fill: '#ef4444',
                position: 'insideTopRight',
              }}
            />
            {/* Confidence band */}
            <Area
              type="monotone"
              dataKey="upper"
              stroke="none"
              fill="url(#confBand)"
              activeDot={false}
              animationDuration={1000}
            />
            {/* Main AQI line */}
            <Area
              type="monotone"
              dataKey="predictedAqi"
              stroke="#f59e0b"
              strokeWidth={2.5}
              fill="url(#confBand)"
              dot={false}
              activeDot={{
                r: 5,
                fill: '#f59e0b',
                stroke: 'hsl(var(--background))',
                strokeWidth: 2,
              }}
              animationDuration={1200}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
