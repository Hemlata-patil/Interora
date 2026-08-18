import React, { useState, useEffect } from 'react';
import { Card, Badge, Button } from '@/components';
import type { InternshipDeadlineRecord } from '../types/deadline';
import { calculateDeadlineCountdown, type CalculatedCountdown } from '../utils/deadlineUtils';
import { Clock, MapPin, Building2, ExternalLink, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

export interface InternshipOpportunityCardProps {
  internship: InternshipDeadlineRecord;
  onApply: (id: string) => Promise<void>;
  onViewDetails: (internship: InternshipDeadlineRecord) => void;
}

export const InternshipOpportunityCard: React.FC<InternshipOpportunityCardProps> = ({
  internship,
  onApply,
  onViewDetails,
}) => {
  const [countdown, setCountdown] = useState<CalculatedCountdown>(() =>
    calculateDeadlineCountdown(internship.registrationStart, internship.registrationDeadline, internship.isApplied)
  );
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const updated = calculateDeadlineCountdown(
        internship.registrationStart,
        internship.registrationDeadline,
        internship.isApplied
      );
      setCountdown(updated);
      if (updated.status === 'EXPIRED') {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [internship.registrationStart, internship.registrationDeadline, internship.isApplied]);

  const handleApplyClick = async () => {
    if (internship.isApplied || countdown.status === 'EXPIRED' || countdown.status === 'UPCOMING') return;
    setIsApplying(true);
    try {
      await onApply(internship.id);
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <Card className="hover:border-slate-300 transition-all flex flex-col justify-between h-full">
      <div className="space-y-3">
        {/* Header Row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs">
              {internship.companyInitials}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-1">{internship.role}</h3>
              <p className="text-xs text-indigo-600 font-semibold">{internship.companyName}</p>
            </div>
          </div>
          <Badge variant={countdown.badgeVariant} className="text-[10px] shrink-0">
            {countdown.statusLabel}
          </Badge>
        </div>

        {/* Location & Work Mode Tags */}
        <div className="flex flex-wrap gap-1.5 text-[11px]">
          <Badge variant="indigo">{internship.workMode}</Badge>
          <Badge variant="neutral">{internship.location}</Badge>
          <Badge variant="emerald">{internship.stipend}</Badge>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{internship.description}</p>

        {/* Live Countdown Box */}
        <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-[10px] uppercase font-bold text-slate-400">Application Countdown</span>
            <span className="font-bold text-slate-800 flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5 text-indigo-600 inline mr-1" />
              {countdown.formattedCountdown}
            </span>
          </div>
        </div>
      </div>

      {/* Footer Action Buttons */}
      <div className="pt-3 border-t border-slate-100 mt-4 flex items-center justify-between gap-2">
        <Button variant="outline" size="sm" onClick={() => onViewDetails(internship)} className="text-xs">
          View Details
        </Button>

        {internship.isApplied ? (
          <Button variant="outline" size="sm" disabled className="text-xs text-emerald-700 bg-emerald-50 border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
            Submitted
          </Button>
        ) : countdown.status === 'EXPIRED' ? (
          <Button variant="outline" size="sm" disabled className="text-xs text-rose-600 border-rose-200">
            Closed
          </Button>
        ) : countdown.status === 'UPCOMING' ? (
          <Button variant="outline" size="sm" disabled className="text-xs text-indigo-600 border-indigo-200">
            Opens Soon
          </Button>
        ) : (
          <Button
            variant="primary"
            size="sm"
            onClick={handleApplyClick}
            disabled={isApplying}
            className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <span>{isApplying ? 'Submitting...' : 'Apply Now'}</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        )}
      </div>
    </Card>
  );
};