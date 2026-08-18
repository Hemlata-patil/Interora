import React, { useState, useEffect } from 'react';
import { calculateInternshipCountdown, calculateWindowProgress, type CountdownResult } from '../utils/internshipCountdown';
import { Clock, AlertTriangle } from 'lucide-react';

export interface InternshipCountdownProps {
  startDateIso?: string;
  deadlineIso?: string;
  showProgressBar?: boolean;
}

export const InternshipCountdown: React.FC<InternshipCountdownProps> = ({
  startDateIso,
  deadlineIso,
  showProgressBar = true,
}) => {
  const [countdown, setCountdown] = useState<CountdownResult>(() => calculateInternshipCountdown(deadlineIso));
  const [windowProgress, setWindowProgress] = useState<number>(() => calculateWindowProgress(startDateIso, deadlineIso));

  useEffect(() => {
    // Recalculate every second if deadline is active
    const timer = setInterval(() => {
      const updated = calculateInternshipCountdown(deadlineIso);
      setCountdown(updated);
      setWindowProgress(calculateWindowProgress(startDateIso, deadlineIso));

      if (updated.status === 'EXPIRED') {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [startDateIso, deadlineIso]);

  if (countdown.status === 'UNAVAILABLE') {
    return <span className="text-slate-400 text-xs italic">Deadline unavailable</span>;
  }

  if (countdown.status === 'EXPIRED') {
    return (
      <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs font-semibold flex items-center space-x-1.5">
        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
        <span>Applications Closed</span>
      </div>
    );
  }

  return (
    <div className="space-y-1.5 text-xs">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase font-bold text-slate-400">Application Window</span>
        <span className="font-bold text-slate-800 flex items-center space-x-1">
          <Clock className="w-3.5 h-3.5 text-indigo-600 inline mr-1" />
          {countdown.formattedCountdown}
        </span>
      </div>

      {showProgressBar && startDateIso && (
        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              countdown.status === 'LAST_DAY'
                ? 'bg-rose-500'
                : countdown.status === 'DEADLINE_NEAR'
                ? 'bg-amber-500'
                : 'bg-indigo-600'
            }`}
            style={{ width: `${windowProgress}%` }}
          />
        </div>
      )}
    </div>
  );
};