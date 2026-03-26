'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Building2,
  UserCircle,
  Tag,
  AlertTriangle,
  Image as ImageIcon,
} from 'lucide-react';
import type { Complaint, ComplaintTimelineEntry } from '@/types';
import { ComplaintStatus } from '@/types';
import StatusTimeline from '@/components/complaints/StatusTimeline';
import SLACountdown from '@/components/complaints/SLACountdown';
import CitizenFeedback from '@/components/complaints/CitizenFeedback';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/components/layout/LanguageProvider';

const STATUS_COLORS: Record<string, string> = {
  submitted: 'bg-gray-100 text-gray-700',
  verified: 'bg-blue-100 text-blue-700',
  assigned: 'bg-indigo-100 text-indigo-700',
  in_progress: 'bg-amber-100 text-amber-700',
  resolved: 'bg-green-100 text-green-700',
  closed: 'bg-gray-200 text-gray-600',
  escalated: 'bg-red-100 text-red-700',
  reopened: 'bg-orange-100 text-orange-700',
  transferred: 'bg-purple-100 text-purple-700',
};

const STATUS_LABELS: Record<string, string> = {
  submitted: 'Submitted',
  verified: 'Verified',
  assigned: 'Assigned',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed',
  escalated: 'Escalated',
  reopened: 'Reopened',
  transferred: 'Transferred',
};

const URGENCY_COLORS: Record<string, string> = {
  low: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-red-100 text-red-700',
};

const CATEGORY_LABELS: Record<string, string> = {
  garbage_collection: 'Garbage Collection',
  water_leakage: 'Water Leakage',
  sewer_blockage: 'Sewer Blockage',
  drain_overflow: 'Drain Overflow',
  streetlight: 'Streetlight',
  pothole: 'Pothole',
  illegal_dumping: 'Illegal Dumping',
  mosquito_sanitation: 'Mosquito / Sanitation',
  stray_animal: 'Stray Animal',
  park_maintenance: 'Park Maintenance',
  encroachment: 'Encroachment',
};

