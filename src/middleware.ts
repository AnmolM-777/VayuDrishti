/**
 * Next.js middleware for route protection.
 *
 * When Firebase is configured, redirects unauthenticated users away from
 * /dashboard/* and /municipal/* to /login.
 *
 * For the hackathon demo, middleware is lenient — if Firebase is not
 * configured the session token check is skipped so the app runs without auth.
 */

import { NextResponse, type NextRequest } from 'next/server';

const PROTECTED_PREFIXES = ['/dashboard', '/map', '/reports', '/hotspots', '/predictions', '/leaderboard', '/alerts'];
const MUNICIPAL_PREFIXES = ['/dispatch', '/review', '/deployments', '/analytics'];

// Routes that should redirect logged-in users away
const AUTH_ROUTES = ['/login', '/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if Firebase is configured (env var will be absent in Edge runtime without NEXT_PUBLIC_ prefix)
  const firebaseConfigured = !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== 'your_firebase_api_key_here';

  // Without Firebase, let all routes through (demo mode)
  if (!firebaseConfigured) {
    return NextResponse.next();
  }

  // Check for Firebase session cookie (simplified — real implementation uses firebase-admin)
  const sessionCookie = request.cookies.get('firebase-session')?.value;
  const isProtected =
    PROTECTED_PREFIXES.some((p) => pathname.startsWith(p)) ||
    MUNICIPAL_PREFIXES.some((p) => pathname.startsWith(p));

  if (isProtected && !sessionCookie) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - api routes
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
