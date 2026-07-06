import type { Metadata } from 'next';
import { PageHeader } from '@/components/feedback/page-header';
import { EmptyState } from '@/components/feedback/empty-state';

export const metadata: Metadata = {
  title: 'Pollution Map',
  description: 'Live pollution map with sensor data and citizen reports',
};

export default function MapPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Pollution Map"
        description="Live pollution map with sensor data and citizen reports."
      />
      <EmptyState
        iconName="Map"
        title="Map integration coming soon"
        description="Google Maps with heatmaps, sensor overlays, and satellite imagery will appear here."
      />
    </div>
  );
}
