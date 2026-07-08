/**
 * Types for citizen users, trust scores, and sentinel gamification.
 */

// ─── Sentinel levels ────────────────────────────────────────────────
export type SentinelLevel =
  'observer' | 'scout' | 'guardian' | 'sentinel' | 'champion';

// ─── Badge types ────────────────────────────────────────────────────
export type BadgeType =
  | 'first_report'
  | 'ten_reports'
  | 'fifty_reports'
  | 'hundred_reports'
  | 'night_watch'
  | 'monsoon_reporter'
  | 'hotspot_hunter'
  | 'community_validator'
  | 'streak_7_days'
  | 'streak_30_days';

// ─── User profile ───────────────────────────────────────────────────
export interface UserProfile {
  id: string;
  displayName: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
  trustScore: number; // 0–100
  level: SentinelLevel;
  totalReports: number;
  verifiedReports: number;
  falseFlagCount: number;
  badges: BadgeType[];
  impactStats: {
    deploymentsTriggered: number;
    hotspotsDetected: number;
    upvotesReceived: number;
  };
  preferredLanguage: string;
  city?: string;
  ward?: string;
  createdAt: string;
  lastActiveAt: string;
}

// ─── Trust score helpers ────────────────────────────────────────────
export function getSentinelLevel(trustScore: number): SentinelLevel {
  if (trustScore >= 86) return 'champion';
  if (trustScore >= 71) return 'sentinel';
  if (trustScore >= 51) return 'guardian';
  if (trustScore >= 31) return 'scout';
  return 'observer';
}

export const SENTINEL_LEVEL_CONFIG: Record<
  SentinelLevel,
  {
    label: string;
    emoji: string;
    color: string;
    minScore: number;
    perks: string;
  }
> = {
  observer: {
    label: 'Observer',
    emoji: '👁️',
    color: '#6b7280',
    minScore: 0,
    perks: 'Can submit reports. Reports need 2+ corroboration.',
  },
  scout: {
    label: 'Scout',
    emoji: '🔭',
    color: '#3b82f6',
    minScore: 31,
    perks: 'Reports auto-validated near sensor stations.',
  },
  guardian: {
    label: 'Guardian',
    emoji: '🛡️',
    color: '#22c55e',
    minScore: 51,
    perks: 'Reports trigger immediate alerts. Badge on leaderboard.',
  },
  sentinel: {
    label: 'Sentinel',
    emoji: '⚔️',
    color: '#f59e0b',
    minScore: 71,
    perks: "Can validate others' reports. Invited to municipal meetings.",
  },
  champion: {
    label: 'Champion',
    emoji: '🏆',
    color: '#8b5cf6',
    minScore: 86,
    perks: 'Featured on city leaderboard. Direct municipal contact.',
  },
};

export const BADGE_CONFIG: Record<
  BadgeType,
  { label: string; emoji: string; description: string }
> = {
  first_report: {
    label: 'First Report',
    emoji: '🌱',
    description: 'Submitted your first pollution report',
  },
  ten_reports: {
    label: 'Active Reporter',
    emoji: '📝',
    description: 'Submitted 10 pollution reports',
  },
  fifty_reports: {
    label: 'Pollution Warrior',
    emoji: '⚡',
    description: 'Submitted 50 pollution reports',
  },
  hundred_reports: {
    label: 'Century Hero',
    emoji: '💯',
    description: 'Submitted 100 pollution reports',
  },
  night_watch: {
    label: 'Night Watch',
    emoji: '🌙',
    description: 'Reported pollution between 10 PM – 6 AM',
  },
  monsoon_reporter: {
    label: 'Monsoon Reporter',
    emoji: '🌧️',
    description: 'Reported during monsoon season',
  },
  hotspot_hunter: {
    label: 'Hotspot Hunter',
    emoji: '🎯',
    description: 'Report led to hotspot detection',
  },
  community_validator: {
    label: 'Community Validator',
    emoji: '✅',
    description: 'Validated 20+ reports',
  },
  streak_7_days: {
    label: 'Week Streak',
    emoji: '🔥',
    description: '7-day consecutive reporting streak',
  },
  streak_30_days: {
    label: 'Month Streak',
    emoji: '💎',
    description: '30-day consecutive reporting streak',
  },
};
