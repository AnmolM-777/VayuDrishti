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
    <div className="bg-card border-border rounded-xl border p-5">
      <div className="mb-5 flex items-center gap-3">
        {/* Avatar */}
        <div
          className="flex size-12 items-center justify-center rounded-full text-lg font-bold"
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
        <div>
          <p className="font-semibold">{user.displayName}</p>
          <p className="text-muted-foreground text-xs">
            {levelCfg.emoji} {levelCfg.label} · Rank #{rank}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {stats.map(({ icon: Icon, label, value, verified, color }) => (
          <div
            key={label}
            className="bg-secondary border-border rounded-lg border p-3"
          >
            <Icon className="mb-2 size-4" style={{ color }} />
            <p className="text-xl font-bold" style={{ color }}>
              {value}
            </p>
            <p className="text-muted-foreground text-xs">{label}</p>
            {verified !== undefined && (
              <p className="text-muted-foreground mt-0.5 text-[10px]">
                {verified} verified
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Trust score bar */}
      <div className="border-border mt-4 border-t pt-4">
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Trust Score</span>
          <span className="font-bold" style={{ color: levelCfg.color }}>
            {user.trustScore}/100
          </span>
        </div>
        <div className="bg-secondary h-2 overflow-hidden rounded-full">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${user.trustScore}%`,
              backgroundColor: levelCfg.color,
            }}
          />
        </div>
        <p className="text-muted-foreground mt-1 text-[10px]">
          {levelCfg.perks}
        </p>
      </div>
    </div>
  );
}
