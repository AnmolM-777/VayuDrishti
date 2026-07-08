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

import { type NextRequest } from 'next/server';

import { detectHotspots } from '@/lib/clustering';
import { handleApiError, ok, requestId } from '@/lib/server/api';
import { requireApiUser } from '@/lib/server/auth';
import { getReports, upsertHotspots } from '@/lib/server/repositories';
import { detectHotspotsRequestSchema } from '@/lib/server/validation';
import type { DetectHotspotsResponse } from '@/types/hotspot';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const id = requestId();
  const context = { route: '/api/hotspots/detect', requestId: id };

  try {
    await requireApiUser(request, ['municipal', 'reviewer']);
    const body = await request
      .clone()
      .json()
      .catch(() => ({}));
    const parsed = detectHotspotsRequestSchema.parse(body);
    const reports = await getReports();
    const hotspots = detectHotspots(reports, {
      radiusMeters: parsed.radiusMeters,
      minReports: parsed.minReports,
      windowMs: parsed.windowHours * 60 * 60 * 1000,
    });
    await upsertHotspots(hotspots);

    const response: DetectHotspotsResponse = {
      success: true,
      hotspotsCreated: hotspots.length,
      hotspotsUpdated: 0,
      hotspots,
    };

    return ok(response);
  } catch (error) {
    return handleApiError(error, context);
  }
}
