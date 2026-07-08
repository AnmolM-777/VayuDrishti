/**
 * OpenAQ v3 client for fetching India CPCB station data.
 *
 * OpenAQ provides free access to government air quality monitoring stations,
 * including India's CPCB network. API key is free from explore.openaq.org/register.
 */

import type { MonitoringStation, StationReading } from '@/types/station';
import { getAQICategory } from '@/types/station';

const BASE_URL = 'https://api.openaq.org/v3';

function getHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  // OpenAQ v3 doesn't strictly require an API key for basic access,
  // but having one raises rate limits significantly.
  const apiKey = process.env.OPENAQ_API_KEY;
  if (apiKey) {
    headers['X-API-Key'] = apiKey;
  }
  return headers;
}

// ─── Fetch locations (stations) in India ────────────────────────────
interface OpenAQLocation {
  id: number;
  name: string;
  city?: { name: string } | null;
  country: { code: string; name: string };
  coordinates: { latitude: number; longitude: number };
  providers: Array<{ name: string }>;
  sensors: Array<{
    id: number;
    name: string;
    parameter: {
      id: number;
      name: string;
      units: string;
      displayName: string;
    };
  }>;
  isMonitor: boolean;
  isMobile: boolean;
  locality?: string;
  timezone?: string;
  datetimeFirst?: { utc: string };
  datetimeLast?: { utc: string };
}

interface OpenAQLocationsResponse {
  meta: { found: number; limit: number; page: number };
  results: OpenAQLocation[];
}

export async function fetchIndiaStations(
  city?: string,
  limit: number = 100,
): Promise<MonitoringStation[]> {
  const params = new URLSearchParams({
    country_id: '101', // India
    limit: String(limit),
    order_by: 'id',
    sort_order: 'asc',
  });

  const response = await fetch(`${BASE_URL}/locations?${params}`, {
    headers: getHeaders(),
    next: { revalidate: 3600 }, // Cache for 1 hour
  });

  if (!response.ok) {
    throw new Error(
      `OpenAQ API error: ${response.status} ${response.statusText}`,
    );
  }

  const data = (await response.json()) as OpenAQLocationsResponse;

  let stations = data.results
    .filter((loc) => loc.coordinates?.latitude && loc.coordinates?.longitude)
    .map((loc): MonitoringStation => ({
      id: `openaq-${loc.id}`,
      name: loc.name,
      city: loc.city?.name ?? 'Unknown',
      state: '',
      location: {
        lat: loc.coordinates.latitude,
        lng: loc.coordinates.longitude,
        city: loc.city?.name,
      },
      source: 'openaq',
      isActive: true,
    }));

  // Filter by city if specified
  if (city) {
    const cityLower = city.toLowerCase();
    stations = stations.filter(
      (s) =>
        s.city.toLowerCase().includes(cityLower) ||
        s.name.toLowerCase().includes(cityLower),
    );
  }

  return stations;
}

// ─── Fetch latest measurements for a station ────────────────────────
interface OpenAQMeasurement {
  period: { datetimeTo: { utc: string } };
  value: number;
  parameter: {
    id: number;
    name: string;
    units: string;
    displayName: string;
  };
}

interface OpenAQMeasurementsResponse {
  meta: { found: number };
  results: OpenAQMeasurement[];
}

export async function fetchStationMeasurements(
  locationId: number,
): Promise<StationReading | null> {
  const response = await fetch(
    `${BASE_URL}/locations/${locationId}/measurements?limit=20&order_by=datetime&sort_order=desc`,
    {
      headers: getHeaders(),
      next: { revalidate: 900 }, // Cache for 15 minutes
    },
  );

  if (!response.ok) return null;

  const data = (await response.json()) as OpenAQMeasurementsResponse;
  if (!data.results.length) return null;

  // Build reading from latest measurements
  const reading: Partial<StationReading> = {
    timestamp:
      data.results[0]?.period?.datetimeTo?.utc ?? new Date().toISOString(),
  };

  for (const m of data.results) {
    const name = m.parameter.name.toLowerCase();
    const value = m.value;
    if (name === 'pm25' || name === 'pm2.5') reading.pm25 = value;
    else if (name === 'pm10') reading.pm10 = value;
    else if (name === 'no2') reading.no2 = value;
    else if (name === 'so2') reading.so2 = value;
    else if (name === 'co') reading.co = value;
    else if (name === 'o3') reading.o3 = value;
  }

  // Compute AQI from PM2.5 (simplified Indian AQI formula)
  const pm25 = reading.pm25 ?? 0;
  reading.aqi = computeIndianAQI(pm25);
  reading.category = getAQICategory(reading.aqi);
  reading.dominantPollutant = 'PM2.5';

  return reading as StationReading;
}

// ─── Simplified Indian AQI computation from PM2.5 ──────────────────
// Based on CPCB National Air Quality Index breakpoints
function computeIndianAQI(pm25: number): number {
  const breakpoints = [
    { cLow: 0, cHigh: 30, iLow: 0, iHigh: 50 },
    { cLow: 31, cHigh: 60, iLow: 51, iHigh: 100 },
    { cLow: 61, cHigh: 90, iLow: 101, iHigh: 200 },
    { cLow: 91, cHigh: 120, iLow: 201, iHigh: 300 },
    { cLow: 121, cHigh: 250, iLow: 301, iHigh: 400 },
    { cLow: 251, cHigh: 500, iLow: 401, iHigh: 500 },
  ];

  for (const bp of breakpoints) {
    if (pm25 >= bp.cLow && pm25 <= bp.cHigh) {
      return Math.round(
        ((bp.iHigh - bp.iLow) / (bp.cHigh - bp.cLow)) * (pm25 - bp.cLow) +
          bp.iLow,
      );
    }
  }

  return pm25 > 500 ? 500 : 0;
}

// ─── Fetch all Delhi stations with their latest readings ────────────
export async function fetchDelhiStationsWithReadings(): Promise<
  MonitoringStation[]
> {
  const stations = await fetchIndiaStations('Delhi', 50);

  // Fetch readings in parallel (batch of 5 to avoid rate limits)
  const batchSize = 5;
  for (let i = 0; i < stations.length; i += batchSize) {
    const batch = stations.slice(i, i + batchSize);
    const readings = await Promise.allSettled(
      batch.map((s) => {
        const openaqId = parseInt(s.id.replace('openaq-', ''), 10);
        return fetchStationMeasurements(openaqId);
      }),
    );

    for (let j = 0; j < batch.length; j++) {
      const result = readings[j] as
        | PromiseSettledResult<
            Awaited<ReturnType<typeof fetchStationMeasurements>>
          >
        | undefined;
      if (result && result.status === 'fulfilled' && result.value) {
        const station = stations[i + j];
        if (station) station.latestReading = result.value;
      }
    }
  }

  return stations;
}
