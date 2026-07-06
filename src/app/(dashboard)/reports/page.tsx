import type { Metadata } from 'next';
import { PageHeader } from '@/components/feedback/page-header';
import { EmptyState } from '@/components/feedback/empty-state';

export const metadata: Metadata = {
  title: 'Reports',
  description: 'Submit and track pollution reports',
};

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Submit and track pollution reports in your neighbourhood."
      />
      <EmptyState
        iconName="FileText"
        title="No reports yet"
        description="Citizen pollution reports with photo evidence and AI analysis will appear here."
      />
    </div>
  );
}
