import { ApiError } from '@/lib/server/api';
import { getAdminAuth } from '@/lib/server/firebase-admin';

export type UserRole = 'citizen' | 'municipal' | 'reviewer' | 'admin';

export interface ApiUser {
  uid: string;
  email?: string;
  roles: UserRole[];
  isDemo: boolean;
}

const ROLE_CLAIMS = ['roles', 'role'] as const;

function getBearerToken(request: Request): string | undefined {
  const authorization = request.headers.get('authorization');
  if (!authorization?.startsWith('Bearer ')) return undefined;
  return authorization.slice('Bearer '.length).trim();
}

function normalizeRoles(value: unknown): UserRole[] {
  const roles = Array.isArray(value) ? value : value ? [value] : [];
  return roles.filter((role): role is UserRole =>
    ['citizen', 'municipal', 'reviewer', 'admin'].includes(String(role)),
  );
}

export async function requireApiUser(
  request: Request,
  allowedRoles: UserRole[] = [],
): Promise<ApiUser> {
  const token = getBearerToken(request);
  const auth = getAdminAuth();
  const authRequired = process.env.REQUIRE_API_AUTH === 'true';

  if (!token) {
    if (authRequired) {
      throw new ApiError(401, 'auth_required', 'Authentication is required');
    }

    return {
      uid: 'demo-user',
      roles: ['citizen', 'municipal', 'reviewer', 'admin'],
      isDemo: true,
    };
  }

  if (!auth) {
    if (authRequired) {
      throw new ApiError(
        503,
        'auth_unavailable',
        'Authentication service is unavailable',
      );
    }

    return {
      uid: 'demo-user',
      roles: ['citizen', 'municipal', 'reviewer', 'admin'],
      isDemo: true,
    };
  }

  const decoded = await auth.verifyIdToken(token);
  const roles = ROLE_CLAIMS.flatMap((claim) => normalizeRoles(decoded[claim]));
  const normalizedRoles: UserRole[] = roles.length > 0 ? roles : ['citizen'];

  if (
    allowedRoles.length > 0 &&
    !normalizedRoles.includes('admin') &&
    !allowedRoles.some((role) => normalizedRoles.includes(role))
  ) {
    throw new ApiError(403, 'forbidden', 'Insufficient permissions');
  }

  return {
    uid: decoded.uid,
    email: decoded.email,
    roles: normalizedRoles,
    isDemo: false,
  };
}
