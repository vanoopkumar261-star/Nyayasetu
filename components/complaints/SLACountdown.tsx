'use client';

import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { ComplaintStatus } from '@/types';
import { useTranslation } from 'react-i18next';

interface SLACountdownProps {
  sla_deadline: string;
  status: ComplaintStatus;
}

function getTimeDiff(deadline: string): { days: number; hours: number; minutes: number; seconds: number; total_ms: number } {
  const diff = new Date(deadline).getTime() - Date.now();
  const absDiff = Math.abs(diff);
  const days = Math.floor(absDiff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((absDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((absDiff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((absDiff % (1000 * 60)) / 1000);
  return { days, hours, minutes, seconds, total_ms: diff };
}

export default function SLACountdown({ sla_deadline, status }: SLACountdownProps) {
  const { t } = useTranslation();
  const [timeDiff, setTimeDiff] = useState(getTimeDiff(sla_deadline));

  // Auto-refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeDiff(getTimeDiff(sla_deadline));
    }, 1000);
    return () => clearInterval(interval);
  }, [sla_deadline]);

  const isTerminal = [ComplaintStatus.RESOLVED, ComplaintStatus.CLOSED].includes(status);
  const isBreached = timeDiff.total_ms < 0;

  // Terminal states
  if (isTerminal) {
    if (isBreached) {
      return (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-orange-50 border border-orange-200">
          <XCircle className="w-5 h-5 text-orange-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-orange-800">{t('complaints.resolvedAfterSla', { defaultValue: 'Resolved after SLA breach' })}</p>
            <p className="text-xs text-orange-600">
              {t('complaints.slaExceeded', { defaultValue: 'SLA was exceeded by' })} {timeDiff.days > 0 ? `${timeDiff.days}d ` : ''}{timeDiff.hours}h {timeDiff.minutes}m {timeDiff.seconds}s
            </p>
          </div>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-green-50 border border-green-200">
        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-green-800">{t('complaints.resolvedWithinSla', { defaultValue: 'Resolved within SLA' })}</p>
          <p className="text-xs text-green-600">{t('complaints.completedBefore', { defaultValue: 'Completed before deadline' })}</p>
        </div>
      </div>
    );
  }

  // Active: Breached
  if (isBreached) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-300">
        <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 animate-pulse" />
        <div>
          <p className="text-sm font-bold text-red-800">{t('complaints.slaBreached', { defaultValue: 'SLA Breached' })}</p>
          <p className="text-xs text-red-600">
            {t('complaints.overdueBy', { defaultValue: 'Overdue by' })} {timeDiff.days > 0 ? `${timeDiff.days}d ` : ''}
            {timeDiff.hours}h {timeDiff.minutes}m {timeDiff.seconds}s
          </p>
        </div>
      </div>
    );
  }

  // Active: Countdown
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-50 border border-blue-200">
      <Clock className="w-5 h-5 text-blue-600 flex-shrink-0" />
      <div>
        <p className="text-sm font-semibold text-blue-800">{t('complaints.slaDeadline', { defaultValue: 'SLA Deadline' })}</p>
        <p className="text-xs text-blue-600 text-nowrap">
          {timeDiff.days > 0 ? `${timeDiff.days}d ` : ''}
          {timeDiff.hours}h {timeDiff.minutes}m {timeDiff.seconds}s {t('complaints.remaining', { defaultValue: 'remaining' })}
        </p>
      </div>
    </div>
  );
}
