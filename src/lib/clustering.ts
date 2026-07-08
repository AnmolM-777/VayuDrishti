/**
 * Spatial clustering for hotspot detection.
 *
 * Uses a simplified DBSCAN-like algorithm to group nearby pollution reports
 * into hotspots. When multiple reports cluster within a radius and time window,
 * a hotspot is created.
 */

import type { PollutionReport, GeoLocation } from '@/types/report';
import type { PollutionHotspot, HotspotSeverity } from '@/types/hotspot';
import { computeHotspotSeverity } from '@/types/hotspot';

// ─── Haversine distance (meters) ────────────────────────────────────
export function haversineDistance(a: GeoLocation, b: GeoLocation): number {
  const R = 6371000; // Earth radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return 2 * R * Math.asin(Math.sqrt(h));
}

// ─── Cluster centroid ───────────────────────────────────────────────
function computeCentroid(points: GeoLocation[]): GeoLocation {
  const sum = points.reduce(
    (acc, p) => ({ lat: acc.lat + p.lat, lng: acc.lng + p.lng }),
    { lat: 0, lng: 0 },
  );
  return {
    lat: sum.lat / points.length,
    lng: sum.lng / points.length,
  };
}

// ─── DBSCAN-like clustering ─────────────────────────────────────────
interface ClusterConfig {
  radiusMeters: number; // Max distance between reports in a cluster
  minReports: number; // Minimum reports to form a hotspot
  windowMs: number; // Time window in milliseconds
}

const DEFAULT_CONFIG: ClusterConfig = {
  radiusMeters: 500,
  minReports: 2,
  windowMs: 2 * 60 * 60 * 1000, // 2 hours
};

interface ReportCluster {
  reports: PollutionReport[];
  centroid: GeoLocation;
  radius: number;
}

export function clusterReports(
  reports: PollutionReport[],
  config: Partial<ClusterConfig> = {},
): ReportCluster[] {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const now = Date.now();

  // Filter to recent reports within time window
  const recent = reports.filter((r) => {
    const reportTime = new Date(r.timestamp).getTime();
    return now - reportTime <= cfg.windowMs;
  });

  if (recent.length < cfg.minReports) return [];

  // Simple greedy clustering (sufficient for hackathon scale)
  const visited = new Set<string>();
  const clusters: ReportCluster[] = [];

  for (const report of recent) {
    if (visited.has(report.id)) continue;

    // Find all nearby reports
    const neighbors: PollutionReport[] = [report];
    visited.add(report.id);

    for (const other of recent) {
      if (visited.has(other.id)) continue;
      const dist = haversineDistance(report.location, other.location);
      if (dist <= cfg.radiusMeters) {
        neighbors.push(other);
        visited.add(other.id);
      }
    }

    if (neighbors.length >= cfg.minReports) {
      const centroid = computeCentroid(neighbors.map((n) => n.location));
      const maxDist = Math.max(
        ...neighbors.map((n) => haversineDistance(centroid, n.location)),
      );
      clusters.push({
        reports: neighbors,
        centroid,
        radius: Math.max(maxDist, 100), // Minimum 100m radius
      });
    }
  }

  return clusters;
}

// ─── Convert clusters to hotspots ───────────────────────────────────
export function clustersToHotspots(
  clusters: ReportCluster[],
): PollutionHotspot[] {
  return clusters.map((cluster, index) => {
    const reports = cluster.reports;

    // Compute severity score (0–100)
    const avgSeverity =
      reports.reduce((sum, r) => sum + (r.aiAnalysis?.severity ?? 5), 0) /
      reports.length;
    const avgConfidence =
      reports.reduce((sum, r) => sum + (r.aiAnalysis?.confidence ?? 0.5), 0) /
      reports.length;
    const reportCountFactor = Math.min(reports.length / 5, 1); // More reports = higher confidence
    const severityScore = Math.round(
      avgSeverity * 8 * avgConfidence * (0.5 + 0.5 * reportCountFactor),
    );

    // Determine dominant source type
    const sourceCounts: Record<string, number> = {};
    for (const r of reports) {
      const src = r.aiAnalysis?.sourceType ?? 'unknown';
      sourceCounts[src] = (sourceCounts[src] ?? 0) + 1;
    }
    const dominantSource =
      Object.entries(sourceCounts).sort(([, a], [, b]) => b - a)[0]?.[0] ??
      'unknown';

    // Determine address from first report with address
    const address = reports.find((r) => r.location.address)?.location.address;

    const hotspot: PollutionHotspot = {
      id: `hotspot-${Date.now()}-${index}`,
      location: {
        ...cluster.centroid,
        address,
        city: reports[0]?.location.city,
      },
      radius: Math.round(cluster.radius),
      severity: computeHotspotSeverity(severityScore) as HotspotSeverity,
      severityScore,
      sourceType: dominantSource as PollutionHotspot['sourceType'],
      status: 'detected',
      detectedAt: new Date().toISOString(),
      reportIds: reports.map((r) => r.id),
      reportCount: reports.length,
      avgConfidence: Math.round(avgConfidence * 100) / 100,
      description: `${reports.length} reports of ${dominantSource.replace('_', ' ')} detected within ${Math.round(cluster.radius)}m radius.${address ? ` Near ${address}.` : ''}`,
    };

    return hotspot;
  });
}

// ─── Main detection function ────────────────────────────────────────
export function detectHotspots(
  reports: PollutionReport[],
  config?: Partial<ClusterConfig>,
): PollutionHotspot[] {
  const clusters = clusterReports(reports, config);
  return clustersToHotspots(clusters);
}
