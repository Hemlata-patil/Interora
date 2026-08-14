import React from 'react';
import { Card, Badge, Button } from '@/components';
import { MapPin, Clock, Briefcase, DollarSign, Calendar, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { InternshipRecord } from '../data/mockInternships';

export interface InternshipCardProps {
  internship: InternshipRecord;
}

export const InternshipCard: React.FC<InternshipCardProps> = ({ internship }) => {
  return (
    <Card className="hover:border-slate-300 transition-all">
      <div className="space-y-4">
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-indigo-50 border border-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 font-bold text-sm shrink-0">
              {internship.companyName.charAt(0)}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-snug hover:text-indigo-600 transition-colors">
                <Link to={`/student/internships/${internship.id}`}>{internship.title}</Link>
              </h3>
              <p className="text-xs font-semibold text-slate-600 mt-0.5">{internship.companyName}</p>
            </div>
          </div>
          <Badge variant={internship.workMode === 'Remote' ? 'emerald' : internship.workMode === 'Hybrid' ? 'indigo' : 'neutral'}>
            {internship.workMode}
          </Badge>
        </div>

        {/* Metadata Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-600 bg-slate-50/60 p-2.5 rounded-lg border border-slate-100">
          <div className="flex items-center space-x-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{internship.location}</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{internship.duration}</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <DollarSign className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="font-semibold text-slate-700">{internship.stipend}</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Due {internship.deadline}</span>
          </div>
        </div>

        {/* Required Skills Badges */}
        <div className="space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Required Skills</span>
          <div className="flex flex-wrap gap-1.5">
            {internship.skills.map((skill, idx) => (
              <Badge key={idx} variant="neutral" className="text-[11px] font-medium">
                {skill}
              </Badge>
            ))}
          </div>
        </div>

        {/* Card Actions Footer */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
          <span className="text-[11px] text-slate-400">Posted on {internship.postedDate}</span>
          <div className="flex items-center space-x-2">
            <Link to={`/student/internships/${internship.id}`}>
              <Button variant="outline" size="sm">
                View Details
              </Button>
            </Link>
            <Link to={`/student/internships/${internship.id}/apply`}>
              <Button variant="primary" size="sm">
                Apply Now
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
};