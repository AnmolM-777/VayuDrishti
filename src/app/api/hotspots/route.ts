/**
 * GET /api/hotspots
 *
 * Fetches detected pollution hotspots.
 * Query params: ?status=detected&severity=critical (optional filters)
 */

import { NextRequest, NextResponse } from 'next/server';

import { getSampleHotspots } from '@/lib/sample-data';
import type { PollutionHotspot, HotspotStatus, HotspotSeverity } from '@/types/hotspot';

export async function GET(request: NextRequest) {
  try {
    const status = request.nextUrl.searchParams.get('status') as HotspotStatus | null;
    const severity = request.nextUrl.searchParams.get('severity') as HotspotSeverity | null;

    let hotspots: PollutionHotspot[] = getSampleHotspots();

    if (status) {
      hotspots = hotspots.filter((h) => h.status === status);
    }
    if (severity) {
      hotspots = hotspots.filter((h) => h.severity === severity);
    }

    // Sort by severity score (highest first)
    hotspots.sort((a, b) => b.severityScore - a.severityScore);

    return NextResponse.json({ success: true, hotspots });
  } catch (error) {
    console.error('[/api/hotspots] Error:', error);
    return NextResponse.json(
      { success: false, hotspots: [], error: 'Failed to fetch hotspots' },
      { status: 500 },
    );
  }
}
