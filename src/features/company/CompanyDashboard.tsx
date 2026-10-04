import React, { useState, useEffect, useCallback } from 'react';
import { PageHeader, StatCard, Card, Badge, Button, Alert } from '@/components';
import { Briefcase, Users, Award, CheckCircle2, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  getCurrentUserBackend,
  fetchInternshipPostingsBackend,
  fetchCompanyApplicantsBackend,
  type InternshipPostingRecord,
  type StudentApplicationRecord,
} from '@/services/api/backendService';

export const CompanyDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [companyName, setCompanyName] = useState<string>('Company');
  const [approvalStatus, setApprovalStatus] = useState<string | null>(null);
  const [internships, setInternships] = useState<InternshipPostingRecord[]>([]);
  const [applicants, setApplicants] = useState<StudentApplicationRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboardData = useCallback(async (currentUserId?: string) => {
    try {
      setError(null);
      // Fetch user profile and company info
      const user = await getCurrentUserBackend();
      if (!user) {
        setLoading(false);
        return;
      }

      if (user.companyProfile?.companyName) {
        setCompanyName(user.companyProfile.companyName);
      } else if (user.fullName) {
        setCompanyName(user.fullName);
      }

      if (user.companyProfile?.approvalStatus) {
        setApprovalStatus(user.companyProfile.approvalStatus);
      }

      const uid = currentUserId || user.id;

      // Fetch Internships & Applicants via Express API
      const [fetchedInternships, fetchedApplicants] = await Promise.all([
        fetchInternshipPostingsBackend(uid),
        fetchCompanyApplicantsBackend(uid),
      ]);

      setInternships(fetchedInternships);
      setApplicants(fetchedApplicants);
    } catch (err: any) {
      console.error('[CompanyDashboard] Error loading dashboard data:', err);
      setError(err?.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();

    // Targeted refresh on window focus (e.g. returning from another tab or management page)
    const handleFocus = () => {
      loadDashboardData();
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [loadDashboardData]);

  // Compute Live Metrics
  const activePostingsCount = internships.length;
  const totalApplicantsCount = applicants.length;
  const shortlistedCount = applicants.filter(
    (a) => (a.status || '').toLowerCase() === 'shortlisted'
  ).length;
  const selectedCount = applicants.filter(
    (a) => (a.status || '').toLowerCase() === 'selected'
  ).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${companyName} Employer Portal`}
        description="Manage active internship postings, review candidate applications, and track selected interns."
      />

      {approvalStatus === 'pending' && (
        <Alert type="warning" title="Registration Under Review">
          Your company registration is currently pending administrative verification. You can explore the portal, but posting new internships requires account approval.
        </Alert>
      )}

      {approvalStatus === 'rejected' && (
        <Alert type="error" title="Registration Rejected">
          Your company registration was not approved. Please contact platform administrators for assistance.
        </Alert>
      )}

      {error && (
        <Alert type="error" title="Dashboard Error">
          {error}
        </Alert>
      )}

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Active Postings" value={activePostingsCount.toString()} icon={Briefcase} />
        <StatCard title="Total Applicants" value={totalApplicantsCount.toString()} icon={Users} />
        <StatCard title="Shortlisted" value={shortlistedCount.toString()} icon={Award} />
        <StatCard title="Selected Interns" value={selectedCount.toString()} icon={CheckCircle2} />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Postings */}
        <div className="lg:col-span-2 space-y-4">
          <Card
            title="Active Internship Postings"
            subtitle="Current open positions receiving candidate applications"
            action={
              <Button variant="outline" size="sm" onClick={() => navigate('/company/listings')}>
                Manage Listings <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            }
          >
            {internships.length > 0 ? (
              <div className="space-y-3">
                {internships.slice(0, 4).map((posting) => (
                  <div
                    key={posting.id}
                    className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between hover:border-indigo-100 transition-colors"
                  >
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{posting.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {posting.location} • {posting.internshipType} • {posting.stipend}
                      </p>
                    </div>
                    <Badge variant="indigo" className="text-xs">
                      {posting.status || 'Active'}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic py-4 text-center">
                {loading
                  ? 'Loading internship postings...'
                  : 'No active postings found. Create your first internship listing to start receiving applications.'}
              </p>
            )}
          </Card>
        </div>

        {/* Right Column: Quick Candidate Pipeline */}
        <div className="space-y-4">
          <Card
            title="Candidate Pipeline"
            subtitle="Recent applicant updates"
            action={
              <Button variant="ghost" size="sm" onClick={() => navigate('/company/applicants')}>
                View All
              </Button>
            }
          >
            {applicants.length > 0 ? (
              <div className="space-y-3">
                {applicants.slice(0, 5).map((app) => {
                  const statusKey = (app.status || '').toLowerCase();
                  const badgeVariant =
                    statusKey === 'selected'
                      ? 'emerald'
                      : statusKey === 'shortlisted'
                      ? 'indigo'
                      : statusKey === 'rejected'
                      ? 'rose'
                      : 'amber';

                  return (
                    <div key={app.id} className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-xs space-y-1">
                      <div className="flex justify-between items-center font-bold text-slate-900">
                        <span>{app.studentName}</span>
                        <Badge variant={badgeVariant}>
                          {app.status}
                        </Badge>
                      </div>
                      <p className="text-slate-500 truncate">{app.internshipTitle}</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic py-4 text-center">
                {loading ? 'Loading candidate pipeline...' : 'No candidate applications received yet.'}
              </p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
