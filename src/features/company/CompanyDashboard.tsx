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

  useEffect(() => {
    const loadCompanyDashboard = async () => {
      setLoading(true);
      const { data: userData, error: userError } = await supabase.auth.getUser();

      if (userError || !userData?.user) {
        console.error('[CompanyDashboard] User Auth Error:', userError);
        setLoading(false);
        return;
      }

      const currentUserId = userData.user.id;
      setUserId(currentUserId);
      console.log('Company user ID:', currentUserId);

      // Fetch Company Profile
      const { data: compProfile, error: profileErr } = await supabase
        .from('company_profiles')
        .select('company_name')
        .eq('id', currentUserId)
        .single();

      if (profileErr) {
        console.error('Company profile error:', profileErr);
      } else if (compProfile) {
        console.log('Company profile:', compProfile);
        setCompanyName(compProfile.company_name);
      }

      // Fetch Internships
      const remoteInternships = await fetchInternshipPostingsBackend(currentUserId);
      console.log('Company internships data:', remoteInternships);
      setInternships(remoteInternships);

      // Fetch Applicants
      const remoteApplicants = await fetchCompanyApplicantsBackend(currentUserId);
      console.log('Company applicants data:', remoteApplicants);
      setApplicants(remoteApplicants);

      setLoading(false);
    };

    loadCompanyDashboard();
  }, []);

  const totalPostings = internships.length;
  const activePostings = internships.filter((i) => i.status === 'open').length;
  const totalApplicants = applicants.length;
  const shortlistedApplicants = applicants.filter((a) => a.status === 'Shortlisted').length;
  const selectedApplicants = applicants.filter((a) => a.status === 'Selected').length;

  return (
    <div className="space-y-8 pb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <PageHeader
          title={`${companyName} Dashboard`}
          description="Manage your live internships, applicants, and program overview."
        />
        <Button onClick={() => navigate('/company/listings')} className="bg-indigo-600 hover:bg-indigo-700 text-white shrink-0">
          <Briefcase className="w-4 h-4 mr-2" /> Post New Internship
        </Button>
      </div>

      {/* Primary Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="ACTIVE POSTINGS"
          value={activePostings}
          icon={Briefcase}
          description={`${totalPostings} Total Listed`}
        />
        <StatCard
          title="TOTAL APPLICANTS"
          value={totalApplicants}
          icon={Users}
          description="Real-time Candidates"
        />
        <StatCard
          title="SHORTLISTED"
          value={shortlistedApplicants}
          icon={CheckCircle2}
          description="In Review"
        />
        <StatCard
          title="SELECTED INTERNS"
          value={selectedApplicants}
          icon={Award}
          description="Final Offers"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Postings Overview */}
        <div className="lg:col-span-2 space-y-6">
          <Card title="Active Internship Listings">
            {internships.length > 0 ? (
              <div className="space-y-3">
                {internships.map((item) => (
                  <div key={item.id} className="p-4 border border-slate-100 bg-slate-50/50 rounded-xl flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{item.title}</h4>
                      <p className="text-xs text-slate-500">{item.industryDomain} • {item.duration}</p>
                    </div>
                    <Badge variant={item.status === 'open' ? 'emerald' : 'neutral'}>
                      {item.status.toUpperCase()}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">No active internship postings found.</p>
            )}
          </Card>

          {/* Recent Candidates */}
          <Card title="Recent Candidates">
            {applicants.length > 0 ? (
              <div className="space-y-3">
                {applicants.slice(0, 5).map((app) => (
                  <div key={app.id} className="p-3 border border-slate-100 bg-white rounded-lg flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-800">{app.studentName}</p>
                      <p className="text-[11px] text-slate-500">{app.internshipTitle}</p>
                    </div>
                    <Badge variant={app.status === 'Selected' ? 'emerald' : app.status === 'Shortlisted' ? 'indigo' : 'amber'}>
                      {app.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">No candidates have applied yet.</p>
            )}
          </Card>
        </div>

        {/* Right Sidebar Quick Actions */}
        <div className="space-y-6">
          <Card title="Quick Actions">
            <div className="flex flex-col gap-2.5">
              <Button variant="outline" className="justify-between bg-slate-50/50 hover:bg-indigo-50/50" onClick={() => navigate('/company/listings')}>
                <div className="flex items-center gap-2.5">
                  <Briefcase className="w-4 h-4 text-slate-400" />
                  <span>Manage Internships</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Button>
              <Button variant="outline" className="justify-between bg-slate-50/50 hover:bg-indigo-50/50" onClick={() => navigate('/company/applicants')}>
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-slate-400" />
                  <span>Manage Applicants</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
