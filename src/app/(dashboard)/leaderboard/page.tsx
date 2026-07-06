import type { Metadata } from 'next';
import { PageHeader } from '@/components/feedback/page-header';
import { EmptyState } from '@/components/feedback/empty-state';

export const metadata: Metadata = {
  title: 'Leaderboard',
  description: 'Community trust scores and top contributors',
};

export default function LeaderboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Leaderboard"
        description="Community trust scores and top contributors."
      />
      <EmptyState
        iconName="Trophy"
        title="Leaderboard coming soon"
        description="Top citizen reporters ranked by trust score and verified report count will appear here."
      />
    </div>
  );
}
