/**
 * Alert engine — generates alerts when hotspot severity exceeds thresholds.
 *
 * Priority scoring considers: severity × population density × proximity to sensitive locations.
 */

import type { PollutionHotspot } from '@/types/hotspot';
import type { PollutionAlert, AlertPriority } from '@/types/alert';

// ─── Priority determination ─────────────────────────────────────────
export function determineAlertPriority(
  estimatedAqi: number,
  severityScore: number,
): AlertPriority {
  if (estimatedAqi > 400 || severityScore >= 85) return 'purple';
  if (estimatedAqi > 300 || severityScore >= 65) return 'red';
  if (estimatedAqi > 200 || severityScore >= 45) return 'orange';
  if (estimatedAqi > 100 || severityScore >= 25) return 'yellow';
  return 'green';
}

// ─── Generate alert from hotspot ────────────────────────────────────
export function generateAlertFromHotspot(
  hotspot: PollutionHotspot,
): PollutionAlert {
  const estimatedAqi = hotspot.estimatedAqi ?? hotspot.severityScore * 4;
  const priority = determineAlertPriority(estimatedAqi, hotspot.severityScore);

  const sourceLabel = hotspot.sourceType.replace(/_/g, ' ');
  const locationLabel = hotspot.location.address ?? 'Unnamed location';

  const actionMap: Record<AlertPriority, string> = {
    green: 'Continue routine monitoring.',
    yellow: 'Increase monitoring frequency. Issue local advisory.',
    orange:
      'Deploy water sprinklers on surrounding roads. Issue air quality advisory.',
    red: 'Deploy water mist cannons + cleanup crew immediately. Issue public health advisory.',
    purple:
      'Emergency response. Deploy all available resources. Consider area evacuation.',
  };

  return {
    id: `alt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    priority,
    status: 'active',
    title: `${priority === 'purple' ? 'Emergency' : priority === 'red' ? 'Severe' : priority === 'orange' ? 'Hotspot' : 'Moderate'}: ${sourceLabel} at ${locationLabel}`,
    description: `${hotspot.reportCount} citizen reports confirm ${sourceLabel} near ${locationLabel}. Severity score: ${hotspot.severityScore}/100. AI confidence: ${Math.round(hotspot.avgConfidence * 100)}%.`,
    location: hotspot.location,
    radius: Math.max(hotspot.radius, 200),
    sourceType: hotspot.sourceType,
    estimatedAqi,
    hotspotId: hotspot.id,
    reportIds: hotspot.reportIds,
    createdAt: new Date().toISOString(),
    recommendedAction: actionMap[priority],
  };
}

// ─── Process hotspots into alerts ───────────────────────────────────
export function processHotspotsForAlerts(
  hotspots: PollutionHotspot[],
  minPriority: AlertPriority = 'yellow',
): PollutionAlert[] {
  const priorityOrder: AlertPriority[] = [
    'green',
    'yellow',
    'orange',
    'red',
    'purple',
  ];
  const minIndex = priorityOrder.indexOf(minPriority);

  return hotspots
    .filter((h) => h.status !== 'resolved' && h.status !== 'false_alarm')
    .map((h) => generateAlertFromHotspot(h))
    .filter((a) => priorityOrder.indexOf(a.priority) >= minIndex)
    .sort(
      (a, b) =>
        priorityOrder.indexOf(b.priority) - priorityOrder.indexOf(a.priority),
    );
}
