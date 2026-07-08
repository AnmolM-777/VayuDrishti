'use client';

import type { UserProfile } from '@/types/user';
import { SENTINEL_LEVEL_CONFIG, BADGE_CONFIG } from '@/types/user';
import { cn } from '@/lib/utils';
import { Trophy } from 'lucide-react';

interface LeaderboardTableProps {
  users: UserProfile[];
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <span className="text-xl">🥇</span>;
  if (rank === 2) return <span className="text-xl">🥈</span>;
  if (rank === 3) return <span className="text-xl">🥉</span>;
  return (
    <span className="text-muted-foreground w-6 text-center text-sm font-bold tabular-nums">
      {rank}
    </span>
  );
}

function TrustBar({ score }: { score: number }) {
  const level =
    score >= 86
      ? 'champion'
      : score >= 71
        ? 'sentinel'
        : score >= 51
          ? 'guardian'
          : score >= 31
            ? 'scout'
            : 'observer';
  const color = SENTINEL_LEVEL_CONFIG[level].color;
  return (
    <div className="flex items-center gap-2">
      <div className="bg-secondary h-1.5 flex-1 overflow-hidden rounded-full">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
      <span className="w-8 text-right font-mono text-xs font-semibold">
        {score}
      </span>
    </div>
  );
}

export function LeaderboardTable({ users }: LeaderboardTableProps) {
  const sorted = [...users].sort((a, b) => b.trustScore - a.trustScore);

  return (
    <div className="bg-card border-border overflow-hidden rounded-xl border">
      {/* Header */}
      <div className="border-border flex items-center gap-3 border-b px-5 py-4">
        <Trophy className="size-4 text-amber-400" />
        <h3 className="font-semibold">Top Citizen Sentinels</h3>
      </div>

      {/* Table */}
      <div className="divide-border divide-y">
        {sorted.map((user, idx) => {
          const levelCfg = SENTINEL_LEVEL_CONFIG[user.level];
          const rank = idx + 1;
          return (
            <div
              key={user.id}
              className={cn(
                'hover:bg-accent/50 flex items-center gap-4 px-5 py-4 transition-colors',
                rank <= 3 ? 'bg-amber-500/3' : '',
              )}
            >
              {/* Rank */}
              <div className="flex w-8 shrink-0 justify-center">
                <RankBadge rank={rank} />
              </div>

              {/* Avatar */}
              <div
                className="flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-bold"
                style={{
                  backgroundColor: `${levelCfg.color}22`,
                  color: levelCfg.color,
                }}
              >
                {user.displayName
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)}
              </div>

              {/* User info */}
              <div className="min-w-0 flex-1">
                <div className="mb-0.5 flex items-center gap-2">
                  <span className="truncate text-sm font-medium">
                    {user.displayName}
                  </span>
                  <span className="shrink-0 text-xs" title={levelCfg.label}>
                    {levelCfg.emoji}
                  </span>
                  <span
                    className="shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold"
                    style={{
                      color: levelCfg.color,
                      backgroundColor: `${levelCfg.color}18`,
                    }}
                  >
                    {levelCfg.label}
                  </span>
                </div>
                <TrustBar score={user.trustScore} />
              </div>

              {/* Stats */}
              <div className="hidden grid-cols-3 gap-4 text-center sm:grid">
                <div>
                  <p className="text-xs font-bold">{user.verifiedReports}</p>
                  <p className="text-muted-foreground text-[10px]">Reports</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-emerald-400">
                    {user.impactStats.hotspotsDetected}
                  </p>
                  <p className="text-muted-foreground text-[10px]">Hotspots</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-blue-400">
                    {user.impactStats.deploymentsTriggered}
                  </p>
                  <p className="text-muted-foreground text-[10px]">
                    Dispatches
                  </p>
                </div>
              </div>

              {/* Badges (top 3 only) */}
              <div className="hidden shrink-0 gap-1 lg:flex">
                {user.badges.slice(0, 3).map((badge) => (
                  <span
                    key={badge}
                    title={BADGE_CONFIG[badge].label}
                    className="text-base"
                  >
                    {BADGE_CONFIG[badge].emoji}
                  </span>
                ))}
                {user.badges.length > 3 && (
                  <span className="text-muted-foreground self-center text-[10px]">
                    +{user.badges.length - 3}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
