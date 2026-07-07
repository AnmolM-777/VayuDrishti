/**
 * Google Air Quality API client.
 *
 * Uses the same API key as Google Maps (Maps Platform).
 * Endpoint: https://airquality.googleapis.com/v1/currentConditions:lookup
 *
 * Fetches current AQI + pollutant breakdown for a lat/lng location.
 * We call it for each of Delhi's known monitoring station locations
 * to build a MonitoringStation[] compatible with the existing types.
 */

import type { MonitoringStation, StationReading, AQICategory } from '@/types/station';
import { getAQICategory } from '@/types/station';

const AIR_QUALITY_API = 'https://airquality.googleapis.com/v1/currentConditions:lookup';

// Delhi's major monitoring areas — we query AQI for each
const DELHI_MONITORING_LOCATIONS: Array<{
  id: string;
  name: string;
  ward: string;
  lat: number;
  lng: number;
}> = [
  { id: 'gaq-001', name: 'ITO',                   ward: 'ITO',            lat: 28.6289, lng: 77.2402 },
  { id: 'gaq-002', name: 'Anand Vihar',            ward: 'Anand Vihar',   lat: 28.6469, lng: 77.3164 },
  { id: 'gaq-003', name: 'R.K. Puram',             ward: 'RK Puram',      lat: 28.5631, lng: 77.1722 },
  { id: 'gaq-004', name: 'Punjabi Bagh',           ward: 'Punjabi Bagh',  lat: 28.6677, lng: 77.1317 },
  { id: 'gaq-005', name: 'Lodhi Road',             ward: 'Lodhi Colony',  lat: 28.5918, lng: 77.2281 },
  { id: 'gaq-006', name: 'Okhla Phase 2',          ward: 'Okhla',         lat: 28.5494, lng: 77.2802 },
  { id: 'gaq-007', name: 'Rohini',                 ward: 'Rohini',        lat: 28.7358, lng: 77.1218 },
  { id: 'gaq-008', name: 'Dwarka Sector 8',        ward: 'Dwarka',        lat: 28.5921, lng: 77.0512 },
];

// ─── API response types ───────────────────────────────────────────────

interface GoogleAQIIndex {
  code: string;        // 'uaqi' | 'ind_cpcb'
  displayName: string;
  aqi: number;
  aqiDisplay: string;
  color: { red: number; green: number; blue: number };
  category: string;
  dominantPollutant: string;
}

interface GooglePollutant {
  code: string;         // 'pm25' | 'pm10' | 'no2' | 'o3' | 'co' | 'so2'
  displayName: string;
  concentration: { value: number; units: string };
}

interface GoogleAQResponse {
  dateTime: string;
  regionCode: string;
  indexes: GoogleAQIIndex[];
  pollutants: GooglePollutant[];
}

// ─── Fetch one location ───────────────────────────────────────────────

async function fetchLocationAQ(
  lat: number,
  lng: number,
  apiKey: string,
): Promise<GoogleAQResponse | null> {
  try {
    const res = await fetch(`${AIR_QUALITY_API}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        universalAqi: true,
        location: { latitude: lat, longitude: lng },
        extraComputations: ['POLLUTANT_CONCENTRATION', 'LOCAL_AQI', 'HEALTH_RECOMMENDATIONS'],
        languageCode: 'en',
      }),
      next: { revalidate: 900 }, // cache 15 min
    });

    if (!res.ok) {
      console.warn(`[GoogleAQ] ${lat},${lng}: ${res.status} ${res.statusText}`);
      return null;
    }
    return (await res.json()) as GoogleAQResponse;
  } catch (err) {
    console.warn(`[GoogleAQ] fetch error for ${lat},${lng}:`, err);
    return null;
  }
}

// ─── Map Google response → StationReading ────────────────────────────

function toStationReading(data: GoogleAQResponse): StationReading {
  // Prefer CPCB index (India standard); fall back to universal
  const cpcb = data.indexes.find((i) => i.code === 'ind_cpcb');
  const universal = data.indexes.find((i) => i.code === 'uaqi');
  const index = cpcb ?? universal ?? data.indexes[0];

  const aqi = index?.aqi ?? 0;
  const dominantPollutant = index?.dominantPollutant ?? 'pm25';
  const category = getAQICategory(aqi);

  // Extract individual pollutants
  function getPollutant(code: string) {
    return data.pollutants?.find((p) => p.code === code)?.concentration?.value ?? 0;
  }

  return {
    aqi,
    category,
    dominantPollutant,
    pm25: getPollutant('pm25'),
    pm10: getPollutant('pm10'),
    no2: getPollutant('no2') || undefined,
    so2: getPollutant('so2') || undefined,
    co: getPollutant('co') || undefined,
    o3: getPollutant('o3') || undefined,
    timestamp: data.dateTime,
  };
}

// ─── Main export ─────────────────────────────────────────────────────

export async function fetchDelhiStationsViaGoogleAQ(): Promise<MonitoringStation[]> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey || apiKey === 'your_google_maps_api_key_here') {
    throw new Error('GOOGLE_MAPS_API_KEY is not configured');
  }

  // Fetch all locations in parallel (rate limit: 1000 req/day on free tier)
  const results = await Promise.allSettled(
    DELHI_MONITORING_LOCATIONS.map((loc) => fetchLocationAQ(loc.lat, loc.lng, apiKey)),
  );

  const stations: MonitoringStation[] = DELHI_MONITORING_LOCATIONS.map((loc, idx) => {
    const result = results[idx];
    const data = result.status === 'fulfilled' ? result.value : null;

    return {
      id: loc.id,
      name: loc.name,
      city: 'Delhi',
      state: 'Delhi',
      source: 'cpcb' as const,
      isActive: true,
      location: {
        lat: loc.lat,
        lng: loc.lng,
        address: loc.name,
        ward: loc.ward,
        city: 'Delhi',
      },
      latestReading: data ? toStationReading(data) : undefined,
    };
  });

  // Only return stations that got a successful reading
  return stations.filter((s) => s.latestReading !== undefined);
}
