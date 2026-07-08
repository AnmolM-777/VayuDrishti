/**
 * GET /api/leaderboard
 *
 * Returns citizen sentinel leaderboard sorted by trust score.
 */

import { handleApiError, ok, requestId } from '@/lib/server/api';
import { requireApiUser } from '@/lib/server/auth';
import { getSampleUsers } from '@/lib/sample-data';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const id = requestId();
  const context = { route: '/api/leaderboard', requestId: id };

  try {
    await requireApiUser(request);
    const users = getSampleUsers()
      .sort((a, b) => b.trustScore - a.trustScore)
      .map((u, i) => ({ ...u, rank: i + 1 }));

    return ok({ success: true, users });
  } catch (error) {
    return handleApiError(error, context);
  }
}
