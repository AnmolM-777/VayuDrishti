import { ApiError } from '@/lib/server/api';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, RateLimitEntry>();

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0]?.trim() ?? 'unknown';
  return request.headers.get('x-real-ip') ?? 'unknown';
}

export function enforceRateLimit(
  key: string,
  options: { maxRequests: number; windowMs: number },
): void {
  const now = Date.now();

  for (const [bucketKey, entry] of buckets.entries()) {
    if (entry.resetAt <= now) buckets.delete(bucketKey);
  }

  const entry = buckets.get(key);
  if (!entry || entry.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + options.windowMs });
    return;
  }

  if (entry.count >= options.maxRequests) {
    throw new ApiError(
      429,
      'rate_limited',
      'Rate limit exceeded. Try again later.',
    );
  }

  entry.count++;
}
