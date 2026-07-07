/**
 * POST /api/analyze
 *
 * Accepts a citizen-uploaded photo (base64) and returns a pollution
 * fingerprint analysis from Gemini AI.
 *
 * Request body:
 *   { imageBase64, imageUrl?, location: { lat, lng, address? }, timestamp?, description? }
 *
 * Response:
 *   { success, fingerprint?: PollutionFingerprint, error? }
 */

import { type NextRequest, NextResponse } from 'next/server';

import { analyzePollutionPhoto } from '@/lib/gemini';
import type { AnalyzePhotoRequest, AnalyzePhotoResponse } from '@/types/report';

// Simple in-memory rate limiter (per IP)
const requestCounts = new Map<string, { count: number; resetAt: number }>();
const MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS ?? '30', 10);
const WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS ?? '60000', 10);

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = requestCounts.get(ip);

  if (!entry || now > entry.resetAt) {
    requestCounts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }

  if (entry.count >= MAX_REQUESTS) {
    return false;
  }

  entry.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? 'unknown';
    if (!checkRateLimit(ip)) {
      return NextResponse.json<AnalyzePhotoResponse>(
        { success: false, error: 'Rate limit exceeded. Try again in a minute.' },
        { status: 429 },
      );
    }

    const body = (await request.json()) as AnalyzePhotoRequest;

    // Validate input
    if (!body.imageBase64 && !body.imageUrl) {
      return NextResponse.json<AnalyzePhotoResponse>(
        { success: false, error: 'Either imageBase64 or imageUrl is required' },
        { status: 400 },
      );
    }

    if (!body.location?.lat || !body.location?.lng) {
      return NextResponse.json<AnalyzePhotoResponse>(
        { success: false, error: 'Location with lat/lng is required' },
        { status: 400 },
      );
    }

    // Validate base64 size (max 10MB)
    if (body.imageBase64) {
      const sizeBytes = (body.imageBase64.length * 3) / 4;
      const maxSize = parseInt(process.env.MAX_IMAGE_SIZE_MB ?? '10', 10) * 1024 * 1024;
      if (sizeBytes > maxSize) {
        return NextResponse.json<AnalyzePhotoResponse>(
          { success: false, error: `Image too large. Maximum ${process.env.MAX_IMAGE_SIZE_MB ?? '10'}MB.` },
          { status: 400 },
        );
      }
    }

    // Detect MIME type from base64 header or default to JPEG
    let mimeType = 'image/jpeg';
    let imageData = body.imageBase64 ?? '';
    if (imageData.startsWith('data:')) {
      const match = imageData.match(/^data:(image\/\w+);base64,/);
      if (match) {
        mimeType = match[1] ?? 'image/jpeg';
        imageData = imageData.replace(/^data:image\/\w+;base64,/, '');
      }
    }

    // Call Gemini AI
    const fingerprint = await analyzePollutionPhoto(imageData, mimeType, {
      lat: body.location.lat,
      lng: body.location.lng,
      address: body.location.address,
      timestamp: body.timestamp,
      description: body.description,
    });

    return NextResponse.json<AnalyzePhotoResponse>({
      success: true,
      fingerprint,
    });
  } catch (error) {
    console.error('[/api/analyze] Error:', error);

    const message =
      error instanceof Error ? error.message : 'Unknown error during analysis';

    return NextResponse.json<AnalyzePhotoResponse>(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
