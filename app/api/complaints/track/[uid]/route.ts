import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { uid: string } }
) {
  try {
    const { uid } = params;

    if (!uid) {
      return NextResponse.json(
        { success: false, message: 'Complaint UID is required.' },
        { status: 400 }
      );
    }

    // Fetch complaint by UID
    const { data: complaint, error: complaintError } = await supabaseAdmin
      .from('complaints')
      .select('*')
      .eq('complaint_uid', uid.toUpperCase().trim())
      .single();

    if (complaintError || !complaint) {
      return NextResponse.json(
        {
          success: false,
          message: `No complaint found with ID "${uid}". Please check the ID and try again.`,
        },
        { status: 404 }
      );
    }

    // Fetch timeline updates
    const { data: updates } = await supabaseAdmin
      .from('complaint_updates')
      .select('*')
      .eq('complaint_id', complaint.id)
      .order('created_at', { ascending: true });

    // Fetch department name
    let departmentName: string | null = null;
    if (complaint.department_id) {
      const { data: dept } = await supabaseAdmin
        .from('departments')
        .select('name')
        .eq('id', complaint.department_id)
        .single();
      departmentName = dept?.name || null;
    }

    // Fetch assigned officer name (only name, no personal details)
    let officerName: string | null = null;
    if (complaint.assigned_officer_id) {
      const { data: officer } = await supabaseAdmin
        .from('users')
        .select('full_name')
        .eq('id', complaint.assigned_officer_id)
        .single();
      officerName = officer?.full_name || null;
    }

    return NextResponse.json({
      success: true,
      complaint,
      updates: updates || [],
      department_name: departmentName,
      officer_name: officerName,
    });
  } catch (err) {
    console.error('[API] complaint track error:', err);
    return NextResponse.json(
      { success: false, message: 'Internal server error.' },
      { status: 500 }
    );
  }
}
