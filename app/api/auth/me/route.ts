import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware';
import { UserRole } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const result = await requireAuth(request, [
      UserRole.OFFICER,
      UserRole.SUPERVISOR,
      UserRole.ADMIN,
    ]);

    // If result is a NextResponse, it's an error
    if (result instanceof NextResponse) {
      return result;
    }

    // Strip password_hash from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash, ...safeUser } = result;

    return NextResponse.json({
      success: true,
      user: safeUser,
    });
  } catch (err) {
    console.error('[API] me error:', err);
    return NextResponse.json(
      { success: false, message: 'Internal server error.' },
      { status: 500 }
    );
  }
}
