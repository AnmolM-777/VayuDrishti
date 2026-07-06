/**
 * POST /api/hotspots/detect
 *
 * Runs hotspot detection on recent reports.
 * In a production system, this would be triggered by Firestore
 * listeners or Cloud Functions. For the hackathon, it runs on-demand.
 *
 * Request body (optional):
 *   { windowHours?: 2, minReports?: 2, radiusMeters?: 500 }
 *
 * Response:
 *   { success, hotspotsCreated, hotspotsUpdated, hotspots[] }
 */

import { NextRequest, NextResponse } from 'next/server';

import { detectHotspots } from '@/lib/clustering';
import { getSampleReports } from '@/lib/sample-data';
import type { DetectHotspotsRequest, DetectHotspotsResponse } from '@/types/hotspot';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as DetectHotspotsRequest;

    const windowHours = body.windowHours ?? 2;
    const minReports = body.minReports ?? 2;
    const radiusMeters = body.radiusMeters ?? 500;

    // In production, fetch from Firestore.
    // For hackathon demo, use sample data + any stored reports.
    const reports = getSampleReports();

    const hotspots = detectHotspots(reports, {
      radiusMeters,
      minReports,
      windowMs: windowHours * 60 * 60 * 1000,
    });

    const response: DetectHotspotsResponse = {
      success: true,
      hotspotsCreated: hotspots.length,
      hotspotsUpdated: 0,
      hotspots,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[/api/hotspots/detect] Error:', error);
    return NextResponse.json<DetectHotspotsResponse>(
      {
        success: false,
        hotspotsCreated: 0,
        hotspotsUpdated: 0,
        hotspots: [],
        error: error instanceof Error ? error.message : 'Hotspot detection failed',
      },
      { status: 500 },
    );
  }
}
