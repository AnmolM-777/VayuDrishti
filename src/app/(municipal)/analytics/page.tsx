import type { Metadata } from 'next';
import { PageHeader } from '@/components/feedback/page-header';
import { EmptyState } from '@/components/feedback/empty-state';

export const metadata: Metadata = {
  title: 'Analytics',
  description: 'Pollution analytics and prediction dashboard',
};

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description="Pollution trends, prediction accuracy, and municipal response metrics."
      />
      <EmptyState
        iconName="BarChart3"
        title="Analytics dashboard coming soon"
        description="Charts, trend analysis, and prediction metrics will appear here."
      />
    </div>
  );
}
