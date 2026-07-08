/**
 * GET /api/alerts
 *
 * Fetches current pollution alerts.
 * Query params: ?status=active&priority=red (optional filters)
 */

import { type NextRequest } from 'next/server';

import {
  handleApiError,
  ok,
  parseSearchParams,
  requestId,
} from '@/lib/server/api';
import { requireApiUser } from '@/lib/server/auth';
import { getAlerts } from '@/lib/server/repositories';
import { alertsQuerySchema } from '@/lib/server/validation';
import type { PollutionAlert } from '@/types/alert';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const id = requestId();
  const context = { route: '/api/alerts', requestId: id };

  try {
    await requireApiUser(request);
    const filters = parseSearchParams(
      request.nextUrl.searchParams,
      alertsQuerySchema,
    );
    const alerts: PollutionAlert[] = await getAlerts(filters);

    return ok({ success: true, alerts });
  } catch (error) {
    return handleApiError(error, context);
  }
}
