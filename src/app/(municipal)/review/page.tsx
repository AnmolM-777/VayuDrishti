import type { Metadata } from 'next';
import { PageHeader } from '@/components/feedback/page-header';
import { EmptyState } from '@/components/feedback/empty-state';

export const metadata: Metadata = {
  title: 'Review Reports',
  description: 'Review and verify citizen pollution reports',
};

export default function ReviewPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Review Reports"
        description="Review and verify citizen pollution reports for your jurisdiction."
      />
      <EmptyState
        iconName="ClipboardCheck"
        title="No reports pending review"
        description="Citizen-submitted pollution reports requiring verification will appear here."
      />
    </div>
  );
}
