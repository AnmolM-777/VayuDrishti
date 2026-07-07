'use client';

import type { UserProfile } from '@/types/user';
import { SENTINEL_LEVEL_CONFIG } from '@/types/user';
import { FileText, Flame, Truck, ThumbsUp } from 'lucide-react';

interface UserImpactProps {
  user: UserProfile;
  rank: number;
}

export function UserImpact({ user, rank }: UserImpactProps) {
  const levelCfg = SENTINEL_LEVEL_CONFIG[user.level];

  const stats = [
    {
      icon: FileText,
      label: 'Reports Submitted',
      value: user.totalReports,
      verified: user.verifiedReports,
      color: '#3b82f6',
    },
    {
      icon: Flame,
      label: 'Hotspots Detected',
      value: user.impactStats.hotspotsDetected,
      color: '#f97316',
    },
    {
      icon: Truck,
      label: 'Dispatches Triggered',
      value: user.impactStats.deploymentsTriggered,
      color: '#8b5cf6',
    },
    {
      icon: ThumbsUp,
      label: 'Upvotes Received',
      value: user.impactStats.upvotesReceived,
      color: '#22c55e',
    },
  ];

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center gap-3 mb-5">
        {/* Avatar */}
        <div
          className="size-12 rounded-full flex items-center justify-center text-lg font-bold"
          style={{ backgroundColor: `${levelCfg.color}22`, color: levelCfg.color }}
        >
          {user.displayName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
        </div>
        <div>
          <p className="font-semibold">{user.displayName}</p>
          <p className="text-xs text-muted-foreground">
            {levelCfg.emoji} {levelCfg.label} · Rank #{rank}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {stats.map(({ icon: Icon, label, value, verified, color }) => (
          <div key={label} className="p-3 rounded-lg bg-secondary border border-border">
            <Icon className="size-4 mb-2" style={{ color }} />
            <p className="text-xl font-bold" style={{ color }}>{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
            {verified !== undefined && (
              <p className="text-[10px] text-muted-foreground mt-0.5">{verified} verified</p>
            )}
          </div>
        ))}
      </div>

      {/* Trust score bar */}
      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-muted-foreground">Trust Score</span>
          <span className="font-bold" style={{ color: levelCfg.color }}>{user.trustScore}/100</span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${user.trustScore}%`, backgroundColor: levelCfg.color }}
          />
        </div>
        <p className="text-[10px] text-muted-foreground mt-1">{levelCfg.perks}</p>
      </div>
    </div>
  );
}
