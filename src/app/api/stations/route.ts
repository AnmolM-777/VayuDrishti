/**
 * GET /api/stations
 *
 * Fetches monitoring station data from OpenAQ (CPCB network).
 * Query params: ?city=Delhi (optional, defaults to env NEXT_PUBLIC_APP_DEFAULT_CITY)
 *
 * Returns: { success, stations: MonitoringStation[], lastSynced }
 */

import { NextRequest, NextResponse } from 'next/server';

import { fetchIndiaStations, fetchDelhiStationsWithReadings } from '@/lib/openaq';
import type { StationsResponse } from '@/types/station';

// In-memory cache to avoid hammering OpenAQ
let cache: { data: StationsResponse; expiresAt: number } | null = null;
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

export async function GET(request: NextRequest) {
  try {
    const city =
      request.nextUrl.searchParams.get('city') ??
      process.env.NEXT_PUBLIC_APP_DEFAULT_CITY ??
      'Delhi';

    // Check cache
    if (cache && Date.now() < cache.expiresAt) {
      return NextResponse.json(cache.data);
    }

    let stations;
    if (city.toLowerCase() === 'delhi') {
      stations = await fetchDelhiStationsWithReadings();
    } else {
      stations = await fetchIndiaStations(city);
    }

    const response: StationsResponse = {
      success: true,
      stations,
      lastSynced: new Date().toISOString(),
    };

    // Update cache
    cache = { data: response, expiresAt: Date.now() + CACHE_TTL_MS };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[/api/stations] Error:', error);

    // Graceful fallback: return sample stations when OpenAQ key is missing/invalid
    // This lets the app run in demo mode without an OpenAQ API key
    const { getSampleStations } = await import('@/lib/sample-data');
    const sampleStations = getSampleStations();
    if (sampleStations.length > 0) {
      console.warn('[/api/stations] Falling back to sample station data');
      const fallback: StationsResponse = {
        success: true,
        stations: sampleStations,
        lastSynced: new Date().toISOString(),
      };
      cache = { data: fallback, expiresAt: Date.now() + CACHE_TTL_MS };
      return NextResponse.json(fallback);
    }

    return NextResponse.json<StationsResponse>(
      {
        success: false,
        stations: [],
        error: error instanceof Error ? error.message : 'Failed to fetch station data',
      },
      { status: 500 },
    );
  }
}
