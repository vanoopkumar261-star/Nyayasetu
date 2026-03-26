import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';
import { ComplaintStatus } from '@/types';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { rating, feedback } = body;

    if (!rating || typeof rating !== 'number' || rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, message: 'Rating must be between 1 and 5.' },
        { status: 400 }
      );
    }

    // Verify complaint exists and is resolved
    const { data: complaint, error: fetchError } = await supabaseAdmin
      .from('complaints')
      .select('id, status')
      .eq('id', id)
      .single();

    if (fetchError || !complaint) {
      return NextResponse.json(
        { success: false, message: 'Complaint not found.' },
        { status: 404 }
      );
    }

    if (complaint.status !== ComplaintStatus.RESOLVED) {
      return NextResponse.json(
        { success: false, message: 'Feedback can only be submitted for resolved complaints.' },
        { status: 400 }
      );
    }

    // Update complaint with feedback
    const { error: updateError } = await supabaseAdmin
      .from('complaints')
      .update({
        citizen_rating: rating,
        citizen_feedback: feedback?.trim() || null,
      })
      .eq('id', id);

    if (updateError) {
      console.error('[API] feedback update error:', updateError.message);
      return NextResponse.json(
        { success: false, message: 'Failed to save feedback.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Thank you for your feedback!',
    });
  } catch (err) {
    console.error('[API] feedback error:', err);
    return NextResponse.json(
      { success: false, message: 'Internal server error.' },
      { status: 500 }
    );
  }
}
