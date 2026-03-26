'use client';

import React, { useState, useCallback } from 'react';
import { Star, Loader2, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface CitizenFeedbackProps {
  complaintId: string;
  existingRating: number | null;
  existingFeedback: string | null;
}

export default function CitizenFeedback({
  complaintId,
  existingRating,
  existingFeedback,
}: CitizenFeedbackProps) {
  const { t } = useTranslation();
  const [rating, setRating] = useState(existingRating || 0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedback, setFeedback] = useState(existingFeedback || '');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(!!existingRating);
  const [error, setError] = useState('');

  const handleSubmit = useCallback(async () => {
    if (rating === 0) {
      setError(t('complaints.errorSelectRating', { defaultValue: 'Please select a rating.' }));
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/complaints/${complaintId}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, feedback: feedback.trim() }),
      });

      const data = await res.json();

      if (data.success) {
        setSubmitted(true);
      } else {
        setError(data.message || t('complaints.errorSubmitRating', { defaultValue: 'Failed to submit feedback.' }));
      }
    } catch {
      setError(t('complaints.networkError', { defaultValue: 'Network error. Please try again.' }));
    } finally {
      setLoading(false);
    }
  }, [complaintId, rating, feedback]);

  if (submitted) {
    return (
      <div className="bg-green-50 rounded-xl border border-green-200 p-5 text-center">
        <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
        <p className="text-sm font-semibold text-green-800">{t('complaints.feedbackThanks', { defaultValue: 'Thank you for your feedback!' })}</p>
        <div className="flex items-center justify-center gap-1 mt-2">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star
              key={s}
              className={`w-5 h-5 ${s <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`}
            />
          ))}
        </div>
        {feedback && (
          <p className="text-xs text-gray-500 mt-2 italic">&quot;{feedback}&quot;</p>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
      <h3 className="text-sm font-semibold text-gray-900">{t('complaints.rateExperience', { defaultValue: 'Rate Your Experience' })}</h3>

      {/* Star Rating */}
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => { setRating(s); setError(''); }}
            onMouseEnter={() => setHoveredRating(s)}
            onMouseLeave={() => setHoveredRating(0)}
            className="p-0.5 transition-transform hover:scale-110"
          >
            <Star
              className={`w-8 h-8 transition-colors ${
                s <= (hoveredRating || rating)
                  ? 'text-amber-400 fill-amber-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>

      {/* Feedback Text */}
      <textarea
        rows={3}
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        placeholder={t('complaints.shareExperience', { defaultValue: 'Share your experience (optional)...' })}
        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 outline-none
          focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all
          text-gray-900 text-sm resize-none"
      />

      {error && <p className="text-xs text-red-600">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={loading || rating === 0}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg
          bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700
          disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : t('complaints.submitFeedbackBtn', { defaultValue: 'Submit Feedback' })}
      </button>
    </div>
  );
}
