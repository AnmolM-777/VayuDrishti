/**
 * Types for AI-detected pollution hotspots.
 * Hotspots are created when multiple citizen reports cluster in the same area.
 */

import type { GeoLocation, PollutionSourceType } from './report';

// ─── Hotspot status lifecycle ───────────────────────────────────────
export type HotspotStatus =
  | 'detected' // AI detected, needs verification
  | 'confirmed' // Verified by multiple reports or municipal officer
  | 'dispatched' // Cleanup resources assigned
  | 'in_progress' // Cleanup underway
  | 'resolved' // Hotspot cleared
  | 'false_alarm'; // Not a real hotspot

// ─── Hotspot severity ───────────────────────────────────────────────
export type HotspotSeverity = 'low' | 'medium' | 'high' | 'critical';

// ─── Pollution hotspot ──────────────────────────────────────────────
export interface PollutionHotspot {
  id: string;
  location: GeoLocation;
  radius: number; // meters
  severity: HotspotSeverity;
  severityScore: number; // 0–100 computed score
  sourceType: PollutionSourceType;
  status: HotspotStatus;
  detectedAt: string;
  confirmedAt?: string;
  resolvedAt?: string;
  reportIds: string[]; // contributing report IDs
  reportCount: number;
  avgConfidence: number; // average AI confidence across reports
  estimatedAqi?: number;
  description: string;
  dispatch?: {
    dispatchId: string;
    resourceType: string;
    assignedAt: string;
    eta?: string;
  };
}

// ─── Hotspot detection request ──────────────────────────────────────
export interface DetectHotspotsRequest {
  cityId?: string;
  windowHours?: number; // Time window for clustering (default: 2)
  minReports?: number; // Minimum reports to form hotspot (default: 2)
  radiusMeters?: number; // Clustering radius (default: 500)
}

export interface DetectHotspotsResponse {
  success: boolean;
  hotspotsCreated: number;
  hotspotsUpdated: number;
  hotspots: PollutionHotspot[];
  error?: string;
}

// ─── Severity helpers ───────────────────────────────────────────────
export function computeHotspotSeverity(score: number): HotspotSeverity {
  if (score >= 75) return 'critical';
  if (score >= 50) return 'high';
  if (score >= 25) return 'medium';
  return 'low';
}

export const HOTSPOT_SEVERITY_CONFIG: Record<
  HotspotSeverity,
  { label: string; color: string; bgColor: string; icon: string }
> = {
  low: { label: 'Low', color: '#22c55e', bgColor: '#dcfce7', icon: '🟢' },
  medium: { label: 'Medium', color: '#eab308', bgColor: '#fef9c3', icon: '🟡' },
  high: { label: 'High', color: '#f97316', bgColor: '#ffedd5', icon: '🟠' },
  critical: {
    label: 'Critical',
    color: '#ef4444',
    bgColor: '#fee2e2',
    icon: '🔴',
  },
};

export const HOTSPOT_STATUS_CONFIG: Record<
  HotspotStatus,
  { label: string; color: string }
> = {
  detected: { label: 'Detected', color: '#eab308' },
  confirmed: { label: 'Confirmed', color: '#f97316' },
  dispatched: { label: 'Dispatched', color: '#3b82f6' },
  in_progress: { label: 'In Progress', color: '#8b5cf6' },
  resolved: { label: 'Resolved', color: '#22c55e' },
  false_alarm: { label: 'False Alarm', color: '#6b7280' },
};
