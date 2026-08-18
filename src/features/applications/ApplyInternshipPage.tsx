import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { PageHeader, Card, Badge, Button } from '@/components';
import { initialMockInternships, type Internship } from '@/features/internships/data/mockInternships';
import { calculateInternshipCountdown } from '@/features/internships/utils/internshipCountdown';
import { ArrowLeft, CheckCircle2, Upload } from 'lucide-react';

export const ApplyInternshipPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const internship: Internship = initialMockInternships.find((item: Internship) => item.id === id) || initialMockInternships[0];
  const countdown = calculateInternshipCountdown(internship.applicationDeadline);
  const isExpired = countdown.status === 'EXPIRED';

  const [coverLetter, setCoverLetter] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isExpired) return;

    setIsSubmitted(true);
    setTimeout(() => {
      navigate('/student/applications');
    }, 2000);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center space-x-2">
        <Link to={`/student/internships/${internship.id}`} className="text-slate-500 hover:text-slate-900 text-xs font-semibold flex items-center">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Details
        </Link>
      </div>

      <PageHeader
        title={`Apply to ${internship.title}`}
        description={`${internship.companyName} â€¢ ${internship.location}`}
      />

      <Card>
        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs p-1">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="font-bold text-slate-800 block">{internship.title}</span>
              <span className="text-slate-500 text-[11px] block">{internship.stipend} â€¢ {internship.duration}</span>
              {isExpired && <span className="text-rose-600 font-bold block text-[11px]">Applications Closed for this role</span>}
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-800 text-[11px] block">Statement of Purpose / Cover Letter</label>
              <textarea
                rows={4}
                required
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Explain why your background fits this internship..."
                className="w-full p-3 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>

            <Button
              variant="primary"
              size="md"
              type="submit"
              disabled={isExpired || !coverLetter.trim()}
              className="w-full justify-center bg-indigo-600 text-white"
            >
              Submit Internship Application
            </Button>
          </form>
        ) : (
          <div className="p-8 text-center space-y-3 text-xs">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Application Submitted Successfully!</h3>
            <p className="text-slate-500 text-[11px]">Redirecting to My Applications pipeline...</p>
          </div>
        )}
      </Card>
    </div>
  );
};