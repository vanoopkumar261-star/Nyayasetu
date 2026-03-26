content = open("app/(officer)/officer/page.tsx", "w", encoding="utf-8")
content.write("""\
"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Loader2, AlertTriangle, CheckCircle } from "lucide-react";
import ComplaintQueueCard from "@/components/complaints/ComplaintQueueCard";

export default function OfficerQueuePage() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ status: "", urgency: "", sort_by: "sla_deadline", sort_order: "asc" });

  const fetchQueue = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("nyayasetu_token");
      const params = new URLSearchParams();
      if (filters.status) params.set("status", filters.status);
      if (filters.urgency) params.set("urgency", filters.urgency);
      params.set("sort_by", filters.sort_by);
      params.set("sort_order", filters.sort_order);
      const res = await fetch(`/api/officer/queue?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch queue");
      setComplaints(data.complaints || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchQueue(); }, [fetchQueue]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">My Complaint Queue</h1>
      {loading && <div className="flex items-center gap-2 text-gray-500"><Loader2 className="animate-spin" size={20} /> Loading...</div>}
      {error && <div className="text-red-500 bg-red-50 p-4 rounded">{error}</div>}
      {!loading && !error && complaints.length === 0 && <div className="text-center text-gray-500 py-16"><p>No complaints in your queue.</p></div>}
      {!loading && !error && complaints.length > 0 && (
        <div className="flex flex-col gap-4">
          {complaints.map(c => <ComplaintQueueCard key={c.id} complaint={c} />)}
        </div>
      )}
    </div>
  );
}
""")
content.close()
print("Done")
