/**
 * GET /api/reports
 *
 * Fetches citizen pollution reports.
 * Query params: ?status=pending&sourceType=garbage_burning (optional filters)
 */

import { type NextRequest, NextResponse } from 'next/server';

import { getSampleReports } from '@/lib/sample-data';
import type { PollutionReport, ReportStatus, PollutionSourceType } from '@/types/report';

export async function GET(request: NextRequest) {
  try {
    const status = request.nextUrl.searchParams.get('status') as ReportStatus | null;
    const sourceType = request.nextUrl.searchParams.get('sourceType') as PollutionSourceType | null;

    let reports: PollutionReport[] = getSampleReports();

    if (status) {
      reports = reports.filter((r) => r.status === status);
    }
    if (sourceType) {
      reports = reports.filter((r) => r.aiAnalysis?.sourceType === sourceType);
    }

    // Sort by timestamp (newest first)
    reports.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return NextResponse.json({ success: true, reports });
  } catch (error) {
    console.error('[/api/reports] Error:', error);
    return NextResponse.json(
      { success: false, reports: [], error: 'Failed to fetch reports' },
      { status: 500 },
    );
  }
}


