import type { Metadata } from 'next';
import { PageHeader } from '@/components/feedback/page-header';
import { EmptyState } from '@/components/feedback/empty-state';

export const metadata: Metadata = {
  title: 'Alerts',
  description: 'Pollution and air quality alerts',
};

export default function AlertsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Alerts"
        description="Pollution spike alerts and air quality notifications."
      />
      <EmptyState
        iconName="Bell"
        title="No active alerts"
        description="Multilingual pollution alerts and push notifications will appear here."
      />
    </div>
  );
}
