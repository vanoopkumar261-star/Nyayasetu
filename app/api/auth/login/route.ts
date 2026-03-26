import { NextRequest, NextResponse } from 'next/server';
import { loginUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate inputs
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Email is required.' },
        { status: 400 }
      );
    }

    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Password is required.' },
        { status: 400 }
      );
    }

    const result = await loginUser(email, password);

    if (!result) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    // Strip password_hash from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash, ...safeUser } = result.user;

    return NextResponse.json({
      success: true,
      user: safeUser,
      token: result.token,
    });
  } catch (err) {
    console.error('[API] login error:', err);
    return NextResponse.json(
      { success: false, message: 'Internal server error.' },
      { status: 500 }
    );
  }
}
