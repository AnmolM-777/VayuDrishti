/**
 * Next.js middleware.
 *
 * Route protection is handled client-side via the AuthContext/useAuth hook
 * rather than in Edge middleware, because the Firebase client SDK uses
 * in-memory tokens (not cookies) and firebase-admin is not set up.
 *
 * This middleware simply passes all requests through. It stays here so
 * it can be upgraded to cookie-based session protection later if needed.
 */

import { NextResponse, type NextRequest } from 'next/server';

export function middleware(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
