import { supabaseAdmin } from '@/lib/db';
import { ComplaintStatus } from '@/types';

/**
 * Auto-escalates complaints that have breached SLA.
 * Finds complaints where sla_deadline < now AND status NOT IN (resolved, closed, escalated).
 * Returns the count of escalated complaints.
 */
export async function runAutoEscalation(): Promise<number> {
  const now = new Date().toISOString();

  const { data: complaints, error } = await supabaseAdmin
    .from('complaints')
    .select('id')
    .lt('sla_deadline', now)
    .not('status', 'in', '("resolved","closed","escalated")');

  if (error || !complaints || complaints.length === 0) {
    return 0;
  }

  let count = 0;

  for (const c of complaints) {
    // Update complaint
    await supabaseAdmin
      .from('complaints')
      .update({
        status: ComplaintStatus.ESCALATED,
        is_escalated: true,
        updated_at: now,
      })
      .eq('id', c.id);

    // Insert escalation record
    await supabaseAdmin.from('escalations').insert({
      complaint_id: c.id,
      escalated_by: 'system',
      reason: 'SLA deadline breached — auto-escalated.',
      auto_escalated: true,
    });

    // Insert timeline entry
    await supabaseAdmin.from('complaint_updates').insert({
      complaint_id: c.id,
      status: ComplaintStatus.ESCALATED,
      changed_by: 'system',
      notes: 'Auto-escalated due to SLA breach.',
      public_note: 'Your complaint has been escalated for priority resolution due to SLA breach.',
    });

    count++;
  }

  return count;
}
