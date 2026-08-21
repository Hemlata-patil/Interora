import React, { useState, useEffect } from 'react';
import { PageHeader, StatCard, Card, Badge, Button } from '@/components';
import { Briefcase, Users, Award, CheckCircle2, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  fetchInternshipPostingsBackend,
  fetchCompanyApplicantsBackend,
  type InternshipPostingRecord,
  type StudentApplicationRecord,
} from '@/services/api/backendService';
import { supabase } from '@/services/supabase/supabaseClient';

export const CompanyDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState<string>('Company');
  const [internships, setInternships] = useState<InternshipPostingRecord[]>([]);
  const [applicants, setApplicants] = useState<StudentApplicationRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadDashboardData = async (currentUserId: string) => {
    // Fetch Company Profile
    const { data: compProfile } = await supabase
      .from('company_profiles')
      .select('company_name')
      .eq('id', currentUserId)
      .maybeSingle();

    if (compProfile?.company_name) {
      setCompanyName(compProfile.company_name);
    }

    // Fetch Internships & Applicants
    const fetchedInternships = await fetchInternshipPostingsBackend(currentUserId);
    setInternships(fetchedInternships);

    const fetchedApplicants = await fetchCompanyApplicantsBackend(currentUserId);
    setApplicants(fetchedApplicants);
  };

  useEffect(() => {
    const initDashboard = async () => {
      setLoading(true);
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user) {
        const uid = userData.user.id;
        setUserId(uid);
        await loadDashboardData(uid);
      }
      setLoading(false);
    };

    initDashboard();

    // Subscribe to Realtime postgres changes on student_applications & internship_postings
    const channel = supabase
      .channel('company_dashboard_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'student_applications' },
        () => {
          supabase.auth.getUser().then(({ data }) => {
            if (data?.user) loadDashboardData(data.user.id);
          });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'internship_postings' },
        () => {
          supabase.auth.getUser().then(({ data }) => {
            if (data?.user) loadDashboardData(data.user.id);
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Compute Live Metrics
  const activePostingsCount = internships.length;
  const totalApplicantsCount = applicants.length;
  const shortlistedCount = applicants.filter((a) => a.status === 'Shortlisted').length;
  const selectedCount = applicants.filter((a) => a.status === 'Selected').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${companyName} Employer Portal`}
        description="Manage active internship postings, review candidate applications, and track selected interns."
      />

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
              <Button variant="outline" size="sm" onClick={() => navigate('/company/internships')}>
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
                {loading ? 'Loading internship postings...' : 'No active postings found. Create your first internship listing to start receiving applications.'}
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
                {applicants.slice(0, 5).map((app) => (
                  <div key={app.id} className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-xs space-y-1">
                    <div className="flex justify-between items-center font-bold text-slate-900">
                      <span>{app.studentName}</span>
                      <Badge variant={app.status === 'Selected' ? 'emerald' : app.status === 'Shortlisted' ? 'indigo' : app.status === 'Rejected' ? 'rose' : 'amber'}>
                        {app.status}
                      </Badge>
                    </div>
                    <p className="text-slate-500 truncate">{app.internshipTitle}</p>
                  </div>
                ))}
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
