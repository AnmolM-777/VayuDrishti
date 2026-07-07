'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/feedback/page-header';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { AqiTrendChart } from '@/components/dashboard/aqi-trend-chart';
import { SourceBreakdown } from '@/components/dashboard/source-breakdown';
import { RecentAlerts } from '@/components/dashboard/recent-alerts';
import { MiniMap } from '@/components/dashboard/mini-map';

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function fetchAll() {
      const [statsRes, alertsRes, reportsRes, predictionsRes, hotspotsRes] = await Promise.allSettled([
        fetch('/api/stats'),
        fetch('/api/alerts'),
        fetch('/api/reports'),
        fetch('/api/predictions'),
        fetch('/api/hotspots'),
      ]);

      setData({
        stats: statsRes.status === 'fulfilled' && statsRes.value.ok ? await statsRes.value.json() : null,
        alerts: alertsRes.status === 'fulfilled' && alertsRes.value.ok ? await alertsRes.value.json() : null,
        reports: reportsRes.status === 'fulfilled' && reportsRes.value.ok ? await reportsRes.value.json() : null,
        predictions: predictionsRes.status === 'fulfilled' && predictionsRes.value.ok ? await predictionsRes.value.json() : null,
        hotspots: hotspotsRes.status === 'fulfilled' && hotspotsRes.value.ok ? await hotspotsRes.value.json() : null,
      });
    }
    fetchAll();
  }, []);

  if (!data) {
    return (
      <div className="space-y-6">
        <PageHeader title="Dashboard" description="Real-time overview of air quality and pollution activity in Delhi." />
        <div className="p-8 text-center text-muted-foreground animate-pulse">Loading real-time data...</div>
      </div>
    );
  }

  const { stats, alerts, reports, predictions, hotspots } = data;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Real-time overview of air quality and pollution activity in Delhi."
      />

      {/* Stats row */}
      {stats && <StatsCards stats={stats} />}

      {/* Main grid: AQI chart + source breakdown */}
      {(predictions || reports) && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            {predictions?.forecast && <AqiTrendChart prediction={predictions} />}
          </div>
          <div>
            {reports?.reports && <SourceBreakdown reports={reports.reports} />}
          </div>
        </div>
      )}

      {/* Bottom grid: Map + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {hotspots?.hotspots && <MiniMap hotspots={hotspots.hotspots} />}
        {alerts?.alerts && <RecentAlerts alerts={alerts.alerts} />}
      </div>
    </div>
  );
}
