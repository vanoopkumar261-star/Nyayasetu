'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, AlertTriangle, Users } from 'lucide-react';
import type { OfficerPerformance } from '@/types';

const TOKEN_KEY = 'nyayasetu_token';

export default function SupervisorOfficersPage() {
  const [officers, setOfficers] = useState<OfficerPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOfficers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const res = await fetch('/api/supervisor/officers', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setOfficers(data.officers);
      } else {
        setError(data.message || 'Failed to load officers.');
      }
    } catch {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOfficers(); }, [fetchOfficers]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-6 h-6 text-purple-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <AlertTriangle className="w-10 h-10 text-gray-300" />
        <p className="text-sm text-gray-500">{error}</p>
        <button onClick={fetchOfficers} className="text-sm text-purple-600 hover:underline">Retry</button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
        <Users className="w-5 h-5 text-purple-500" /> Officer Performance
      </h1>
      <p className="text-sm text-gray-500 mb-6">Sorted by SLA compliance — worst performers first</p>

      {officers.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">No officers found.</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left py-3 px-4 text-gray-500 font-medium text-xs">Officer</th>
                    <th className="text-left py-3 px-4 text-gray-500 font-medium text-xs">Department</th>
                    <th className="text-right py-3 px-4 text-gray-500 font-medium text-xs">Assigned</th>
                    <th className="text-right py-3 px-4 text-gray-500 font-medium text-xs">Resolved</th>
                    <th className="text-right py-3 px-4 text-gray-500 font-medium text-xs">Overdue</th>
                    <th className="text-right py-3 px-4 text-gray-500 font-medium text-xs">Avg Hours</th>
                    <th className="text-right py-3 px-4 text-gray-500 font-medium text-xs">SLA %</th>
                  </tr>
                </thead>
                <tbody>
                  {officers.map((o) => (
                    <tr key={o.officer_id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 font-medium text-gray-900">{o.officer_name}</td>
                      <td className="py-3 px-4 text-gray-500 text-xs">{o.department_name}</td>
                      <td className="py-3 px-4 text-right text-gray-700">{o.assigned_count}</td>
                      <td className="py-3 px-4 text-right text-green-600 font-medium">{o.resolved_count}</td>
                      <td className="py-3 px-4 text-right text-red-600 font-medium">{o.overdue_count}</td>
                      <td className="py-3 px-4 text-right text-gray-700">{o.avg_resolution_hours}h</td>
                      <td className="py-3 px-4 text-right">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                          o.sla_compliance_rate >= 80 ? 'bg-green-100 text-green-700' :
                          o.sla_compliance_rate >= 50 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {o.sla_compliance_rate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {officers.map((o) => (
              <div key={o.officer_id} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-gray-900">{o.officer_name}</h3>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                    o.sla_compliance_rate >= 80 ? 'bg-green-100 text-green-700' :
                    o.sla_compliance_rate >= 50 ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {o.sla_compliance_rate}% SLA
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-3">{o.department_name}</p>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div>
                    <p className="text-sm font-bold text-gray-700">{o.assigned_count}</p>
                    <p className="text-[10px] text-gray-400">Assigned</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-green-600">{o.resolved_count}</p>
                    <p className="text-[10px] text-gray-400">Resolved</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-red-600">{o.overdue_count}</p>
                    <p className="text-[10px] text-gray-400">Overdue</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-700">{o.avg_resolution_hours}h</p>
                    <p className="text-[10px] text-gray-400">Avg Hrs</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
