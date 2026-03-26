import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';
import { requireAuth } from '@/lib/middleware';
import { UserRole } from '@/types';
import type { DashboardMetrics, CategoryBreakdown, WardHotspot, DailyTrend } from '@/types';

export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request, [UserRole.SUPERVISOR]);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const now = new Date().toISOString();

    // All complaints
    const { data: allComplaints, error } = await supabaseAdmin
      .from('complaints')
      .select('id, status, urgency, category, ward, sla_deadline, created_at, updated_at');

    if (error) {
      console.error('[API] dashboard error:', error.message);
      return NextResponse.json({ success: false, message: 'Failed to fetch metrics.' }, { status: 500 });
    }

    const complaints = allComplaints || [];
    const total = complaints.length;
    const terminal = ['resolved', 'closed'];
    const active = complaints.filter((c) => !terminal.includes(c.status)).length;
    const resolved = complaints.filter((c) => c.status === 'resolved' || c.status === 'closed').length;
    const overdue = complaints.filter((c) => !terminal.includes(c.status) && c.sla_deadline < now).length;
    const escalated = complaints.filter((c) => c.status === 'escalated').length;

    // SLA compliance
    const resolvedComplaints = complaints.filter((c) => c.status === 'resolved' || c.status === 'closed');
    const resolvedInSLA = resolvedComplaints.filter((c) => c.updated_at <= c.sla_deadline).length;
    const slaRate = resolvedComplaints.length > 0 ? Math.round((resolvedInSLA / resolvedComplaints.length) * 100) : 100;

    // Avg resolution hours
    let totalHours = 0;
    resolvedComplaints.forEach((c) => {
      const created = new Date(c.created_at).getTime();
      const updated = new Date(c.updated_at).getTime();
      totalHours += (updated - created) / (1000 * 60 * 60);
    });
    const avgHours = resolvedComplaints.length > 0 ? Math.round(totalHours / resolvedComplaints.length) : 0;

    // Category breakdown
    const catMap: Record<string, number> = {};
    complaints.forEach((c) => { catMap[c.category] = (catMap[c.category] || 0) + 1; });
    const category_breakdown: CategoryBreakdown[] = Object.entries(catMap)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);

    // Ward hotspots
    const wardMap: Record<string, number> = {};
    complaints.forEach((c) => {
      const w = c.ward || 'Unknown';
      wardMap[w] = (wardMap[w] || 0) + 1;
    });
    const ward_hotspots: WardHotspot[] = Object.entries(wardMap)
      .map(([ward, count]) => ({ ward, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Daily trend (last 7 days)
    const daily_trend: DailyTrend[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const count = complaints.filter((c) => c.created_at.startsWith(dateStr)).length;
      daily_trend.push({ date: dateStr, count });
    }

    const metrics: DashboardMetrics = {
      total_complaints: total,
      active_complaints: active,
      resolved_complaints: resolved,
      overdue_complaints: overdue,
      escalated_complaints: escalated,
      sla_compliance_rate: slaRate,
      avg_resolution_hours: avgHours,
      category_breakdown,
      ward_hotspots,
      daily_trend,
    };

    return NextResponse.json({ success: true, metrics });
  } catch (err) {
    console.error('[API] dashboard error:', err);
    return NextResponse.json({ success: false, message: 'Internal server error.' }, { status: 500 });
  }
}
