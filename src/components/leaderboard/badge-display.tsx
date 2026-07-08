'use client';

import type { UserProfile } from '@/types/user';
import { BADGE_CONFIG, SENTINEL_LEVEL_CONFIG } from '@/types/user';

interface BadgeDisplayProps {
  user: UserProfile;
}

export function BadgeDisplay({ user }: BadgeDisplayProps) {
  const levelCfg = SENTINEL_LEVEL_CONFIG[user.level];

  return (
    <div className="bg-card border-border rounded-xl border p-5">
      <h3 className="mb-4 font-semibold">Achievements & Badges</h3>

      {/* Sentinel level */}
      <div
        className="mb-4 flex items-center gap-3 rounded-lg p-3"
        style={{
          backgroundColor: `${levelCfg.color}12`,
          borderColor: `${levelCfg.color}30`,
          border: '1px solid',
        }}
      >
        <span className="text-3xl">{levelCfg.emoji}</span>
        <div>
          <p className="font-bold" style={{ color: levelCfg.color }}>
            {levelCfg.label}
          </p>
          <p className="text-muted-foreground text-xs">{levelCfg.perks}</p>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Score: {user.trustScore}/100
          </p>
        </div>
      </div>

      {/* Badges grid */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {user.badges.map((badge) => {
          const cfg = BADGE_CONFIG[badge];
          return (
            <div
              key={badge}
              className="bg-secondary border-border flex items-center gap-2 rounded-lg border p-2.5"
            >
              <span className="text-xl">{cfg.emoji}</span>
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold">{cfg.label}</p>
                <p className="text-muted-foreground truncate text-[10px]">
                  {cfg.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
