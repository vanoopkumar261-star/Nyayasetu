import { NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/auth';
import type { User } from '@/types';
import { UserRole } from '@/types';

/**
 * Auth middleware for API routes.
 * Extracts Bearer token, verifies it, and checks role-based access.
 *
 * Returns the User object if authorized, or a NextResponse error if not.
 */
export async function requireAuth(
  request: Request,
  allowedRoles: UserRole[]
): Promise<User | NextResponse> {
  // Extract Bearer token
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: 'Authentication required. Please provide a Bearer token.' },
      { status: 401 }
    );
  }

  const token = authHeader.replace('Bearer ', '');

  // Verify token and get user
  const user = await verifyAuthToken(token);
  if (!user) {
    return NextResponse.json(
      { error: 'Invalid or expired authentication token.' },
      { status: 401 }
    );
  }

  // Check role-based access
  if (!allowedRoles.includes(user.role as UserRole)) {
    return NextResponse.json(
      { error: 'You do not have permission to access this resource.' },
      { status: 403 }
    );
  }

  return user;
}