export default function TrackDetailPage() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const params = useParams();
  const router = useRouter();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [updates, setUpdates] = useState<ComplaintTimelineEntry[]>([]);
  const [departmentName, setDepartmentName] = useState<string | null>(null);
  const [officerName, setOfficerName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchComplaint() {
      try {
        const res = await fetch(`/api/complaints/track/${params.uid}`);
        const data = await res.json();

        if (data.success) {
          setComplaint(data.complaint);
          setUpdates(data.updates || []);
          setDepartmentName(data.department_name);
          setOfficerName(data.officer_name);
        } else {
          setError(data.message || t('complaints.notFound', { defaultValue: 'Complaint not found.' }));
        }
      } catch {
        setError(t('complaints.failedLoad', { defaultValue: 'Failed to load complaint.' }));
      } finally {
        setLoading(false);
      }
    }
    if (params.uid) fetchComplaint();
  }, [params.uid]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 animate-pulse animate-fadeIn">
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-4 py-4 h-14 flex items-center">
             <div className="h-4 bg-gray-200 rounded w-48"></div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
           <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm h-32"></div>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                 <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm h-48"></div>
                 <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm h-64"></div>
              </div>
              <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm h-96"></div>
           </div>
        </div>
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4 px-4 animate-fadeIn">
        <AlertTriangle className="w-12 h-12 text-gray-300" />
        <p className="text-gray-500 text-center">{error || t('complaints.notFound', { defaultValue: 'Complaint not found.' })}</p>
        <button
          onClick={() => router.push('/complaints/track')}
          className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> {t('complaints.tryAnother', { defaultValue: 'Try Another ID' })}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 animate-fadeIn">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <button
            onClick={() => router.push('/complaints/track')}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> {t('complaints.trackAnother', { defaultValue: 'Track Another Complaint' })}
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Top: UID + Status + Urgency */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-xs text-gray-400 mb-1">{t('complaints.id', { defaultValue: 'Complaint ID' })}</p>
              <h1 className="text-2xl font-bold font-mono text-gray-900 tracking-wider">
                {complaint.uid}
              </h1>
              {complaint.title && (
                <p className="text-sm text-gray-600 mt-1">{complaint.title}</p>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[complaint.status]}`}>
                {t(`complaints.status.${complaint.status}`, { defaultValue: STATUS_LABELS[complaint.status] || complaint.status })}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${URGENCY_COLORS[complaint.urgency]}`}>
                {complaint.urgency.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content — 2 cols */}
          <div className="lg:col-span-2 space-y-6">
            {/* Metadata */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Tag className="w-4 h-4 text-gray-400" />
                <span className="text-gray-500 w-24">{t('complaints.category', { defaultValue: 'Category' })}</span>
                <span className="text-gray-900 font-medium">
                  {t(`filters.${complaint.category}`, { defaultValue: CATEGORY_LABELS[complaint.category] || complaint.category })}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Building2 className="w-4 h-4 text-gray-400" />
                <span className="text-gray-500 w-24">{t('complaints.department', { defaultValue: 'Department' })}</span>
                <span className="text-gray-900">{departmentName || complaint.department_id}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-gray-500 w-24">{t('complaints.address', { defaultValue: 'Address' })}</span>
                <span className="text-gray-900">
                  {complaint.location_text}
                  {complaint.landmark ? ` (${t('complaints.near', { defaultValue: 'near' })} ${complaint.landmark})` : ''}
                </span>
              </div>
              {complaint.ward && (
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-500 w-24">{t('complaints.ward', { defaultValue: 'Ward' })}</span>
                  <span className="text-gray-900">{complaint.ward}</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-gray-500 w-24">{t('complaints.filedOn', { defaultValue: 'Filed On' })}</span>
                <span className="text-gray-900">
                  {new Date(complaint.created_at).toLocaleString(language === 'hi' ? 'hi-IN' : 'en-IN', {
                    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true
                  })}
                </span>
              </div>
              {officerName && (
                <div className="flex items-center gap-3 text-sm">
                  <UserCircle className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-500 w-24">{t('complaints.officer', { defaultValue: 'Officer' })}</span>
                  <span className="text-gray-900">{officerName}</span>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-2">{t('complaints.description', { defaultValue: 'Description' })}</h2>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{complaint.description}</p>
            </div>

            {/* Resolution Notes */}
            {complaint.resolution_notes && (
              <div className="bg-green-50 rounded-xl border border-green-200 p-5">
                <h2 className="text-sm font-semibold text-green-800 mb-2">{t('complaints.officerRemarks', { defaultValue: 'Officer Remarks' })}</h2>
                <p className="text-sm text-green-700 whitespace-pre-wrap">{complaint.resolution_notes}</p>
              </div>
            )}

            {/* Resolution Proof Image */}
            {complaint.resolution_proof_url && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-gray-500" />
                  {t('complaints.resolutionProof', { defaultValue: 'Resolution Proof' })}
                </h2>
                <img
                  src={complaint.resolution_proof_url}
                  alt={t('complaints.resolutionProof', { defaultValue: 'Resolution Proof' })}
                  className="w-full rounded-lg border border-gray-200"
                />
              </div>
            )}

            {/* Feedback — only when resolved */}
            {complaint.status === ComplaintStatus.RESOLVED && (
              <CitizenFeedback
                complaintId={complaint.id}
                existingRating={complaint.citizen_rating}
                existingFeedback={complaint.citizen_feedback}
              />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* SLA Countdown */}
            <SLACountdown
              sla_deadline={complaint.sla_deadline}
              status={complaint.status as ComplaintStatus}
            />

            {/* Timeline */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-4">{t('complaints.statusTimeline', { defaultValue: 'Status Timeline' })}</h2>
              <StatusTimeline
                updates={updates}
                currentStatus={complaint.status as ComplaintStatus}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
