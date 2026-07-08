/**
 * GET /api/stations
 *
 * Fetches monitoring station data.
 * Priority:
 *   1. Google Air Quality API (uses GOOGLE_MAPS_API_KEY)
 *   2. OpenAQ v3 (uses OPENAQ_API_KEY)
 *   3. Sample data fallback (always works, for demo mode)
 *
 * Returns: { success, stations: MonitoringStation[], lastSynced }
 */

import { type NextRequest, NextResponse } from 'next/server';

import {
  ApiError,
  handleApiError,
  ok,
  requestId,
  withTimeout,
} from '@/lib/server/api';
import { requireApiUser } from '@/lib/server/auth';
import type { StationsResponse } from '@/types/station';

// In-memory cache to avoid hammering APIs
let cache: { data: StationsResponse; expiresAt: number } | null = null;
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes
const SOURCE_TIMEOUT_MS = 10_000;

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const id = requestId();
  const context = { route: '/api/stations', requestId: id };

  try {
    await requireApiUser(request);

    // Serve from cache if fresh
    if (cache && Date.now() < cache.expiresAt) {
      return ok(cache.data, { headers: { 'X-Data-Source': 'cache' } });
    }

    let stations = null;
    let source = 'sample';

    // ── 1. Try Google Air Quality API ─────────────────────────────────
    const googleKey = process.env.GOOGLE_MAPS_API_KEY;
    if (googleKey && googleKey !== 'your_google_maps_api_key_here') {
      try {
        const { fetchDelhiStationsViaGoogleAQ } =
          await import('@/lib/google-air-quality');
        const googleStations = await withTimeout(
          fetchDelhiStationsViaGoogleAQ(),
          SOURCE_TIMEOUT_MS,
          'Google Air Quality station fetch',
        );
        if (googleStations.length > 0) {
          stations = googleStations;
          source = 'google_aq';
        }
      } catch (err) {
        console.warn(
          '[/api/stations] Google AQ failed:',
          err instanceof Error ? err.message : err,
        );
      }
    }

    // ── 2. Try OpenAQ if Google AQ didn't work ────────────────────────
    if (!stations) {
      const openaqKey = process.env.OPENAQ_API_KEY;
      if (openaqKey && openaqKey !== 'your_openaq_api_key_here') {
        try {
          const { fetchDelhiStationsWithReadings } =
            await import('@/lib/openaq');
          const openaqStations = await withTimeout(
            fetchDelhiStationsWithReadings(),
            SOURCE_TIMEOUT_MS,
            'OpenAQ station fetch',
          );
          if (openaqStations.length > 0) {
            stations = openaqStations;
            source = 'openaq';
          }
        } catch (err) {
          console.warn(
            '[/api/stations] OpenAQ failed:',
            err instanceof Error ? err.message : err,
          );
        }
      }
    }

    // ── 3. Fall back to sample data ────────────────────────────────────
    if (!stations) {
      const { getSampleStations } = await import('@/lib/sample-data');
      stations = getSampleStations();
      source = 'sample';
    }

    const response: StationsResponse = {
      success: true,
      stations,
      lastSynced: new Date().toISOString(),
    };

    // Add source header for debugging
    const nextResponse = NextResponse.json(response);
    nextResponse.headers.set('X-Data-Source', source);

    cache = { data: response, expiresAt: Date.now() + CACHE_TTL_MS };
    return nextResponse;
  } catch (error) {
    if (
      error instanceof ApiError &&
      ['auth_required', 'auth_unavailable', 'forbidden'].includes(error.code)
    ) {
      return handleApiError(error, context);
    }

    // Last-resort fallback
    try {
      const { getSampleStations } = await import('@/lib/sample-data');
      const fallback: StationsResponse = {
        success: true,
        stations: getSampleStations(),
        lastSynced: new Date().toISOString(),
      };
      return NextResponse.json(fallback);
    } catch {
      return NextResponse.json<StationsResponse>(
        { success: false, stations: [], error: 'Failed to fetch station data' },
        { status: 500 },
      );
    }
  }
}
