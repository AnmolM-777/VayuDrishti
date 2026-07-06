import type { Metadata } from 'next';
import { PageHeader } from '@/components/feedback/page-header';
import { EmptyState } from '@/components/feedback/empty-state';

export const metadata: Metadata = {
  title: 'Deployments',
  description: 'Track active cleanup deployments',
};

export default function DeploymentsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Active Deployments"
        description="Track active cleanup deployments and resource allocation."
      />
      <EmptyState
        iconName="Radio"
        title="No active deployments"
        description="Real-time deployment tracking with GPS and status updates will appear here."
      />
    </div>
  );
}
