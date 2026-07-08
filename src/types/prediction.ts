/**
 * Types for AQI prediction engine and weather data.
 */

import type { AQICategory } from './station';

// ─── Hourly prediction entry ────────────────────────────────────────
export interface HourlyPrediction {
  hour: number; // 0–23
  timestamp: string; // ISO-8601
  predictedAqi: number;
  category: AQICategory;
  confidence: number; // 0.0–1.0
  pm25: number;
  pm10: number;
  dominantPollutant: string;
  // Contributing factors
  factors: {
    weather: number; // -1 to 1 (negative = improves AQ)
    historical: number; // baseline from history
    events: number; // spike from special events
    wind: number; // wind dispersal factor
  };
}

// ─── Ward/area prediction ───────────────────────────────────────────
export interface AreaPrediction {
  id: string;
  areaName: string;
  city: string;
  currentAqi: number;
  currentCategory: AQICategory;
  forecast: HourlyPrediction[]; // 24 entries
  safeHours: number[]; // hours safe for outdoor activity
  peakHour: number; // worst hour (0–23)
  peakAqi: number;
  trend: 'improving' | 'stable' | 'worsening';
  lastUpdated: string;
}

// ─── Weather data used for predictions ──────────────────────────────
export interface WeatherData {
  temperature: number; // °C
  humidity: number; // %
  windSpeed: number; // m/s
  windDirection: number; // degrees (0 = N, 90 = E)
  pressure: number; // hPa
  visibility: number; // km
  rainfall: number; // mm in last hour
  cloudCover: number; // %
  isInversion: boolean; // temperature inversion detected
  timestamp: string;
}

// ─── Prediction API ─────────────────────────────────────────────────
export interface PredictionRequest {
  city?: string;
  ward?: string;
  lat?: number;
  lng?: number;
}

export interface PredictionResponse {
  success: boolean;
  prediction?: AreaPrediction;
  weather?: WeatherData;
  error?: string;
}
