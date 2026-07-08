/**
 * POST /api/dispatch
 *
 * Creates a new dispatch order — assigns a municipal resource to a hotspot.
 * Request body: { alertId, hotspotId, resourceId, notes? }
 */

import { handleApiError, ok, parseJson, requestId } from '@/lib/server/api';
import { requireApiUser } from '@/lib/server/auth';
import { createDispatchOrder, getDispatches } from '@/lib/server/repositories';
import { createDispatchRequestSchema } from '@/lib/server/validation';
import type { CreateDispatchResponse } from '@/types/alert';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const id = requestId();
  const context = { route: '/api/dispatch', requestId: id };

  try {
    const user = await requireApiUser(request, ['municipal']);
    const body = await parseJson(request, createDispatchRequestSchema);
    const dispatch = await createDispatchOrder({
      ...body,
      assignedBy: user.uid,
    });

    return ok<CreateDispatchResponse>({
      success: true,
      dispatch,
    });
  } catch (error) {
    return handleApiError(error, context);
  }
}

// GET — list all dispatches
export async function GET(request: Request) {
  const id = requestId();
  const context = { route: '/api/dispatch', requestId: id };

  try {
    await requireApiUser(request, ['municipal']);
    return ok({ success: true, dispatches: await getDispatches() });
  } catch (error) {
    return handleApiError(error, context);
  }
}
