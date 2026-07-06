/**
 * GET /api/stats
 *
 * Returns aggregated dashboard statistics.
 */

import { NextResponse } from 'next/server';

import { getSampleStats } from '@/lib/sample-data';

export async function GET() {
  try {
    const stats = getSampleStats();
    return NextResponse.json({ success: true, ...stats });
  } catch (error) {
    console.error('[/api/stats] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stats' },
      { status: 500 },
    );
  }
}
