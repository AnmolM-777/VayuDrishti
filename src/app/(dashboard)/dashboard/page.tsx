import type { Metadata } from 'next';
import { PageHeader } from '@/components/feedback/page-header';
import { EmptyState } from '@/components/feedback/empty-state';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Overview of air quality and pollution activity',
};

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Overview of air quality and pollution activity in your area."
      />
      <EmptyState
        iconName="LayoutDashboard"
        title="Dashboard coming soon"
        description="Real-time air quality metrics, recent reports, and activity summary will appear here."
      />
    </div>
  );
}
