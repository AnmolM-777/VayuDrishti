import { FieldValue } from 'firebase-admin/firestore';

import { getAdminDb } from '@/lib/server/firebase-admin';
import {
  areaPredictionSchema,
  weatherDataSchema,
} from '@/lib/server/validation';
import { getSamplePrediction } from '@/lib/sample-data';
import type {
  AreaPrediction,
  PredictionRequest,
  WeatherData,
} from '@/types/prediction';
import type { AQICategory } from '@/types/station';

function categoryForAqi(aqi: number): AQICategory {
  if (aqi <= 50) return 'good';
  if (aqi <= 100) return 'satisfactory';
  if (aqi <= 200) return 'moderate';
  if (aqi <= 300) return 'poor';
  if (aqi <= 400) return 'very_poor';
  return 'severe';
}

function confidenceForHour(hour: number, windSpeed: number): number {
  const horizonPenalty = Math.min(0.28, hour * 0.012);
  const windPenalty = windSpeed < 1.5 ? 0.08 : 0;
  return Math.max(0.58, Math.min(0.92, 0.9 - horizonPenalty - windPenalty));
}

export async function generatePrediction(
  request: PredictionRequest,
): Promise<{ prediction: AreaPrediction; weather: WeatherData }> {
  const now = new Date();
  const sample = getSamplePrediction();
  const city = request.city ?? 'Delhi';
  const weather = weatherDataSchema.parse({
    temperature: 38,
    humidity: 55,
    windSpeed: 3.2,
    windDirection: 270,
    pressure: 1008,
    visibility: 3.5,
    rainfall: 0,
    cloudCover: 20,
    isInversion: false,
    timestamp: now.toISOString(),
  });

  const forecast = sample.forecast.map((entry, index) => {
    const weatherAdjustment = weather.windSpeed < 2 ? 8 : -4;
    const adjustedAqi = Math.max(
      0,
      Math.round(
        entry.predictedAqi + weatherAdjustment + (weather.isInversion ? 15 : 0),
      ),
    );

    return {
      ...entry,
      timestamp: new Date(now.getTime() + index * 60 * 60 * 1000).toISOString(),
      predictedAqi: adjustedAqi,
      category: categoryForAqi(adjustedAqi),
      confidence: confidenceForHour(index, weather.windSpeed),
      factors: {
        ...entry.factors,
        weather: weatherAdjustment / 50,
        wind: weather.windSpeed >= 3 ? -0.2 : 0.15,
      },
    };
  });

  const peak = forecast.reduce((max, entry) =>
    entry.predictedAqi > max.predictedAqi ? entry : max,
  );

  const prediction = areaPredictionSchema.parse({
    ...sample,
    id: `${city.toLowerCase().replace(/\s+/g, '-')}-${request.ward ?? 'city'}`,
    areaName: request.ward ?? sample.areaName,
    city,
    forecast,
    safeHours: forecast
      .filter((entry) => entry.predictedAqi <= 150)
      .map((entry) => entry.hour),
    peakHour: peak.hour,
    peakAqi: peak.predictedAqi,
    currentAqi: forecast[0]?.predictedAqi ?? sample.currentAqi,
    currentCategory: categoryForAqi(
      forecast[0]?.predictedAqi ?? sample.currentAqi,
    ),
    trend:
      forecast[23] &&
      forecast[0] &&
      forecast[23].predictedAqi < forecast[0].predictedAqi
        ? 'improving'
        : sample.trend,
    lastUpdated: now.toISOString(),
  });

  const db = getAdminDb();
  if (db) {
    await db
      .collection('predictions')
      .doc(prediction.id)
      .set(
        {
          ...prediction,
          weather,
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      )
      .catch(() => undefined);
  }

  return { prediction, weather };
}
