import type { Metadata } from 'next';
import { PageHeader } from '@/components/feedback/page-header';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { AqiTrendChart } from '@/components/dashboard/aqi-trend-chart';
import { SourceBreakdown } from '@/components/dashboard/source-breakdown';
import { RecentAlerts } from '@/components/dashboard/recent-alerts';
import { MiniMap } from '@/components/dashboard/mini-map';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Overview of air quality and pollution activity',
};

async function getDashboardData() {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

  const [statsRes, alertsRes, reportsRes, predictionsRes, hotspotsRes] = await Promise.allSettled([
    fetch(`${base}/api/stats`, { next: { revalidate: 60 } }),
    fetch(`${base}/api/alerts`, { next: { revalidate: 60 } }),
    fetch(`${base}/api/reports`, { next: { revalidate: 60 } }),
    fetch(`${base}/api/predictions`, { next: { revalidate: 300 } }),
    fetch(`${base}/api/hotspots`, { next: { revalidate: 60 } }),
  ]);

  return {
    stats: statsRes.status === 'fulfilled' && statsRes.value.ok ? await statsRes.value.json() : null,
    alerts: alertsRes.status === 'fulfilled' && alertsRes.value.ok ? await alertsRes.value.json() : null,
    reports: reportsRes.status === 'fulfilled' && reportsRes.value.ok ? await reportsRes.value.json() : null,
    predictions: predictionsRes.status === 'fulfilled' && predictionsRes.value.ok ? await predictionsRes.value.json() : null,
    hotspots: hotspotsRes.status === 'fulfilled' && hotspotsRes.value.ok ? await hotspotsRes.value.json() : null,
  };
}

export default async function DashboardPage() {
  const { stats, alerts, reports, predictions, hotspots } = await getDashboardData();

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
