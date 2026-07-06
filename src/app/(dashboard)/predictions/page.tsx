import type { Metadata } from 'next';
import { PageHeader } from '@/components/feedback/page-header';
import { EmptyState } from '@/components/feedback/empty-state';

export const metadata: Metadata = {
  title: 'Predictions',
  description: '24-hour AQI predictions for your area',
};

export default function PredictionsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Predictions"
        description="AI-powered 24-hour AQI predictions for your area."
      />
      <EmptyState
        iconName="TrendingUp"
        title="Predictions engine coming soon"
        description="AQI forecast charts and pollutant-level breakdowns will appear here."
      />
    </div>
  );
}
