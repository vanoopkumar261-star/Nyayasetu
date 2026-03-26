import { NextRequest, NextResponse } from 'next/server';
import { verifyOTP } from '@/lib/otp';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, otp } = body;

    // Validate inputs
    if (!phone || typeof phone !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Phone number is required.' },
        { status: 400 }
      );
    }

    if (!otp || typeof otp !== 'string') {
      return NextResponse.json(
        { success: false, message: 'OTP is required.' },
        { status: 400 }
      );
    }

    if (!/^\d{6}$/.test(otp)) {
      return NextResponse.json(
        { success: false, message: 'OTP must be exactly 6 digits.' },
        { status: 400 }
      );
    }

    const result = await verifyOTP(phone, otp);

    return NextResponse.json(result, {
      status: result.success ? 200 : 401,
    });
  } catch (err) {
    console.error('[API] verify-otp error:', err);
    return NextResponse.json(
      { success: false, message: 'Internal server error.' },
      { status: 500 }
    );
  }
}
