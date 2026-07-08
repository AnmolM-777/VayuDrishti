/**
 * GET /api/reports
 *
 * Fetches citizen pollution reports.
 * Query params: ?status=pending&sourceType=garbage_burning (optional filters)
 */

import { type NextRequest } from 'next/server';

import {
  handleApiError,
  ok,
  parseJson,
  parseSearchParams,
  requestId,
} from '@/lib/server/api';
import { requireApiUser } from '@/lib/server/auth';
import { createReport, getReports } from '@/lib/server/repositories';
import {
  createReportRequestSchema,
  reportsQuerySchema,
} from '@/lib/server/validation';
import type { PollutionFingerprint, PollutionReport } from '@/types/report';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const id = requestId();
  const context = { route: '/api/reports', requestId: id };

  try {
    await requireApiUser(request);
    const filters = parseSearchParams(
      request.nextUrl.searchParams,
      reportsQuerySchema,
    );
    const reports: PollutionReport[] = await getReports(filters);

    return ok({ success: true, reports });
  } catch (error) {
    return handleApiError(error, context);
  }
}

export async function POST(request: NextRequest) {
  const id = requestId();
  const context = { route: '/api/reports', requestId: id };

  try {
    const user = await requireApiUser(request, [
      'citizen',
      'municipal',
      'reviewer',
    ]);
    const body = await parseJson(request, createReportRequestSchema);
    const report = await createReport({
      userId: user.uid,
      userName: user.email ?? (user.isDemo ? 'Demo User' : undefined),
      location: body.location,
      photoUrl: body.photoUrl ?? '/sample/citizen-upload.jpg',
      thumbnailUrl: body.thumbnailUrl,
      description: body.description,
      aiAnalysis: body.aiAnalysis as PollutionFingerprint | undefined,
      status: body.aiAnalysis ? 'pending' : 'analyzing',
    });

    return ok({ success: true, report }, { status: 201 });
  } catch (error) {
    return handleApiError(error, context);
  }
}
