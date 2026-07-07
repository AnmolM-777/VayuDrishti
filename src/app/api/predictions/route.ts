/**
 * GET /api/predictions
 *
 * Returns 24-hour AQI predictions for a city/ward.
 * Query params: ?city=Delhi (optional)
 */

import { type NextRequest, NextResponse } from 'next/server';

import { getSamplePrediction } from '@/lib/sample-data';
import type { PredictionResponse } from '@/types/prediction';

export async function GET(request: NextRequest) {
  try {
    const city = request.nextUrl.searchParams.get('city') ?? 'Delhi';

    // In production, this would query Vertex AI or BigQuery ML.
    // For hackathon demo, use sample data with realistic daily patterns.
    const prediction = getSamplePrediction();

    const response: PredictionResponse = {
      success: true,
      prediction: {
        ...prediction,
        city,
      },
      weather: {
        temperature: 38,
        humidity: 55,
        windSpeed: 3.2,
        windDirection: 270,
        pressure: 1008,
        visibility: 3.5,
        rainfall: 0,
        cloudCover: 20,
        isInversion: false,
        timestamp: new Date().toISOString(),
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[/api/predictions] Error:', error);
    return NextResponse.json<PredictionResponse>(
      { success: false, error: 'Failed to generate predictions' },
      { status: 500 },
    );
  }
}

export const revalidate = 60;
