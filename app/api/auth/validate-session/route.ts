import { NextRequest, NextResponse } from 'next/server';
import { validateOTPSession } from '@/lib/otp';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { session_token } = body;

    // Validate input
    if (!session_token || typeof session_token !== 'string') {
      return NextResponse.json(
        { valid: false, phone: null, message: 'Session token is required.' },
        { status: 400 }
      );
    }

    const result = await validateOTPSession(session_token);

    return NextResponse.json(result, {
      status: result.valid ? 200 : 401,
    });
  } catch (err) {
    console.error('[API] validate-session error:', err);
    return NextResponse.json(
      { valid: false, phone: null, message: 'Internal server error.' },
      { status: 500 }
    );
  }
}
