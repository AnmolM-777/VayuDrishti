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
    <span className="text-sm font-bold text-muted-foreground tabular-nums w-6 text-center">{rank}</span>
  );
}

function TrustBar({ score }: { score: number }) {
  const level = score >= 86 ? 'champion' : score >= 71 ? 'sentinel' : score >= 51 ? 'guardian' : score >= 31 ? 'scout' : 'observer';
  const color = SENTINEL_LEVEL_CONFIG[level].color;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs font-mono font-semibold w-8 text-right">{score}</span>
    </div>
  );
}

export function LeaderboardTable({ users }: LeaderboardTableProps) {
  const sorted = [...users].sort((a, b) => b.trustScore - a.trustScore);

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
        <Trophy className="size-4 text-amber-400" />
        <h3 className="font-semibold">Top Citizen Sentinels</h3>
      </div>

      {/* Table */}
      <div className="divide-y divide-border">
        {sorted.map((user, idx) => {
          const levelCfg = SENTINEL_LEVEL_CONFIG[user.level];
          const rank = idx + 1;
          return (
            <div
              key={user.id}
              className={cn(
                'flex items-center gap-4 px-5 py-4 hover:bg-accent/50 transition-colors',
                rank <= 3 ? 'bg-amber-500/3' : '',
              )}
            >
              {/* Rank */}
              <div className="w-8 flex justify-center shrink-0">
                <RankBadge rank={rank} />
              </div>

              {/* Avatar */}
              <div
                className="size-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                style={{ backgroundColor: `${levelCfg.color}22`, color: levelCfg.color }}
              >
                {user.displayName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
              </div>

              {/* User info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-medium text-sm truncate">{user.displayName}</span>
                  <span className="text-xs shrink-0" title={levelCfg.label}>{levelCfg.emoji}</span>
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold shrink-0"
                    style={{ color: levelCfg.color, backgroundColor: `${levelCfg.color}18` }}
                  >
                    {levelCfg.label}
                  </span>
                </div>
                <TrustBar score={user.trustScore} />
              </div>

              {/* Stats */}
              <div className="hidden sm:grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs font-bold">{user.verifiedReports}</p>
                  <p className="text-[10px] text-muted-foreground">Reports</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-emerald-400">{user.impactStats.hotspotsDetected}</p>
                  <p className="text-[10px] text-muted-foreground">Hotspots</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-blue-400">{user.impactStats.deploymentsTriggered}</p>
                  <p className="text-[10px] text-muted-foreground">Dispatches</p>
                </div>
              </div>

              {/* Badges (top 3 only) */}
              <div className="hidden lg:flex gap-1 shrink-0">
                {user.badges.slice(0, 3).map((badge) => (
                  <span key={badge} title={BADGE_CONFIG[badge].label} className="text-base">
                    {BADGE_CONFIG[badge].emoji}
                  </span>
                ))}
                {user.badges.length > 3 && (
                  <span className="text-[10px] text-muted-foreground self-center">+{user.badges.length - 3}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
