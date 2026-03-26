import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';
import { validateOTPSession } from '@/lib/otp';
import { classifyComplaint } from '@/lib/classifier';
import { calculateSLADeadline } from '@/lib/sla';
import { generateComplaintUID } from '@/lib/utils';
import type { FileComplaintRequest, FileComplaintResponse } from '@/types';
import { ComplaintStatus } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body: FileComplaintRequest = await request.json();
    const { session_token, name, title, category, description, address, landmark, ward } = body;

    // --- Validate required fields ---
    if (!session_token) {
      return NextResponse.json(
        { success: false, complaint_uid: null, message: 'Session token is required.', classification: null } satisfies FileComplaintResponse,
        { status: 400 }
      );
    }
    if (!name || !title || !category || !description || !address) {
      return NextResponse.json(
        { success: false, complaint_uid: null, message: 'Name, title, category, description, and address are required.', classification: null } satisfies FileComplaintResponse,
        { status: 400 }
      );
    }
    if (description.length < 30) {
      return NextResponse.json(
        { success: false, complaint_uid: null, message: 'Description must be at least 30 characters.', classification: null } satisfies FileComplaintResponse,
        { status: 400 }
      );
    }

    // --- Validate OTP session ---
    const session = await validateOTPSession(session_token);
    if (!session.valid || !session.phone) {
      return NextResponse.json(
        { success: false, complaint_uid: null, message: 'Invalid or expired session. Please verify your phone again.', classification: null } satisfies FileComplaintResponse,
        { status: 401 }
      );
    }

    // --- Classify complaint ---
    const classification = classifyComplaint(description, category);

    // --- Calculate SLA deadline ---
    const now = new Date();
    const slaDeadline = calculateSLADeadline(classification.category, now);

    // --- Generate complaint UID ---
    const complaintUID = generateComplaintUID();

    // --- Ensure citizen exists or create ---
    let citizenId: string;
    const { data: existingCitizen } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('phone', session.phone)
      .limit(1);

    if (existingCitizen && existingCitizen.length > 0) {
      citizenId = existingCitizen[0].id;
      // Update name if provided
      await supabaseAdmin.from('users').update({ full_name: name }).eq('id', citizenId);
    } else {
      const { data: newCitizen, error: citizenError } = await supabaseAdmin
        .from('users')
        .insert({ phone: session.phone, full_name: name, role: 'citizen' })
        .select('id')
        .single();

      if (citizenError || !newCitizen) {
        console.error('[API] citizen insert error:', citizenError?.message);
        return NextResponse.json(
          { success: false, complaint_uid: null, message: 'Failed to register citizen.', classification: null } satisfies FileComplaintResponse,
          { status: 500 }
        );
      }
      citizenId = newCitizen.id;
    }

    // --- Insert complaint ---
    const { data: complaint, error: complaintError } = await supabaseAdmin
      .from('complaints')
      .insert({
        complaint_uid: complaintUID,
        citizen_user_id: citizenId,
        title,
        category: classification.category,
        department_id: classification.department_id,
        description,
        address: address,
        landmark: landmark || null,
        ward: ward || null,
        status: ComplaintStatus.SUBMITTED,
        urgency: classification.urgency,
        sla_deadline: slaDeadline.toISOString(),
      })
      .select('id')
      .single();

    if (complaintError || !complaint) {
      console.error('[API] complaint insert error:', complaintError?.message);
      return NextResponse.json(
        { success: false, complaint_uid: null, message: 'Failed to file complaint.', classification } satisfies FileComplaintResponse,
        { status: 500 }
      );
    }

    // --- Insert first timeline entry: submitted ---
    await supabaseAdmin.from('complaint_updates').insert({
      complaint_id: complaint.id,
      new_status: ComplaintStatus.SUBMITTED,
      updated_by_user_id: citizenId,
      public_note: 'Complaint filed by citizen.',
    });

    // --- Auto-assign to available officer ---
    const { data: officers } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('department_id', classification.department_id)
      .eq('role', 'officer')
      .eq('is_active', true)
      .limit(1);

    if (officers && officers.length > 0) {
      const officerId = officers[0].id;

      await supabaseAdmin
        .from('complaints')
        .update({
          officer_id: officerId,
          status: ComplaintStatus.ASSIGNED,
        })
        .eq('id', complaint.id);

      await supabaseAdmin.from('complaint_updates').insert({
        complaint_id: complaint.id,
        new_status: ComplaintStatus.ASSIGNED,
        updated_by_user_id: officerId,
        public_note: `Auto-assigned to officer.`,
      });
    }

    return NextResponse.json({
      success: true,
      complaint_uid: complaintUID,
      message: 'Complaint filed successfully.',
      classification,
    } satisfies FileComplaintResponse);
  } catch (err) {
    console.error('[API] file complaint error:', err);
    return NextResponse.json(
      { success: false, complaint_uid: null, message: 'Internal server error.', classification: null } satisfies FileComplaintResponse,
      { status: 500 }
    );
  }
}
