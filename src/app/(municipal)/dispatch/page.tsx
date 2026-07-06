import type { Metadata } from 'next';
import { PageHeader } from '@/components/feedback/page-header';
import { EmptyState } from '@/components/feedback/empty-state';

export const metadata: Metadata = {
  title: 'Dispatch',
  description: 'Dispatch cleanup resources to pollution hotspots',
};

export default function DispatchPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dispatch"
        description="Dispatch cleanup teams and resources to verified pollution hotspots."
      />
      <EmptyState
        iconName="Truck"
        title="No dispatches needed"
        description="Resource dispatch orders and team assignments will appear here."
      />
    </div>
  );
}
