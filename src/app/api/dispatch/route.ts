/**
 * POST /api/dispatch
 *
 * Creates a new dispatch order — assigns a municipal resource to a hotspot.
 * Request body: { alertId, hotspotId, resourceId, notes? }
 */

import { NextResponse } from 'next/server';

import { getSampleResources } from '@/lib/sample-data';
import type { CreateDispatchRequest, CreateDispatchResponse, DispatchOrder } from '@/types/alert';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateDispatchRequest;

    if (!body.alertId || !body.hotspotId || !body.resourceId) {
      return NextResponse.json<CreateDispatchResponse>(
        { success: false, error: 'alertId, hotspotId, and resourceId are required' },
        { status: 400 },
      );
    }

    // Find the resource
    const resources = getSampleResources();
    const resource = resources.find((r) => r.id === body.resourceId);

    if (!resource) {
      return NextResponse.json<CreateDispatchResponse>(
        { success: false, error: `Resource ${body.resourceId} not found` },
        { status: 404 },
      );
    }

    if (!resource.isAvailable) {
      return NextResponse.json<CreateDispatchResponse>(
        { success: false, error: `Resource ${resource.name} is not available` },
        { status: 409 },
      );
    }

    // Create dispatch order
    const dispatch: DispatchOrder = {
      id: `dsp-${Date.now()}`,
      alertId: body.alertId,
      hotspotId: body.hotspotId,
      resourceId: resource.id,
      resourceType: resource.type,
      resourceName: resource.name,
      status: 'assigned',
      targetLocation: resource.location, // Will be overridden by hotspot location
      assignedAt: new Date().toISOString(),
      eta: `${Math.floor(Math.random() * 15 + 5)} min`,
      distanceKm: Math.round((Math.random() * 8 + 2) * 10) / 10,
      notes: body.notes,
      assignedBy: 'demo-operator',
    };

    return NextResponse.json<CreateDispatchResponse>({
      success: true,
      dispatch,
    });
  } catch (error) {
    console.error('[/api/dispatch] Error:', error);
    return NextResponse.json<CreateDispatchResponse>(
      { success: false, error: 'Failed to create dispatch' },
      { status: 500 },
    );
  }
}

// GET — list all dispatches
export async function GET() {
  const { getSampleDispatches } = await import('@/lib/sample-data');
  return NextResponse.json({ success: true, dispatches: getSampleDispatches() });
}
