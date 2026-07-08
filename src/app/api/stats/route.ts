/**
 * GET /api/stats
 *
 * Returns aggregated dashboard statistics.
 */

import { handleApiError, ok, requestId } from '@/lib/server/api';
import { requireApiUser } from '@/lib/server/auth';
import { getSampleStats } from '@/lib/sample-data';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const id = requestId();
  const context = { route: '/api/stats', requestId: id };

  try {
    await requireApiUser(request);
    const stats = getSampleStats();
    return ok({ success: true, ...stats });
  } catch (error) {
    return handleApiError(error, context);
  }
}
