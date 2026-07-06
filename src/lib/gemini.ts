/**
 * Gemini AI client for pollution source fingerprinting.
 *
 * Uses Google Gemini 2.5 Flash multimodal to analyze citizen-uploaded
 * photos and classify pollution sources with structured JSON output.
 */

import { GoogleGenAI } from '@google/genai';

import type { PollutionFingerprint } from '@/types/report';

// ─── Client singleton ───────────────────────────────────────────────
let client: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  if (client) return client;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      'GEMINI_API_KEY is not set. Get one at https://aistudio.google.com/apikey',
    );
  }
  client = new GoogleGenAI({ apiKey });
  return client;
}

// ─── System prompt ──────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are VayuDrishti's environmental forensics AI — an expert in visually identifying air pollution sources in Indian urban, peri-urban, and rural contexts.

When shown a citizen-uploaded photo:
1. Determine if air pollution is visible (smoke, dust, haze, smog, open burning, emissions).
2. Classify the PRIMARY pollution source from this list:
   - "garbage_burning"    — open waste burning, coloured smoke, visible flames on debris
   - "industrial"         — factory/chimney stacks, continuous plumes, industrial area
   - "vehicle_exhaust"    — dense traffic, visible tailpipe smoke, smog at intersections
   - "construction_dust"  — demolition/construction sites, exposed earth, concrete dust
   - "crop_burning"       — large agricultural fires, stubble burning, open fields
   - "road_dust"          — unpaved roads, dry conditions, wind-blown dust
   - "unknown"            — pollution visible but source unclear
3. If NO pollution is visible at all, still respond but set severity to 1 and sourceType to "unknown".
4. Estimate severity (1–10) based on smoke density, visibility reduction, and affected area.
5. Provide a practical recommended action for Indian municipal authorities.

Always be specific to Indian conditions — mention local context (nala, chowk, mandi, etc.) when evident.
Be conservative with confidence scores; only exceed 0.85 if the evidence is unambiguous.`;

// ─── Response schema for structured output ──────────────────────────
const FINGERPRINT_SCHEMA = {
  type: 'object' as const,
  properties: {
    sourceType: {
      type: 'string' as const,
      enum: [
        'garbage_burning',
        'industrial',
        'vehicle_exhaust',
        'construction_dust',
        'crop_burning',
        'road_dust',
        'unknown',
      ],
      description: 'Primary pollution source classification',
    },
    confidence: {
      type: 'number' as const,
      description: 'Confidence in classification (0.0 to 1.0)',
    },
    severity: {
      type: 'number' as const,
      description: 'Severity on a 1–10 scale',
    },
    estimatedRadiusMeters: {
      type: 'number' as const,
      description: 'Estimated affected radius in meters',
    },
    healthRisk: {
      type: 'string' as const,
      enum: ['low', 'medium', 'high', 'critical'],
      description: 'Immediate health risk level',
    },
    description: {
      type: 'string' as const,
      description: 'Brief description of what is visible in the photo',
    },
    recommendedAction: {
      type: 'string' as const,
      description: 'Specific action for municipal authorities',
    },
    pollutants: {
      type: 'array' as const,
      items: { type: 'string' as const },
      description: 'Likely pollutants being emitted (PM2.5, PM10, SO2, NOx, VOC, CO)',
    },
    isNighttime: {
      type: 'boolean' as const,
      description: 'Whether the photo appears to be taken at night',
    },
    weatherVisible: {
      type: 'string' as const,
      enum: ['clear', 'hazy', 'foggy', 'rainy'],
      description: 'Visible weather/atmospheric conditions',
    },
  },
  required: [
    'sourceType',
    'confidence',
    'severity',
    'estimatedRadiusMeters',
    'healthRisk',
    'description',
    'recommendedAction',
    'pollutants',
    'isNighttime',
    'weatherVisible',
  ],
};

// ─── Context builder ────────────────────────────────────────────────
interface AnalysisContext {
  lat?: number;
  lng?: number;
  address?: string;
  timestamp?: string;
  description?: string;
  nearbyStationAqi?: number;
}

function buildContextPrompt(context: AnalysisContext): string {
  const parts: string[] = ['Analyze this citizen-uploaded photo for pollution sources.'];

  if (context.address) {
    parts.push(`📍 Location: ${context.address}`);
  }
  if (context.lat && context.lng) {
    parts.push(`🗺️ Coordinates: ${context.lat.toFixed(4)}, ${context.lng.toFixed(4)}`);
  }
  if (context.timestamp) {
    const d = new Date(context.timestamp);
    const hour = d.getHours();
    const timeOfDay =
      hour < 6 ? 'early morning' : hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : hour < 20 ? 'evening' : 'night';
    parts.push(`🕐 Time: ${d.toLocaleString('en-IN')} (${timeOfDay})`);
  }
  if (context.nearbyStationAqi) {
    parts.push(`📊 Nearest CPCB station AQI: ${context.nearbyStationAqi}`);
  }
  if (context.description) {
    parts.push(`📝 Citizen description: "${context.description}"`);
  }

  return parts.join('\n');
}

// ─── Main analysis function ─────────────────────────────────────────
export async function analyzePollutionPhoto(
  imageBase64: string,
  mimeType: string = 'image/jpeg',
  context: AnalysisContext = {},
): Promise<PollutionFingerprint> {
  const ai = getClient();

  const contextPrompt = buildContextPrompt(context);

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [
      {
        role: 'user',
        parts: [
          {
            inlineData: {
              mimeType,
              data: imageBase64,
            },
          },
          { text: contextPrompt },
        ],
      },
    ],
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: 'application/json',
      responseSchema: FINGERPRINT_SCHEMA,
      temperature: 0.2, // Low temperature for consistent classification
      maxOutputTokens: 1024,
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error('Gemini returned empty response');
  }

  const parsed = JSON.parse(text) as PollutionFingerprint;

  // Clamp values to valid ranges
  parsed.confidence = Math.max(0, Math.min(1, parsed.confidence));
  parsed.severity = Math.max(1, Math.min(10, Math.round(parsed.severity))) as PollutionFingerprint['severity'];
  parsed.estimatedRadiusMeters = Math.max(10, Math.min(5000, parsed.estimatedRadiusMeters));

  return parsed;
}

// ─── URL-based analysis (for photos already in Cloud Storage) ───────
export async function analyzePollutionPhotoFromUrl(
  imageUrl: string,
  context: AnalysisContext = {},
): Promise<PollutionFingerprint> {
  const ai = getClient();
  const contextPrompt = buildContextPrompt(context);

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [
      {
        role: 'user',
        parts: [
          {
            fileData: {
              mimeType: 'image/jpeg',
              fileUri: imageUrl,
            },
          },
          { text: contextPrompt },
        ],
      },
    ],
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: 'application/json',
      responseSchema: FINGERPRINT_SCHEMA,
      temperature: 0.2,
      maxOutputTokens: 1024,
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error('Gemini returned empty response');
  }

  const parsed = JSON.parse(text) as PollutionFingerprint;
  parsed.confidence = Math.max(0, Math.min(1, parsed.confidence));
  parsed.severity = Math.max(1, Math.min(10, Math.round(parsed.severity))) as PollutionFingerprint['severity'];
  parsed.estimatedRadiusMeters = Math.max(10, Math.min(5000, parsed.estimatedRadiusMeters));

  return parsed;
}
