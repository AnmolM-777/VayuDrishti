'use client';

import { useState, useEffect } from 'react';
import type { UserProfile } from '@/types/user';
import { PageHeader } from '@/components/feedback/page-header';
import { LeaderboardTable } from '@/components/leaderboard/leaderboard-table';
import { UserImpact } from '@/components/leaderboard/user-impact';
import { BadgeDisplay } from '@/components/leaderboard/badge-display';
import { Trophy } from 'lucide-react';

export default function LeaderboardPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  // For demo: show top user's stats as "my profile"
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    fetch('/api/leaderboard')
      .then((r) => r.json())
      .then((data) => {
        const sorted = (data.users ?? []) as UserProfile[];
        setUsers(sorted);
        // Default: show top user stats
        if (sorted.length > 0 && sorted[0]) setSelectedUser(sorted[0]);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Citizen Leaderboard"
        description="Top environmental sentinels ranked by trust score and community impact."
      />

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-card border border-border rounded-xl h-16 animate-pulse" />
          ))}
        </div>
      ) : users.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Trophy className="size-12 text-muted-foreground mb-3" />
          <p className="font-medium">No leaderboard data available</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Main leaderboard */}
          <div className="xl:col-span-2">
            <LeaderboardTable users={users} />
          </div>

          {/* Sidebar: top user impact + badges */}
          <div className="space-y-4">
            {selectedUser && (
              <>
                <UserImpact
                  user={selectedUser}
                  rank={users.indexOf(selectedUser) + 1}
                />
                <BadgeDisplay user={selectedUser} />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
