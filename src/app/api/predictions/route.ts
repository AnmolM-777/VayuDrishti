/**
 * GET /api/predictions
 *
 * Returns 24-hour AQI predictions for a city/ward.
 * Query params: ?city=Delhi (optional)
 */

import { type NextRequest } from 'next/server';

import {
  handleApiError,
  ok,
  parseSearchParams,
  requestId,
} from '@/lib/server/api';
import { requireApiUser } from '@/lib/server/auth';
import { generatePrediction } from '@/lib/server/prediction-service';
import { predictionQuerySchema } from '@/lib/server/validation';
import type { PredictionResponse } from '@/types/prediction';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const id = requestId();
  const context = { route: '/api/predictions', requestId: id };

  try {
    await requireApiUser(request);
    const query = parseSearchParams(
      request.nextUrl.searchParams,
      predictionQuerySchema,
    );
    const { prediction, weather } = await generatePrediction(query);
    const response: PredictionResponse = {
      success: true,
      prediction,
      weather,
    };

    return ok(response);
  } catch (error) {
    return handleApiError(error, context);
  }
}
