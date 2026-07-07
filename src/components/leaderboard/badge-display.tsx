'use client';

import type { UserProfile } from '@/types/user';
import { BADGE_CONFIG, SENTINEL_LEVEL_CONFIG } from '@/types/user';
import { cn } from '@/lib/utils';

interface BadgeDisplayProps {
  user: UserProfile;
}

export function BadgeDisplay({ user }: BadgeDisplayProps) {
  const levelCfg = SENTINEL_LEVEL_CONFIG[user.level];

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <h3 className="font-semibold mb-4">Achievements & Badges</h3>

      {/* Sentinel level */}
      <div
        className="flex items-center gap-3 p-3 rounded-lg mb-4"
        style={{ backgroundColor: `${levelCfg.color}12`, borderColor: `${levelCfg.color}30`, border: '1px solid' }}
      >
        <span className="text-3xl">{levelCfg.emoji}</span>
        <div>
          <p className="font-bold" style={{ color: levelCfg.color }}>{levelCfg.label}</p>
          <p className="text-xs text-muted-foreground">{levelCfg.perks}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Score: {user.trustScore}/100</p>
        </div>
      </div>

      {/* Badges grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {user.badges.map((badge) => {
          const cfg = BADGE_CONFIG[badge];
          return (
            <div
              key={badge}
              className="flex items-center gap-2 p-2.5 rounded-lg bg-secondary border border-border"
            >
              <span className="text-xl">{cfg.emoji}</span>
              <div className="min-w-0">
                <p className="text-xs font-semibold truncate">{cfg.label}</p>
                <p className="text-[10px] text-muted-foreground truncate">{cfg.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
