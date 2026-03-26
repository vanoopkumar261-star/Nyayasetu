import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';
import { requireAuth } from '@/lib/middleware';
import { UserRole, ComplaintStatus } from '@/types';
import type { TransferComplaintRequest } from '@/types';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAuth(request, [UserRole.OFFICER]);
  if (authResult instanceof NextResponse) return authResult;
  const user = authResult;

  try {
    const { id } = params;
    const body: TransferComplaintRequest = await request.json();
    const { department_id, reason } = body;

    if (!department_id || !reason) {
      return NextResponse.json(
        { success: false, message: 'Department and reason are required.' },
        { status: 400 }
      );
    }

    // Update complaint department and status
    const { error: updateError } = await supabaseAdmin
      .from('complaints')
      .update({
        department_id,
        status: ComplaintStatus.TRANSFERRED,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (updateError) {
      console.error('[API] transfer error:', updateError.message);
      return NextResponse.json(
        { success: false, message: 'Failed to transfer complaint.' },
        { status: 500 }
      );
    }

    // Insert timeline entry
    await supabaseAdmin.from('complaint_updates').insert({
      complaint_id: id,
      status: ComplaintStatus.TRANSFERRED,
      changed_by: user.id,
      notes: `Transferred to department ${department_id}. Reason: ${reason}`,
      public_note: `Complaint transferred to a different department for resolution.`,
    });

    // Find and assign new officer in target department
    const { data: officers } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('department_id', department_id)
      .eq('role', 'officer')
      .eq('is_active', true)
      .limit(1);

    if (officers && officers.length > 0) {
      const newOfficerId = officers[0].id;

      await supabaseAdmin
        .from('complaints')
        .update({
          assigned_officer_id: newOfficerId,
          status: ComplaintStatus.ASSIGNED,
        })
        .eq('id', id);

      await supabaseAdmin.from('complaint_updates').insert({
        complaint_id: id,
        status: ComplaintStatus.ASSIGNED,
        changed_by: 'system',
        notes: `Auto-assigned to officer ${newOfficerId} in new department.`,
        public_note: 'New officer assigned to your complaint.',
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Complaint transferred successfully.',
    });
  } catch (err) {
    console.error('[API] transfer error:', err);
    return NextResponse.json(
      { success: false, message: 'Internal server error.' },
      { status: 500 }
    );
  }
}
