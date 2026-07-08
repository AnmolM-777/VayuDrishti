'use client';

import { useEffect, useState } from 'react';
import {
  Wind,
  Flame,
  FileText,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardStats {
  avgCityAqi: number;
  activeHotspots: number;
  totalReportsToday: number;
  resolvedToday: number;
  activeAlerts: number;
}

interface StatsCardsProps {
  stats: DashboardStats;
}

function getAqiCategory(aqi: number): {
  label: string;
  color: string;
  bg: string;
  textColor: string;
} {
  if (aqi <= 50)
    return {
      label: 'Good',
      color: '#22c55e',
      bg: 'bg-emerald-500/10',
      textColor: 'text-emerald-400',
    };
  if (aqi <= 100)
    return {
      label: 'Satisfactory',
      color: '#84cc16',
      bg: 'bg-lime-500/10',
      textColor: 'text-lime-400',
    };
  if (aqi <= 200)
    return {
      label: 'Moderate',
      color: '#f59e0b',
      bg: 'bg-amber-500/10',
      textColor: 'text-amber-400',
    };
  if (aqi <= 300)
    return {
      label: 'Poor',
      color: '#f97316',
      bg: 'bg-orange-500/10',
      textColor: 'text-orange-400',
    };
  if (aqi <= 400)
    return {
      label: 'Very Poor',
      color: '#ef4444',
      bg: 'bg-red-500/10',
      textColor: 'text-red-400',
    };
  return {
    label: 'Severe',
    color: '#8b5cf6',
    bg: 'bg-purple-500/10',
    textColor: 'text-purple-400',
  };
}

function AqiGauge({ aqi }: { aqi: number }) {
  const [displayAqi, setDisplayAqi] = useState(0);
  const category = getAqiCategory(aqi);
  const pct = Math.min(aqi / 500, 1);
  const radius = 40;
  const circumference = Math.PI * radius; // half circle
  const offset = circumference * (1 - pct);

  useEffect(() => {
    const timer = setTimeout(() => {
      let start = 0;
      const step = aqi / 40;
      const interval = setInterval(() => {
        start += step;
        if (start >= aqi) {
          setDisplayAqi(aqi);
          clearInterval(interval);
        } else {
          setDisplayAqi(Math.round(start));
        }
      }, 16);
      return () => clearInterval(interval);
    }, 200);
    return () => clearTimeout(timer);
  }, [aqi]);

  return (
    <div className="relative flex flex-col items-center">
      <svg
        width="100"
        height="60"
        viewBox="0 0 100 60"
        className="overflow-visible"
      >
        {/* Background arc */}
        <path
          d="M 10 50 A 40 40 0 0 1 90 50"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          strokeLinecap="round"
          className="text-border/50"
        />
        {/* AQI arc */}
        <path
          d="M 10 50 A 40 40 0 0 1 90 50"
          fill="none"
          stroke={category.color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${circumference}`}
          strokeDashoffset={`${offset}`}
          style={{ transition: 'stroke-dashoffset 1.2s ease-out' }}
        />
      </svg>
      <div className="absolute bottom-0 text-center">
        <div className="font-mono text-2xl font-bold tabular-nums">
          {displayAqi}
        </div>
        <div className={cn('mt-0.5 text-xs font-medium', category.textColor)}>
          {category.label}
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  iconBg: string;
  trend?: 'up' | 'down' | 'neutral';
  trendLabel?: string;
  children?: React.ReactNode;
}

function StatCard({
  title,
  value,
  icon,
  iconBg,
  trend,
  trendLabel,
  children,
}: StatCardProps) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  const TrendIcon =
    trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor =
    trend === 'up'
      ? 'text-red-400'
      : trend === 'down'
        ? 'text-emerald-400'
        : 'text-muted-foreground';

  return (
    <div
      className={cn(
        'bg-card border-border flex flex-col gap-3 rounded-xl border p-4 transition-all duration-500 sm:p-5',
        visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
            {title}
          </p>
          {children ?? (
            <p className="mt-1 text-3xl font-bold tabular-nums">{value}</p>
          )}
        </div>
        <div className={cn('rounded-lg p-2.5', iconBg)}>{icon}</div>
      </div>
      {trendLabel && (
        <div className={cn('flex items-center gap-1 text-xs', trendColor)}>
          <TrendIcon className="size-3" />
          {trendLabel}
        </div>
      )}
    </div>
  );
}

export function StatsCards({ stats }: StatsCardsProps) {
  const aqiCategory = getAqiCategory(stats.avgCityAqi);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {/* AQI Gauge */}
      <StatCard
        title="City AQI"
        value={stats.avgCityAqi}
        iconBg={aqiCategory.bg}
        icon={<Wind className={cn('size-5', aqiCategory.textColor)} />}
        trend="up"
        trendLabel="Rising from yesterday"
      >
        <AqiGauge aqi={stats.avgCityAqi} />
      </StatCard>

      {/* Active Hotspots */}
      <StatCard
        title="Active Hotspots"
        value={stats.activeHotspots}
        iconBg="bg-orange-500/10"
        icon={<Flame className="size-5 text-orange-400" />}
        trend="up"
        trendLabel={`${stats.activeAlerts} alerts active`}
      />

      {/* Reports Today */}
      <StatCard
        title="Reports Today"
        value={stats.totalReportsToday}
        iconBg="bg-blue-500/10"
        icon={<FileText className="size-5 text-blue-400" />}
        trend="neutral"
        trendLabel="From citizen sentinels"
      />

      {/* Resolved Today */}
      <StatCard
        title="Resolved Today"
        value={stats.resolvedToday}
        iconBg="bg-emerald-500/10"
        icon={<CheckCircle2 className="size-5 text-emerald-400" />}
        trend="down"
        trendLabel="Hotspots cleared"
      />
    </div>
  );
}
