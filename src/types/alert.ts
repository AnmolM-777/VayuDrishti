/**
 * Types for the alert and dispatch system.
 * Alerts are generated when hotspots exceed severity thresholds.
 * Dispatches assign municipal resources to respond.
 */

import type { GeoLocation, PollutionSourceType } from './report';

// ─── Alert priority levels ──────────────────────────────────────────
export type AlertPriority = 'green' | 'yellow' | 'orange' | 'red' | 'purple';

export type AlertStatus = 'active' | 'acknowledged' | 'dispatched' | 'resolved' | 'expired';

// ─── Pollution alert ────────────────────────────────────────────────
export interface PollutionAlert {
  id: string;
  priority: AlertPriority;
  status: AlertStatus;
  title: string;
  description: string;
  location: GeoLocation;
  radius: number;
  sourceType: PollutionSourceType;
  estimatedAqi: number;
  hotspotId?: string;
  reportIds: string[];
  createdAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  recommendedAction: string;
  affectedPopulation?: number;
  nearbySchools?: string[];
  nearbyHospitals?: string[];
}

// ─── Dispatch resource types ────────────────────────────────────────
export type ResourceType =
  | 'water_mist_cannon'
  | 'cleanup_crew'
  | 'fire_brigade'
  | 'inspection_team'
  | 'road_sweeper';

export type DispatchStatus =
  | 'pending'
  | 'assigned'
  | 'en_route'
  | 'on_site'
  | 'completed'
  | 'cancelled';

// ─── Municipal resource ─────────────────────────────────────────────
export interface MunicipalResource {
  id: string;
  type: ResourceType;
  name: string;
  location: GeoLocation;
  isAvailable: boolean;
  assignedDispatchId?: string;
  lastDeployedAt?: string;
  capacity?: string; // e.g. '5000L tank', '4-person crew'
}

// ─── Dispatch order ─────────────────────────────────────────────────
export interface DispatchOrder {
  id: string;
  alertId: string;
  hotspotId: string;
  resourceId: string;
  resourceType: ResourceType;
  resourceName: string;
  status: DispatchStatus;
  targetLocation: GeoLocation;
  assignedAt: string;
  departedAt?: string;
  arrivedAt?: string;
  completedAt?: string;
  eta?: string;
  routePolyline?: string; // encoded polyline for map
  distanceKm?: number;
  aqiBefore?: number;
  aqiAfter?: number;
  notes?: string;
  assignedBy: string; // user ID of municipal operator
}

// ─── API types ──────────────────────────────────────────────────────
export interface CreateDispatchRequest {
  alertId: string;
  hotspotId: string;
  resourceId: string;
  notes?: string;
}

export interface CreateDispatchResponse {
  success: boolean;
  dispatch?: DispatchOrder;
  error?: string;
}

// ─── Display helpers ────────────────────────────────────────────────
export const ALERT_PRIORITY_CONFIG: Record<
  AlertPriority,
  { label: string; color: string; bgColor: string; aqiRange: string; action: string }
> = {
  green: {
    label: 'Normal',
    color: '#22c55e',
    bgColor: '#dcfce7',
    aqiRange: '0–100',
    action: 'Routine monitoring',
  },
  yellow: {
    label: 'Moderate',
    color: '#eab308',
    bgColor: '#fef9c3',
    aqiRange: '101–200',
    action: 'Increase monitoring frequency',
  },
  orange: {
    label: 'Hotspot Detected',
    color: '#f97316',
    bgColor: '#ffedd5',
    aqiRange: '201–300',
    action: 'Deploy water sprinklers',
  },
  red: {
    label: 'Severe',
    color: '#ef4444',
    bgColor: '#fee2e2',
    aqiRange: '301–400',
    action: 'Deploy mist cannons + cleanup crew',
  },
  purple: {
    label: 'Emergency',
    color: '#7c3aed',
    bgColor: '#ede9fe',
    aqiRange: '400+',
    action: 'Emergency response + public advisory',
  },
};

export const RESOURCE_TYPE_CONFIG: Record<
  ResourceType,
  { label: string; emoji: string; description: string }
> = {
  water_mist_cannon: {
    label: 'Water Mist Cannon',
    emoji: '💨',
    description: 'Anti-smog gun for PM2.5/PM10 suppression',
  },
  cleanup_crew: {
    label: 'Cleanup Crew',
    emoji: '🧹',
    description: 'Manual cleanup team for waste removal',
  },
  fire_brigade: {
    label: 'Fire Brigade',
    emoji: '🚒',
    description: 'Fire response unit for active burning',
  },
  inspection_team: {
    label: 'Inspection Team',
    emoji: '🔍',
    description: 'Environmental inspection officers',
  },
  road_sweeper: {
    label: 'Road Sweeper',
    emoji: '🚛',
    description: 'Mechanical road sweeping vehicle',
  },
};

export const DISPATCH_STATUS_CONFIG: Record<
  DispatchStatus,
  { label: string; color: string }
> = {
  pending: { label: 'Pending', color: '#6b7280' },
  assigned: { label: 'Assigned', color: '#3b82f6' },
  en_route: { label: 'En Route', color: '#f59e0b' },
  on_site: { label: 'On Site', color: '#8b5cf6' },
  completed: { label: 'Completed', color: '#22c55e' },
  cancelled: { label: 'Cancelled', color: '#ef4444' },
};
