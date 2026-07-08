import { NextResponse } from 'next/server';
import { ZodError, type ZodSchema } from 'zod';

type LogLevel = 'info' | 'warn' | 'error';

interface LogContext {
  route: string;
  requestId?: string;
  [key: string]: unknown;
}

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(
    status: number,
    code: string,
    message: string,
    details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function requestId(): string {
  return crypto.randomUUID();
}

export function log(
  level: LogLevel,
  message: string,
  context: LogContext,
): void {
  const payload = {
    severity: level,
    message,
    timestamp: new Date().toISOString(),
    ...context,
  };

  if (level === 'error') {
    console.error(JSON.stringify(payload));
  } else {
    console.warn(JSON.stringify(payload));
  }
}

export function ok<T>(data: T, init?: ResponseInit): NextResponse<T> {
  return NextResponse.json(data, init);
}

export function handleApiError(
  error: unknown,
  context: LogContext,
): NextResponse {
  if (error instanceof ApiError) {
    log(error.status >= 500 ? 'error' : 'warn', error.message, {
      ...context,
      code: error.code,
      details: error.details,
    });

    return NextResponse.json(
      { success: false, error: error.message, code: error.code },
      { status: error.status },
    );
  }

  if (error instanceof ZodError) {
    log('warn', 'Request validation failed', {
      ...context,
      code: 'validation_failed',
      issues: error.issues,
    });

    return NextResponse.json(
      { success: false, error: 'Invalid request', code: 'validation_failed' },
      { status: 400 },
    );
  }

  const message = error instanceof Error ? error.message : 'Unknown error';
  log('error', message, { ...context, code: 'internal_error' });

  return NextResponse.json(
    { success: false, error: 'Internal server error', code: 'internal_error' },
    { status: 500 },
  );
}

export async function parseJson<T>(
  request: Request,
  schema: ZodSchema<T>,
): Promise<T> {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    throw new ApiError(400, 'invalid_json', 'Request body must be valid JSON');
  }

  return schema.parse(body);
}

export function parseSearchParams<T>(
  searchParams: URLSearchParams,
  schema: ZodSchema<T>,
): T {
  return schema.parse(Object.fromEntries(searchParams.entries()));
}

export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  label: string,
): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new ApiError(504, 'timeout', `${label} timed out`));
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, timeout]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

export async function retry<T>(
  operation: () => Promise<T>,
  options: {
    attempts: number;
    baseDelayMs: number;
    shouldRetry?: (error: unknown) => boolean;
  },
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= options.attempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      const retryable = options.shouldRetry?.(error) ?? true;
      if (!retryable || attempt === options.attempts) break;

      const jitter = Math.floor(Math.random() * options.baseDelayMs);
      const delay = options.baseDelayMs * 2 ** (attempt - 1) + jitter;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}
