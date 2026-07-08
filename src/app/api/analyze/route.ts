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

import { handleApiError, ok, parseJson, requestId } from '@/lib/server/api';
import { requireApiUser } from '@/lib/server/auth';
import { enforceRateLimit, getClientIp } from '@/lib/server/rate-limit';
import { analyzePhotoRequestSchema } from '@/lib/server/validation';
import {
  analyzePollutionPhoto,
  analyzePollutionPhotoFromUrl,
} from '@/lib/gemini';
import type { AnalyzePhotoResponse } from '@/types/report';

const MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS ?? '12', 10);
const WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS ?? '60000', 10);
const ALLOWED_IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
]);

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const id = requestId();
  const context = { route: '/api/analyze', requestId: id };

  try {
    const user = await requireApiUser(request, [
      'citizen',
      'municipal',
      'reviewer',
    ]);
    const ip = getClientIp(request);
    enforceRateLimit(`analyze:${user.uid}:${ip}`, {
      maxRequests: MAX_REQUESTS,
      windowMs: WINDOW_MS,
    });

    const body = await parseJson(request, analyzePhotoRequestSchema);

    // Validate base64 size (max 10MB)
    if (body.imageBase64) {
      const sizeBytes = (body.imageBase64.length * 3) / 4;
      const maxSize =
        parseInt(process.env.MAX_IMAGE_SIZE_MB ?? '10', 10) * 1024 * 1024;
      if (sizeBytes > maxSize) {
        return NextResponse.json<AnalyzePhotoResponse>(
          {
            success: false,
            error: `Image too large. Maximum ${process.env.MAX_IMAGE_SIZE_MB ?? '10'}MB.`,
          },
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
    if (!ALLOWED_IMAGE_MIME_TYPES.has(mimeType)) {
      return NextResponse.json<AnalyzePhotoResponse>(
        { success: false, error: 'Unsupported image type' },
        { status: 400 },
      );
    }

    // Call Gemini AI
    const analysisContext = {
      lat: body.location.lat,
      lng: body.location.lng,
      address: body.location.address,
      timestamp: body.timestamp,
      description: body.description,
    };

    const fingerprint = imageData
      ? await analyzePollutionPhoto(imageData, mimeType, analysisContext)
      : await analyzePollutionPhotoFromUrl(body.imageUrl!, analysisContext);

    return ok<AnalyzePhotoResponse>({
      success: true,
      fingerprint,
    });
  } catch (error) {
    return handleApiError(error, context);
  }
}
