import { NextResponse } from 'next/server';

export async function POST() {
  // JWT is stateless — client clears its own token.
  // This endpoint exists for API completeness.
  return NextResponse.json({
    success: true,
    message: 'Logged out successfully. Please clear your token.',
  });
}
