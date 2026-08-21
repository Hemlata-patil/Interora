import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Badge, Button } from '@/components';
import { MapPin, Building2, Clock, Calendar, ArrowRight } from 'lucide-react';
import type { Internship } from '../data/mockInternships';
import { calculateInternshipCountdown } from '../utils/internshipCountdown';
import { InternshipDeadlineBadge } from './InternshipDeadlineBadge';
import { InternshipCountdown } from './InternshipCountdown';

export interface InternshipCardProps {
  internship: Internship;
}

export const InternshipCard: React.FC<InternshipCardProps> = ({ internship }) => {
  const countdown = calculateInternshipCountdown(internship.applicationDeadline);
  const isExpired = countdown.status === 'EXPIRED';

  return (
    <Card className="hover:border-slate-300 transition-all flex flex-col justify-between h-full">
      <div className="space-y-3">
        {/* Header Row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center space-x-3">
            <img
              src={internship.companyLogo}
              alt={internship.companyName}
              className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
            />
            <div>
              <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-1">{internship.title}</h3>
              <p className="text-xs text-indigo-600 font-semibold">{internship.companyName}</p>
            </div>
          </div>
          <InternshipDeadlineBadge deadlineIso={internship.applicationDeadline} />
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 text-[11px]">
          <Badge variant="indigo">{internship.workMode}</Badge>
          <Badge variant="neutral">{internship.location}</Badge>
          <Badge variant="emerald">{internship.stipend}</Badge>
        </div>

        {/* Description snippet */}
        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{internship.description}</p>

        {/* Countdown Box */}
        <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
          <InternshipCountdown
            startDateIso={internship.applicationStartDate}
            deadlineIso={internship.applicationDeadline}
          />
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-3 border-t border-slate-100 mt-4 flex items-center justify-between">
        <span className="text-[10px] text-slate-400 font-medium">Duration: {internship.duration}</span>

        <Link to={`/student/internships/${internship.id}`}>
          <Button variant={isExpired ? 'outline' : 'primary'} size="sm" className="text-xs">
            <span>{isExpired ? 'View Details' : 'Apply Now'}</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </Link>
      </div>
    </Card>
  );
};
