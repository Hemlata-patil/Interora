import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { PageHeader, Card, Badge, Button } from '@/components';
import { initialMockInternships, type Internship } from './data/mockInternships';
import { calculateInternshipCountdown } from './utils/internshipCountdown';
import { InternshipDeadlineBadge } from './components/InternshipDeadlineBadge';
import { InternshipCountdown } from './components/InternshipCountdown';
import { ArrowLeft } from 'lucide-react';

export const InternshipDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const internship: Internship = initialMockInternships.find((i: Internship) => i.id === id) || initialMockInternships[0];
  const countdown = calculateInternshipCountdown(internship.applicationDeadline);
  const isExpired = countdown.status === 'EXPIRED';

  return (
    <div className="space-y-6">
      {/* Back Button & Header */}
      <div className="flex items-center space-x-2">
        <Link to="/student/internships" className="text-slate-500 hover:text-slate-900 text-xs font-semibold flex items-center">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Marketplace
        </Link>
      </div>

      <PageHeader
        title={internship.title}
        description={`${internship.companyName} â€¢ ${internship.location}`}
        action={<InternshipDeadlineBadge deadlineIso={internship.applicationDeadline} className="px-3 py-1 text-xs font-bold" />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details Panel */}
        <div className="lg:col-span-2 space-y-6">
          <Card title="Internship Overview">
            <div className="space-y-4 text-xs leading-relaxed">
              <p className="text-slate-700">{internship.description}</p>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Required Skills</h4>
                <div className="flex flex-wrap gap-1.5">
                  {internship.skillsRequired.map((skill: string, idx: number) => (
                    <Badge key={idx} variant="indigo">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Key Responsibilities</h4>
                <ul className="list-disc list-inside space-y-1 text-slate-600">
                  {internship.responsibilities.map((resp: string, idx: number) => (
                    <li key={idx}>{resp}</li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar Info & Important Dates */}
        <div className="space-y-6">
          {/* Important Dates Section (Phase 13) */}
          <Card title="Important Dates & Countdown" subtitle="Application window and timeline details">
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                <InternshipCountdown
                  startDateIso={internship.applicationStartDate}
                  deadlineIso={internship.applicationDeadline}
                />
              </div>

              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white text-[11px]">
                {internship.applicationStartDate && (
                  <div className="p-2.5 flex justify-between">
                    <span className="text-slate-500">Application Opens:</span>
                    <span className="font-bold text-slate-800">
                      {new Date(internship.applicationStartDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                )}

                {internship.applicationDeadline && (
                  <div className="p-2.5 flex justify-between">
                    <span className="text-slate-500">Application Deadline:</span>
                    <span className="font-bold text-indigo-600">
                      {new Date(internship.applicationDeadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                )}

                {internship.internshipStartDate && (
                  <div className="p-2.5 flex justify-between">
                    <span className="text-slate-500">Internship Starts:</span>
                    <span className="font-bold text-slate-800">
                      {new Date(internship.internshipStartDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-2">
                {!isExpired ? (
                  <Link to={`/student/internships/${internship.id}/apply`}>
                    <Button variant="primary" size="md" className="w-full justify-center bg-indigo-600 text-white">
                      Apply For Internship â†’
                    </Button>
                  </Link>
                ) : (
                  <Button variant="outline" size="md" disabled className="w-full justify-center text-rose-600 border-rose-200">
                    Applications Closed
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};