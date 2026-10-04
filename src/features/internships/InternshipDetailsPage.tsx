import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { PageHeader, Card, Badge, Button } from '@/components';
import { mockInternships } from './data/mockInternships';
import { fetchInternshipPostingByIdBackend } from '@/services/api/backendService';
import { ArrowLeft, MapPin, Clock, DollarSign, Calendar, Building2, CheckCircle2, Sparkles, Loader2 } from 'lucide-react';

export const InternshipDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [internship, setInternship] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      if (isUuid) {
        const remote = await fetchInternshipPostingByIdBackend(id);
        if (remote) {
          setInternship(remote);
          return;
        }
      }
      const fallback = mockInternships.find((item) => item.id === id);
      setInternship(fallback || null);
    } catch (err) {
      console.error('[InternshipDetailsPage] Error loading posting:', err);
      const fallback = mockInternships.find((item) => item.id === id);
      setInternship(fallback || null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
    const handleFocus = () => loadData();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [loadData]);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Loading Opportunity..." description="Fetching internship details from backend..." />
        <Card>
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
            <p className="text-xs text-slate-500 mt-2">Loading posting information...</p>
          </div>
        </Card>
      </div>
    );
  }

  if (!internship) {
    return (
      <div className="space-y-6">
        <PageHeader title="Internship Not Found" description="The requested internship opportunity could not be located." />
        <Card>
          <div className="p-8 text-center space-y-4">
            <p className="text-xs text-slate-500">The listing may have expired or been removed by the host company.</p>
            <Link to="/student/internships">
              <Button variant="primary" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Marketplace
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Breadcrumb */}
      <div>
        <button
          onClick={() => navigate('/student/internships')}
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-3 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Marketplace
        </button>
        <PageHeader
          title={internship.title}
          description={`${internship.companyName} â€¢ Posted on ${internship.postedDate}`}
          action={
            <Link to={`/student/internships/${internship.id}/apply`}>
              <Button variant="primary" size="md">
                Apply Now
              </Button>
            </Link>
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Details Overview) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Description Card */}
          <Card title="About the Opportunity">
            <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
              <p>{internship.description}</p>

              <div className="pt-2">
                <h4 className="font-bold text-slate-900 text-sm mb-2">Key Responsibilities</h4>
                <ul className="space-y-1.5 list-disc list-inside text-slate-600">
                  {internship.responsibilities.map((resp: string, idx: number) => (
                    <li key={idx}>{resp}</li>
                  ))}
                </ul>
              </div>

              <div className="pt-2">
                <h4 className="font-bold text-slate-900 text-sm mb-2">Requirements & Qualifications</h4>
                <ul className="space-y-1.5 list-disc list-inside text-slate-600">
                  {internship.requirements.map((req: string, idx: number) => (
                    <li key={idx}>{req}</li>
                  ))}
                </ul>
              </div>

              <div className="pt-2">
                <h4 className="font-bold text-slate-900 text-sm mb-2">What You Will Learn</h4>
                <ul className="space-y-1.5 list-disc list-inside text-slate-600">
                  {internship.learningOutcomes.map((out: string, idx: number) => (
                    <li key={idx}>{out}</li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>

          {/* Required Skills Card */}
          <Card title="Required Skills & Competencies">
            <div className="flex flex-wrap gap-2">
              {internship.skills.map((skill: string, idx: number) => (
                <Badge key={idx} variant="indigo" className="text-xs px-3 py-1 font-medium">
                  {skill}
                </Badge>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Sidebar Column (Summary Metadata) */}
        <div className="space-y-6">
          <Card title="Internship Overview">
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-slate-500">Host Company</span>
                <span className="font-semibold text-slate-900">{internship.companyName}</span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-slate-500">Work Mode</span>
                <Badge variant={internship.workMode === 'Remote' ? 'emerald' : internship.workMode === 'Hybrid' ? 'indigo' : 'neutral'}>
                  {internship.workMode}
                </Badge>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-slate-500">Location</span>
                <span className="font-semibold text-slate-900">{internship.location}</span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-slate-500">Duration</span>
                <span className="font-semibold text-slate-900">{internship.duration}</span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-slate-500">Stipend</span>
                <span className="font-semibold text-emerald-600">{internship.stipend}</span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-slate-500">Application Deadline</span>
                <span className="font-semibold text-amber-600">{internship.deadline}</span>
              </div>

              <div className="pt-2 space-y-2">
                <Link to={`/student/internships/${internship.id}/apply`} className="w-full">
                  <Button variant="primary" className="w-full">
                    Start Application
                  </Button>
                </Link>
                <Link to="/student/internships" className="w-full block">
                  <Button variant="outline" className="w-full">
                    Back to Marketplace
                  </Button>
                </Link>
              </div>
            </div>
          </Card>

          {/* Institutional Note */}
          <Card>
            <div className="p-1 space-y-2 text-xs text-slate-600">
              <div className="flex items-center space-x-1.5 text-indigo-900 font-semibold">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>Approval Workflow Notice</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-500">
                Submitted applications undergo initial Faculty review followed by Company Mentor selection per institutional internship policy.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};