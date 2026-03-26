import { NextResponse } from 'next/server';
import { runAutoEscalation } from '@/lib/escalation';

export async function GET() {
  try {
    const count = await runAutoEscalation();
    return NextResponse.json({
      success: true,
      message: `Auto-escalated ${count} complaint(s).`,
      escalated_count: count,
    });
  } catch (err) {
    console.error('[Cron] escalation error:', err);
    return NextResponse.json(
      { success: false, message: 'Escalation failed.' },
      { status: 500 }
    );
  }
}
