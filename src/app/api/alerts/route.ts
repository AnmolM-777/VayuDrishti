/**
 * GET /api/alerts
 *
 * Fetches current pollution alerts.
 * Query params: ?status=active&priority=red (optional filters)
 */

import { type NextRequest, NextResponse } from 'next/server';

import { getSampleAlerts } from '@/lib/sample-data';
import type { PollutionAlert, AlertPriority, AlertStatus } from '@/types/alert';

export async function GET(request: NextRequest) {
  try {
    const status = request.nextUrl.searchParams.get('status') as AlertStatus | null;
    const priority = request.nextUrl.searchParams.get('priority') as AlertPriority | null;

    let alerts: PollutionAlert[] = getSampleAlerts();

    if (status) {
      alerts = alerts.filter((a) => a.status === status);
    }
    if (priority) {
      alerts = alerts.filter((a) => a.priority === priority);
    }

    // Sort by priority (highest first), then by creation time (newest first)
    const priorityOrder: AlertPriority[] = ['green', 'yellow', 'orange', 'red', 'purple'];
    alerts.sort((a, b) => {
      const pDiff = priorityOrder.indexOf(b.priority) - priorityOrder.indexOf(a.priority);
      if (pDiff !== 0) return pDiff;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return NextResponse.json({ success: true, alerts });
  } catch (error) {
    console.error('[/api/alerts] Error:', error);
    return NextResponse.json(
      { success: false, alerts: [], error: 'Failed to fetch alerts' },
      { status: 500 },
    );
  }
}
