import React from 'react';
import { Card, Badge, Button } from '@/components';
import { CheckCircle2, Clock, XCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { CertificateRecord } from '../data/mockCertificates';

export interface CertificateEligibilityProps {
  certificate: CertificateRecord;
}

export const CertificateEligibility: React.FC<CertificateEligibilityProps> = ({ certificate }) => {
  return (
    <Card title="Certificate Eligibility Status" subtitle="Verification checklist of program completion requirements">
      <div className="space-y-4 text-xs">
        {/* Top Status Banner */}
        <div
          className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            certificate.isEligible
              ? 'bg-emerald-50/60 border-emerald-100 text-emerald-900'
              : 'bg-amber-50/60 border-amber-100 text-amber-900'
          }`}
        >
          <div className="flex items-start space-x-3">
            {certificate.isEligible ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div>
              <h4 className="font-bold text-sm">
                {certificate.isEligible ? "You're Eligible for Your Internship Certificate!" : 'Certificate Requirements Pending'}
              </h4>
              <p className="text-[11px] leading-relaxed mt-0.5">
                {certificate.isEligible
                  ? 'All institutional attendance, milestone, and mentor evaluation criteria have been satisfied.'
                  : 'Complete the remaining program requirements listed below to unlock official certificate issuance.'}
              </p>
            </div>
          </div>
          <Badge variant={certificate.isEligible ? 'emerald' : 'amber'} className="shrink-0 font-semibold px-3 py-1">
            {certificate.status}
          </Badge>
        </div>

        {/* Requirements Checklist Table */}
        <div className="space-y-2 pt-1">
          <span className="text-[11px] font-bold text-slate-900 uppercase tracking-wider block">Requirements Verification Checklist</span>
          <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
            {certificate.requirements.map((req) => (
              <div key={req.id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center space-x-3">
                  {req.isMet ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-amber-500 shrink-0" />
                  )}
                  <div>
                    <span className="font-bold text-slate-800 block">{req.name}</span>
                    <span className="text-[11px] text-slate-500">{`Current: ${req.currentValue} â€¢ Required: ${req.requiredValue}`}</span>
                  </div>
                </div>
                <div>
                  {req.isMet ? (
                    <Badge variant="emerald" className="text-[10px]">Requirement Met</Badge>
                  ) : (
                    <Badge variant="amber" className="text-[10px]">Pending</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Resolution Actions */}
        {!certificate.isEligible && (
          <div className="pt-2 flex flex-wrap items-center gap-2">
            <Link to="/student/milestones">
              <Button variant="outline" size="sm">
                View Milestones <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
            <Link to="/student/attendance">
              <Button variant="outline" size="sm">
                View Productivity <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </Card>
  );
};