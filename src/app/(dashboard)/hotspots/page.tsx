import type { Metadata } from 'next';
import { PageHeader } from '@/components/feedback/page-header';
import { EmptyState } from '@/components/feedback/empty-state';

export const metadata: Metadata = {
  title: 'Hotspots',
  description: 'AI-detected pollution hotspots',
};

export default function HotspotsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Hotspots"
        description="AI-detected pollution hotspots clustered from citizen reports and sensor data."
      />
      <EmptyState
        iconName="Flame"
        title="No hotspots detected"
        description="AI-generated pollution hotspot clusters and heatmap data will appear here."
      />
    </div>
  );
}
