import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';
import { requireAuth } from '@/lib/middleware';
import { UserRole } from '@/types';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAuth(request, [UserRole.OFFICER]);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { id } = params;
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file uploaded.' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: 'Only JPEG, PNG, and WebP images are allowed.' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const ext = file.name.split('.').pop() || 'jpg';
    const filename = `${id}/${Date.now()}.${ext}`;

    // Convert File to ArrayBuffer then to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage
    const { error: uploadError } = await supabaseAdmin.storage
      .from('complaint-proofs')
      .upload(filename, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error('[API] upload error:', uploadError.message);
      return NextResponse.json(
        { success: false, message: 'Failed to upload image.' },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('complaint-proofs')
      .getPublicUrl(filename);

    const publicUrl = urlData.publicUrl;

    // Update complaint with proof URL
    await supabaseAdmin
      .from('complaints')
      .update({
        resolution_proof_url: publicUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    return NextResponse.json({
      success: true,
      message: 'Proof uploaded successfully.',
      url: publicUrl,
    });
  } catch (err) {
    console.error('[API] proof upload error:', err);
    return NextResponse.json(
      { success: false, message: 'Internal server error.' },
      { status: 500 }
    );
  }
}
