import { z } from 'zod';

export const pollutionSourceSchema = z.enum([
  'garbage_burning',
  'industrial',
  'vehicle_exhaust',
  'construction_dust',
  'crop_burning',
  'road_dust',
  'unknown',
]);

export const healthRiskSchema = z.enum(['low', 'medium', 'high', 'critical']);
export const weatherVisibleSchema = z.enum(['clear', 'hazy', 'foggy', 'rainy']);

export const geoLocationSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  address: z.string().trim().max(300).optional(),
  ward: z.string().trim().max(100).optional(),
  city: z.string().trim().max(100).optional(),
});

export const pollutionFingerprintSchema = z.object({
  sourceType: pollutionSourceSchema,
  confidence: z.number().min(0).max(1),
  severity: z.number().int().min(1).max(10),
  estimatedRadiusMeters: z.number().min(10).max(5000),
  healthRisk: healthRiskSchema,
  description: z.string().trim().min(1).max(1000),
  recommendedAction: z.string().trim().min(1).max(1000),
  pollutants: z.array(z.string().trim().min(1).max(40)).max(12),
  isNighttime: z.boolean(),
  weatherVisible: weatherVisibleSchema,
});

export const analyzePhotoRequestSchema = z
  .object({
    imageBase64: z.string().trim().min(1).optional(),
    imageUrl: z.string().trim().url().optional(),
    location: geoLocationSchema,
    timestamp: z.string().datetime().optional(),
    description: z.string().trim().max(1000).optional(),
  })
  .refine((body) => body.imageBase64 || body.imageUrl, {
    message: 'Either imageBase64 or imageUrl is required',
    path: ['imageBase64'],
  });

export const reportStatusSchema = z.enum([
  'pending',
  'analyzing',
  'verified',
  'rejected',
  'resolved',
]);

export const createReportRequestSchema = z.object({
  location: geoLocationSchema,
  photoUrl: z.string().trim().max(2000).optional(),
  thumbnailUrl: z.string().trim().max(2000).optional(),
  description: z.string().trim().max(1000).optional(),
  aiAnalysis: pollutionFingerprintSchema.optional(),
  imageBase64: z.string().trim().optional(),
});

export const reportsQuerySchema = z.object({
  status: reportStatusSchema.optional(),
  sourceType: pollutionSourceSchema.optional(),
});

export const alertPrioritySchema = z.enum([
  'green',
  'yellow',
  'orange',
  'red',
  'purple',
]);
export const alertStatusSchema = z.enum([
  'active',
  'acknowledged',
  'dispatched',
  'resolved',
  'expired',
]);

export const alertsQuerySchema = z.object({
  status: alertStatusSchema.optional(),
  priority: alertPrioritySchema.optional(),
});

export const hotspotSeveritySchema = z.enum([
  'low',
  'medium',
  'high',
  'critical',
]);
export const hotspotStatusSchema = z.enum([
  'detected',
  'confirmed',
  'dispatched',
  'in_progress',
  'resolved',
  'false_alarm',
]);

export const hotspotsQuerySchema = z.object({
  status: hotspotStatusSchema.optional(),
  severity: hotspotSeveritySchema.optional(),
});

export const detectHotspotsRequestSchema = z.object({
  cityId: z.string().trim().max(100).optional(),
  windowHours: z.coerce.number().int().min(1).max(168).default(2),
  minReports: z.coerce.number().int().min(2).max(50).default(2),
  radiusMeters: z.coerce.number().int().min(50).max(5000).default(500),
});

export const createDispatchRequestSchema = z.object({
  alertId: z.string().trim().min(1).max(120),
  hotspotId: z.string().trim().min(1).max(120),
  resourceId: z.string().trim().min(1).max(120),
  notes: z.string().trim().max(1000).optional(),
});

export const predictionQuerySchema = z.object({
  city: z.string().trim().min(1).max(100).default('Delhi'),
  ward: z.string().trim().max(100).optional(),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
});

export const aqiCategorySchema = z.enum([
  'good',
  'satisfactory',
  'moderate',
  'poor',
  'very_poor',
  'severe',
]);

export const hourlyPredictionSchema = z.object({
  hour: z.number().int().min(0).max(23),
  timestamp: z.string().datetime(),
  predictedAqi: z.number().int().min(0).max(1000),
  category: aqiCategorySchema,
  confidence: z.number().min(0).max(1),
  pm25: z.number().min(0),
  pm10: z.number().min(0),
  dominantPollutant: z.string().trim().min(1).max(40),
  factors: z.object({
    weather: z.number().min(-1).max(1),
    historical: z.number().min(-1).max(1000),
    events: z.number().min(-1).max(1),
    wind: z.number().min(-1).max(1),
  }),
});

export const areaPredictionSchema = z.object({
  id: z.string().trim().min(1),
  areaName: z.string().trim().min(1),
  city: z.string().trim().min(1),
  currentAqi: z.number().int().min(0).max(1000),
  currentCategory: aqiCategorySchema,
  forecast: z.array(hourlyPredictionSchema).length(24),
  safeHours: z.array(z.number().int().min(0).max(23)),
  peakHour: z.number().int().min(0).max(23),
  peakAqi: z.number().int().min(0).max(1000),
  trend: z.enum(['improving', 'stable', 'worsening']),
  lastUpdated: z.string().datetime(),
});

export const weatherDataSchema = z.object({
  temperature: z.number().min(-20).max(60),
  humidity: z.number().min(0).max(100),
  windSpeed: z.number().min(0).max(80),
  windDirection: z.number().min(0).max(360),
  pressure: z.number().min(850).max(1100),
  visibility: z.number().min(0).max(50),
  rainfall: z.number().min(0).max(500),
  cloudCover: z.number().min(0).max(100),
  isInversion: z.boolean(),
  timestamp: z.string().datetime(),
});
