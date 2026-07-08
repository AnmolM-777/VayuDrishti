/**
 * GET /api/hotspots
 *
 * Fetches detected pollution hotspots.
 * Query params: ?status=detected&severity=critical (optional filters)
 */

import { type NextRequest } from 'next/server';

import {
  handleApiError,
  ok,
  parseSearchParams,
  requestId,
} from '@/lib/server/api';
import { requireApiUser } from '@/lib/server/auth';
import { getHotspots } from '@/lib/server/repositories';
import { hotspotsQuerySchema } from '@/lib/server/validation';
import type { PollutionHotspot } from '@/types/hotspot';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const id = requestId();
  const context = { route: '/api/hotspots', requestId: id };

  try {
    await requireApiUser(request);
    const filters = parseSearchParams(
      request.nextUrl.searchParams,
      hotspotsQuerySchema,
    );
    const hotspots: PollutionHotspot[] = await getHotspots(filters);

    return ok({ success: true, hotspots });
  } catch (error) {
    return handleApiError(error, context);
  }
}
