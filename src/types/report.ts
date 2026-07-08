/**
 * Shared types for citizen pollution reports.
 * Used by both dashboard (Person A) and API routes (Person B).
 */

// ─── Pollution source classification ────────────────────────────────
export type PollutionSourceType =
  | 'garbage_burning'
  | 'industrial'
  | 'vehicle_exhaust'
  | 'construction_dust'
  | 'crop_burning'
  | 'road_dust'
  | 'unknown';

export type SeverityLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export type HealthRisk = 'low' | 'medium' | 'high' | 'critical';

export type ReportStatus =
  'pending' | 'analyzing' | 'verified' | 'rejected' | 'resolved';

// ─── Gemini AI analysis result ──────────────────────────────────────
export interface PollutionFingerprint {
  sourceType: PollutionSourceType;
  confidence: number; // 0.0 – 1.0
  severity: SeverityLevel;
  estimatedRadiusMeters: number;
  healthRisk: HealthRisk;
  description: string;
  recommendedAction: string;
  pollutants: string[]; // e.g. ['PM2.5', 'PM10', 'VOC']
  isNighttime: boolean;
  weatherVisible: 'clear' | 'hazy' | 'foggy' | 'rainy';
}

// ─── Geo-location ───────────────────────────────────────────────────
export interface GeoLocation {
  lat: number;
  lng: number;
  address?: string;
  ward?: string;
  city?: string;
}

// ─── Citizen report ─────────────────────────────────────────────────
export interface PollutionReport {
  id: string;
  userId: string;
  userName?: string;
  userAvatar?: string;
  timestamp: string; // ISO-8601
  location: GeoLocation;
  photoUrl: string;
  thumbnailUrl?: string;
  description?: string;
  aiAnalysis?: PollutionFingerprint;
  status: ReportStatus;
  upvotes: number;
  verifiedBy: string[]; // user IDs who corroborated
  municipalResponse?: {
    assignedTo: string;
    respondedAt: string;
    resolution: string;
  };
}

// ─── API request / response ────────────────────────────────────────
export interface AnalyzePhotoRequest {
  imageBase64?: string;
  imageUrl?: string;
  location: GeoLocation;
  timestamp?: string;
  description?: string;
}

export interface AnalyzePhotoResponse {
  success: boolean;
  fingerprint?: PollutionFingerprint;
  error?: string;
}

// ─── Source type display helpers ────────────────────────────────────
export const SOURCE_TYPE_CONFIG: Record<
  PollutionSourceType,
  { label: string; emoji: string; color: string }
> = {
  garbage_burning: { label: 'Garbage Burning', emoji: '🔥', color: '#ef4444' },
  industrial: { label: 'Industrial Emission', emoji: '🏭', color: '#f97316' },
  vehicle_exhaust: { label: 'Vehicle Exhaust', emoji: '🚗', color: '#eab308' },
  construction_dust: {
    label: 'Construction Dust',
    emoji: '🏗️',
    color: '#a3a3a3',
  },
  crop_burning: { label: 'Crop Burning', emoji: '🌾', color: '#dc2626' },
  road_dust: { label: 'Road Dust', emoji: '🛣️', color: '#78716c' },
  unknown: { label: 'Unknown Source', emoji: '❓', color: '#6b7280' },
};
