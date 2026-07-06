'use client';

import { formatDistanceToNow } from 'date-fns';
import { PageHeader } from '@/components/feedback/page-header';
import {
  getSampleStats,
  getSampleReports,
  getSampleAlerts,
} from '@/lib/sample-data';
import { ALERT_PRIORITY_CONFIG } from '@/types/alert';
import { SOURCE_TYPE_CONFIG } from '@/types/report';
import type { PollutionSourceType } from '@/types/report';
import type { AlertPriority } from '@/types/alert';

export default function AnalyticsPage() {
  const stats = getSampleStats();
  const reports = getSampleReports();
  const alerts = getSampleAlerts();

  const resolvedAlerts = alerts.filter((a) => a.status === 'resolved');

  // Source breakdown: count reports by source type
  const sourceCounts: Record<string, number> = {};
  for (const report of reports) {
    if (report.aiAnalysis) {
      const src = report.aiAnalysis.sourceType;
      sourceCounts[src] = (sourceCounts[src] ?? 0) + 1;
    }
  }
  const sourceEntries = Object.entries(sourceCounts).sort(
    ([, a], [, b]) => b - a,
  );
  const maxCount = Math.max(...sourceEntries.map(([, c]) => c), 1);

  const statCards = [
    {
      label: 'Reports Today',
      value: stats.totalReportsToday,
      icon: '📋',
      color: '#3b82f6',
      bg: '#dbeafe',
    },
    {
      label: 'Active Hotspots',
      value: stats.activeHotspots,
      icon: '🔥',
      color: '#ef4444',
      bg: '#fee2e2',
    },
    {
      label: 'Active Alerts',
      value: stats.activeAlerts,
      icon: '🚨',
      color: '#f59e0b',
      bg: '#fef3c7',
    },
    {
      label: 'Active Dispatches',
      value: stats.activeDispatches,
      icon: '🚀',
      color: '#8b5cf6',
      bg: '#ede9fe',
    },
    {
      label: 'Resolved Today',
      value: stats.resolvedToday,
      icon: '✅',
      color: '#22c55e',
      bg: '#dcfce7',
    },
    {
      label: 'Avg City AQI',
      value: stats.avgCityAqi,
      icon: '🌫️',
      color:
        stats.avgCityAqi > 300
          ? '#ef4444'
          : stats.avgCityAqi > 200
            ? '#f97316'
            : stats.avgCityAqi > 100
              ? '#eab308'
              : '#22c55e',
      bg:
        stats.avgCityAqi > 300
          ? '#fee2e2'
          : stats.avgCityAqi > 200
            ? '#ffedd5'
            : stats.avgCityAqi > 100
              ? '#fef9c3'
              : '#dcfce7',
    },
    {
      label: 'Citizen Reporters',
      value: stats.totalCitizens.toLocaleString(),
      icon: '👥',
      color: '#0ea5e9',
      bg: '#e0f2fe',
    },
    {
      label: 'CPCB Stations',
      value: stats.stationCount,
      icon: '📡',
      color: '#6366f1',
      bg: '#e0e7ff',
    },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Analytics"
        description="City-wide pollution intelligence and response performance metrics."
      />

      {/* ── Stats Grid ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="group rounded-xl border bg-card p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="text-muted-foreground text-xs font-medium">
                {stat.label}
              </span>
              <span
                className="flex h-8 w-8 items-center justify-center rounded-lg text-sm"
                style={{ backgroundColor: stat.bg }}
              >
                {stat.icon}
              </span>
            </div>
            <p
              className="text-2xl font-bold tabular-nums"
              style={{ color: stat.color }}
            >
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* ── Source Breakdown Bar Chart ──────────────────────────── */}
        <section className="rounded-xl border bg-card p-5 shadow-sm">
          <h2 className="mb-1 text-lg font-semibold tracking-tight">
            Pollution Source Breakdown
          </h2>
          <p className="text-muted-foreground mb-5 text-xs">
            Distribution of detected pollution sources from citizen reports
          </p>

          <div className="space-y-3">
            {sourceEntries.map(([source, count]) => {
              const cfg = SOURCE_TYPE_CONFIG[source as PollutionSourceType];
              const pct = Math.round((count / reports.length) * 100);
              const barWidth = (count / maxCount) * 100;

              return (
                <div key={source} className="group">
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 font-medium">
                      <span>{cfg.emoji}</span>
                      {cfg.label}
                    </span>
                    <span className="text-muted-foreground text-xs tabular-nums">
                      {count} report{count > 1 ? 's' : ''} · {pct}%
                    </span>
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full transition-all duration-500 group-hover:opacity-90"
                      style={{
                        width: `${barWidth}%`,
                        backgroundColor: cfg.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-5 flex flex-wrap gap-3 border-t pt-4">
            {sourceEntries.map(([source]) => {
              const cfg = SOURCE_TYPE_CONFIG[source as PollutionSourceType];
              return (
                <div
                  key={source}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground"
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: cfg.color }}
                  />
                  {cfg.label}
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Recent Resolved Alerts ──────────────────────────────── */}
        <section className="rounded-xl border bg-card p-5 shadow-sm">
          <h2 className="mb-1 text-lg font-semibold tracking-tight">
            Recent Resolved Alerts
          </h2>
          <p className="text-muted-foreground mb-5 text-xs">
            Alerts that have been successfully addressed
          </p>

          {resolvedAlerts.length > 0 ? (
            <div className="space-y-3">
              {resolvedAlerts.map((alert) => {
                const priorityCfg = ALERT_PRIORITY_CONFIG[alert.priority as AlertPriority];
                const sourceCfg = SOURCE_TYPE_CONFIG[alert.sourceType];
                return (
                  <div
                    key={alert.id}
                    className="group rounded-lg border bg-background p-4 transition-all duration-200 hover:shadow-sm"
                  >
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <h3 className="text-sm font-semibold leading-snug">
                        {alert.title}
                      </h3>
                      <span
                        className="inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold"
                        style={{
                          backgroundColor: priorityCfg.bgColor,
                          color: priorityCfg.color,
                        }}
                      >
                        {priorityCfg.label}
                      </span>
                    </div>

                    <p className="text-muted-foreground mb-2 text-xs">
                      📍 {alert.location.address}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span
                        className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-medium"
                        style={{
                          backgroundColor: sourceCfg.color + '18',
                          color: sourceCfg.color,
                        }}
                      >
                        {sourceCfg.emoji} {sourceCfg.label}
                      </span>
                      <span className="text-muted-foreground">
                        AQI {alert.estimatedAqi}
                      </span>
                      {alert.resolvedAt && (
                        <span className="text-emerald-600">
                          ✓ Resolved{' '}
                          {formatDistanceToNow(new Date(alert.resolvedAt), {
                            addSuffix: true,
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-muted-foreground rounded-lg border border-dashed p-8 text-center text-sm">
              No resolved alerts yet today.
            </div>
          )}
        </section>
      </div>

      {/* ── Health Risk Overview ──────────────────────────────────── */}
      <section className="rounded-xl border bg-card p-5 shadow-sm">
        <h2 className="mb-1 text-lg font-semibold tracking-tight">
          Health Risk Assessment
        </h2>
        <p className="text-muted-foreground mb-5 text-xs">
          Risk distribution across all analyzed reports
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {(
            [
              { level: 'low', label: 'Low Risk', color: '#22c55e', bg: '#dcfce7', icon: '💚' },
              { level: 'medium', label: 'Medium Risk', color: '#eab308', bg: '#fef9c3', icon: '💛' },
              { level: 'high', label: 'High Risk', color: '#f97316', bg: '#ffedd5', icon: '🧡' },
              { level: 'critical', label: 'Critical', color: '#ef4444', bg: '#fee2e2', icon: '❤️‍🔥' },
            ] as const
          ).map((risk) => {
            const count = reports.filter(
              (r) => r.aiAnalysis?.healthRisk === risk.level,
            ).length;
            return (
              <div
                key={risk.level}
                className="rounded-lg p-4 text-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm"
                style={{ backgroundColor: risk.bg }}
              >
                <span className="mb-1 block text-2xl">{risk.icon}</span>
                <p
                  className="text-2xl font-bold tabular-nums"
                  style={{ color: risk.color }}
                >
                  {count}
                </p>
                <p className="text-xs font-medium" style={{ color: risk.color }}>
                  {risk.label}
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
