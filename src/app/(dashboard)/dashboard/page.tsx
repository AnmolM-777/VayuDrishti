'use client';

import { useEffect, useState, type ComponentProps } from 'react';
import { PageHeader } from '@/components/feedback/page-header';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { AqiTrendChart } from '@/components/dashboard/aqi-trend-chart';
import { SourceBreakdown } from '@/components/dashboard/source-breakdown';
import { RecentAlerts } from '@/components/dashboard/recent-alerts';
import { MiniMap } from '@/components/dashboard/mini-map';
import type { PollutionAlert } from '@/types/alert';
import type { PollutionHotspot } from '@/types/hotspot';
import type { PredictionResponse } from '@/types/prediction';
import type { PollutionReport } from '@/types/report';

type StatsResponse = ComponentProps<typeof StatsCards>['stats'];
type AlertsResponse = { success: boolean; alerts: PollutionAlert[] };
type HotspotsResponse = { success: boolean; hotspots: PollutionHotspot[] };
type ReportsResponse = { success: boolean; reports: PollutionReport[] };

interface DashboardData {
  stats: StatsResponse | null;
  alerts: AlertsResponse | null;
  reports: ReportsResponse | null;
  predictions: PredictionResponse | null;
  hotspots: HotspotsResponse | null;
}

async function readJson<T>(
  response: PromiseSettledResult<Response>,
): Promise<T | null> {
  if (response.status !== 'fulfilled' || !response.value.ok) return null;
  return (await response.value.json()) as T;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    async function fetchAll() {
      const [statsRes, alertsRes, reportsRes, predictionsRes, hotspotsRes] =
        await Promise.allSettled([
          fetch('/api/stats'),
          fetch('/api/alerts'),
          fetch('/api/reports'),
          fetch('/api/predictions'),
          fetch('/api/hotspots'),
        ]);

      setData({
        stats: await readJson<StatsResponse>(statsRes),
        alerts: await readJson<AlertsResponse>(alertsRes),
        reports: await readJson<ReportsResponse>(reportsRes),
        predictions: await readJson<PredictionResponse>(predictionsRes),
        hotspots: await readJson<HotspotsResponse>(hotspotsRes),
      });
    }
    fetchAll();
  }, []);

  if (!data) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Dashboard"
          description="Real-time overview of air quality and pollution activity in Delhi."
        />
        <div className="text-muted-foreground animate-pulse p-8 text-center">
          Loading real-time data...
        </div>
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
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {predictions?.prediction && (
              <AqiTrendChart prediction={predictions.prediction} />
            )}
          </div>
          <div>
            {reports?.reports && <SourceBreakdown reports={reports.reports} />}
          </div>
        </div>
      )}

      {/* Bottom grid: Map + Alerts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {hotspots?.hotspots && <MiniMap hotspots={hotspots.hotspots} />}
        {alerts?.alerts && <RecentAlerts alerts={alerts.alerts} />}
      </div>
    </div>
  );
}
