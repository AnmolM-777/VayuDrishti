/**
 * Types for CPCB / OpenAQ monitoring stations and readings.
 */

import type { GeoLocation } from './report';

// ─── AQI categories (Indian NAQI standard) ─────────────────────────
export type AQICategory =
  | 'good'        // 0–50
  | 'satisfactory' // 51–100
  | 'moderate'     // 101–200
  | 'poor'         // 201–300
  | 'very_poor'    // 301–400
  | 'severe';      // 401–500+

// ─── Individual pollutant reading ───────────────────────────────────
export interface PollutantReading {
  parameter: string; // 'pm25', 'pm10', 'no2', 'so2', 'co', 'o3'
  value: number;
  unit: string;      // 'µg/m³', 'ppm'
  lastUpdated: string;
}

// ─── Station air quality reading ────────────────────────────────────
export interface StationReading {
  aqi: number;
  category: AQICategory;
  dominantPollutant: string;
  pm25: number;
  pm10: number;
  no2?: number;
  so2?: number;
  co?: number;
  o3?: number;
  temperature?: number;
  humidity?: number;
  windSpeed?: number;
  windDirection?: number;
  timestamp: string;
}

// ─── Monitoring station ─────────────────────────────────────────────
export interface MonitoringStation {
  id: string;
  name: string;
  city: string;
  state: string;
  location: GeoLocation;
  source: 'cpcb' | 'openaq' | 'safar' | 'manual';
  isActive: boolean;
  latestReading?: StationReading;
}

// ─── API response ───────────────────────────────────────────────────
export interface StationsResponse {
  success: boolean;
  stations: MonitoringStation[];
  lastSynced?: string;
  error?: string;
}

// ─── AQI category helpers ───────────────────────────────────────────
export function getAQICategory(aqi: number): AQICategory {
  if (aqi <= 50) return 'good';
  if (aqi <= 100) return 'satisfactory';
  if (aqi <= 200) return 'moderate';
  if (aqi <= 300) return 'poor';
  if (aqi <= 400) return 'very_poor';
  return 'severe';
}

export const AQI_CATEGORY_CONFIG: Record<
  AQICategory,
  { label: string; color: string; textColor: string; emoji: string; healthAdvice: string }
> = {
  good: {
    label: 'Good',
    color: '#22c55e',
    textColor: '#ffffff',
    emoji: '😊',
    healthAdvice: 'Air quality is satisfactory. Enjoy outdoor activities.',
  },
  satisfactory: {
    label: 'Satisfactory',
    color: '#84cc16',
    textColor: '#ffffff',
    emoji: '🙂',
    healthAdvice: 'Some pollutants may affect very sensitive people.',
  },
  moderate: {
    label: 'Moderate',
    color: '#eab308',
    textColor: '#000000',
    emoji: '😐',
    healthAdvice: 'May cause breathing discomfort for sensitive people.',
  },
  poor: {
    label: 'Poor',
    color: '#f97316',
    textColor: '#ffffff',
    emoji: '😷',
    healthAdvice: 'May cause breathing discomfort for most people on prolonged exposure.',
  },
  very_poor: {
    label: 'Very Poor',
    color: '#ef4444',
    textColor: '#ffffff',
    emoji: '🤢',
    healthAdvice: 'May cause respiratory illness on prolonged exposure. Avoid outdoor activity.',
  },
  severe: {
    label: 'Severe',
    color: '#991b1b',
    textColor: '#ffffff',
    emoji: '☠️',
    healthAdvice: 'Health alert: everyone may experience serious health effects. Stay indoors.',
  },
};
