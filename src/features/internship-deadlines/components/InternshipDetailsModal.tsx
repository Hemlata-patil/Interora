import React from 'react';
import { Badge, Button } from '@/components';
import type { InternshipDeadlineRecord } from '../types/deadline';
import { calculateDeadlineCountdown } from '../utils/deadlineUtils';
import { X, Clock, MapPin, Building2, CheckCircle2, ShieldCheck } from 'lucide-react';

export interface InternshipDetailsModalProps {
  internship: InternshipDeadlineRecord | null;
  onClose: () => void;
  onApply: (id: string) => Promise<void>;
}

export const InternshipDetailsModal: React.FC<InternshipDetailsModalProps> = ({
  internship,
  onClose,
  onApply,
}) => {
  if (!internship) return null;

  const countdown = calculateDeadlineCountdown(
    internship.registrationStart,
    internship.registrationDeadline,
    internship.isApplied
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto space-y-4 p-6 text-xs">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white font-bold text-base flex items-center justify-center shrink-0">
              {internship.companyInitials}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">{internship.role}</h3>
              <p className="text-indigo-600 font-semibold text-xs">{internship.companyName} â€¢ {internship.location}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Countdown Info Box */}
        <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Application Status</span>
            <Badge variant={countdown.badgeVariant}>{countdown.statusLabel}</Badge>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Remaining Time</span>
            <span className="font-bold text-slate-800 text-xs flex items-center justify-end">
              <Clock className="w-3.5 h-3.5 text-indigo-600 mr-1 inline" />
              {countdown.formattedCountdown}
            </span>
          </div>
        </div>

        {/* Details Grid */}
        <div className="space-y-3">
          <div>
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-1">Role Overview</h4>
            <p className="text-slate-600 leading-relaxed text-xs">{internship.description}</p>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-1.5">Required Skills</h4>
            <div className="flex flex-wrap gap-1.5">
              {internship.skills.map((s, idx) => (
                <Badge key={idx} variant="indigo">
                  {s}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-1.5">Eligibility & Qualifications</h4>
            <ul className="list-disc list-inside space-y-1 text-slate-600 text-xs">
              {internship.eligibility.map((e, idx) => (
                <li key={idx}>{e}</li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-100">
            <div><strong>Work Mode:</strong> {internship.workMode}</div>
            <div><strong>Stipend:</strong> {internship.stipend}</div>
            <div><strong>Duration:</strong> {internship.duration}</div>
            <div><strong>Experience Level:</strong> {internship.experienceLevel}</div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
          {!internship.isApplied && countdown.status !== 'EXPIRED' && countdown.status !== 'UPCOMING' && (
            <Button
              variant="primary"
              size="md"
              onClick={async () => {
                await onApply(internship.id);
                onClose();
              }}
              className="bg-indigo-600 text-white"
            >
              Confirm & Apply Now â†’
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};