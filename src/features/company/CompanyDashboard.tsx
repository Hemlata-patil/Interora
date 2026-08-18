import React from 'react';
import { PageHeader, StatCard, Card, Badge, Button, ProgressBar } from '@/components';
import { Briefcase, Users, Award, Sparkles, Clock, CheckCircle2, AlertCircle, ChevronRight, UserCheck, Building2, BookOpen, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  mockFacultyStudents, 
  mockCompanyMentors, 
  mockCompanyInternships, 
  mockCompanyNotifications 
} from '../faculty/mockData';
import { getMockCompanyProfile } from './CompanyProfile';

export const CompanyDashboard: React.FC = () => {
  const navigate = useNavigate();
  const profile = getMockCompanyProfile();
  
  // Use mock data to populate sections where applicable
  const activeInterns = mockFacultyStudents.filter(s => s.internshipStatus === 'Active' || s.internshipStatus === 'At Risk' || s.internshipStatus === 'Completed').slice(0, 3);
  const recentApplicants = mockFacultyStudents.filter(s => s.applicationStatus === 'Pending' || s.applicationStatus === 'Approved').slice(0, 3);
  
  // High-level progress metrics calculation based on mock active interns
  const avgProgress = activeInterns.length 
    ? Math.round(activeInterns.reduce((acc, curr) => acc + curr.progressPercentage, 0) / activeInterns.length)
    : 0;

  const atRiskCount = mockFacultyStudents.filter(s => s.internshipStatus === 'At Risk').length;
  const completedCount = mockFacultyStudents.filter(s => s.internshipStatus === 'Completed').length;

  const getAiMatch = (id: string) => {
    const scores: Record<string, number> = {
      'stu-rahul': 92,
      'stu-sneha': 88,
      'stu-priya': 95,
      'stu-sarah': 91,
      'stu-aman': 85
    };
    return scores[id] || 80;
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) return `${diffMins} mins ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hrs ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  return (
    <div className="space-y-8 pb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <PageHeader
          title="Company Dashboard"
          description="Manage your internships, applicants, mentors, and program overview."
        />
        
        {/* Profile Status Card */}
        {profile ? (
          <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center gap-4 shadow-sm w-full sm:w-auto">
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Company Profile</span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-sm font-bold text-slate-900">{profile.companyName}</span>
                {profile.verificationStatus === 'verified' && <Badge variant="emerald" className="text-[10px] py-0 px-1.5"><CheckCircle2 className="w-3 h-3 mr-1" /> Verified</Badge>}
                {profile.verificationStatus === 'pending' && <Badge variant="amber" className="text-[10px] py-0 px-1.5"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>}
                {profile.verificationStatus === 'rejected' && <Badge variant="rose" className="text-[10px] py-0 px-1.5"><AlertCircle className="w-3 h-3 mr-1" /> Rejected</Badge>}
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate('/company/profile')} className="shrink-0 text-xs py-1 h-8">
              View Profile
            </Button>
          </div>
        ) : null}
      </div>

      {!profile && (
        <Card className="bg-indigo-50/50 border-indigo-100 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center gap-4 justify-between">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-indigo-600 shrink-0">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Complete your company profile</h3>
                <p className="text-sm text-slate-600 mt-1">Create your company profile to submit your company for verification and start publishing internships.</p>
              </div>
            </div>
            <Button onClick={() => navigate('/company/profile')} className="shrink-0 whitespace-nowrap shadow-sm">
              Create Profile
            </Button>
          </div>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Active Internships" 
          value={mockCompanyInternships.length.toString()} 
          icon={Briefcase} 
          description="2 closing soon" 
        />
        <StatCard 
          title="Total Applicants" 
          value="28" 
          icon={Users} 
          description="8 awaiting review" 
        />
        <StatCard 
          title="Active Interns" 
          value="12" 
          icon={UserCheck} 
          description={`${atRiskCount} need attention`} 
        />
        <StatCard 
          title="PPO / Conversion" 
          value="2" 
          icon={Award} 
          description="1 offer extended" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Applicants */}
          <Card title="Recent Applicants">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 font-medium">Student</th>
                    <th className="px-4 py-3 font-medium">Internship</th>
                    <th className="px-4 py-3 font-medium">AI Match</th>
                    <th className="px-4 py-3 font-medium">Applied Date</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentApplicants.map((student) => (
                    <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-900">{student.studentName}</td>
                      <td className="px-4 py-3 text-slate-600">{student.role}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-indigo-700 font-medium bg-indigo-50 px-2 py-1 rounded-md w-fit">
                          <Sparkles className="w-3.5 h-3.5" />
                          {getAiMatch(student.id)}%
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {new Date(student.appliedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={student.applicationStatus === 'Approved' ? 'emerald' : 'amber'}>
                          {student.applicationStatus === 'Approved' ? 'Faculty Approved' : 'Pending Faculty'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="ghost" size="sm" onClick={() => navigate('/company/applicants')}>View</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Mentor Overview (NEW) */}
            <Card title="Mentor Overview">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total Mentors</p>
                    <p className="text-2xl font-bold text-slate-900">{mockCompanyMentors.length}</p>
                  </div>
                  <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-100">
                    <p className="text-xs text-indigo-600 uppercase tracking-wider mb-1">Assigned</p>
                    <p className="text-2xl font-bold text-indigo-900">
                      {mockCompanyMentors.filter(m => mockCompanyInternships.some(i => i.mentorId === m.id)).length}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2 mt-4">
                  <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-2">Recent Assignments</h4>
                  {mockCompanyInternships.filter(i => i.mentorId).slice(0, 2).map(internship => {
                    const mentor = mockCompanyMentors.find(m => m.id === internship.mentorId);
                    return (
                      <div key={internship.id} className="flex justify-between items-center text-sm">
                        <span className="text-slate-600 truncate mr-2" title={internship.title}>{internship.title}</span>
                        <span className="font-medium text-slate-900 shrink-0">{mentor?.name || 'Unassigned'}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="pt-2">
                  <Button variant="outline" className="w-full justify-center" onClick={() => navigate('/company/mentors')}>
                    Manage Mentors
                  </Button>
                </div>
              </div>
            </Card>

            {/* Internship Progress Summary (NEW) */}
            <Card title="Program Progress">
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-medium text-slate-700">Average Intern Progress</span>
                    <span className="font-bold text-slate-900">{avgProgress}%</span>
                  </div>
                  <ProgressBar progress={avgProgress} color="indigo" />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm text-slate-600">Internships Completed</span>
                  </div>
                  <span className="font-bold text-slate-900">{completedCount}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                    <span className="text-sm text-slate-600">At-Risk Interns</span>
                  </div>
                  <span className="font-bold text-slate-900">{atRiskCount}</span>
                </div>
                
                <div className="pt-2">
                  <Button variant="outline" className="w-full justify-center" onClick={() => navigate('/company/interns')}>
                    View Interns
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>

        <div className="space-y-6">
          {/* AI Intern Allocator Preparation */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl p-6 text-white shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
            <div className="relative z-10 flex flex-col items-start gap-4">
              <div className="p-2.5 bg-white/20 rounded-lg backdrop-blur-sm shadow-sm">
                <Sparkles className="w-6 h-6 text-indigo-50" />
              </div>
              <div>
                <h3 className="text-lg font-semibold tracking-tight">AI Intern Allocator</h3>
                <p className="text-indigo-100 text-sm mt-1 mb-5 leading-relaxed">
                  Rank faculty-approved applicants based on internship requirements.
                </p>
                <Button className="bg-white text-indigo-700 hover:bg-indigo-50 border-0 w-full font-semibold shadow-sm transition-colors">
                  Run Allocator
                </Button>
              </div>
            </div>
          </div>

          {/* Evaluation & Certificates Overview */}
          <Card title="Evaluations & Certificates">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-400" />
                  <span className="font-medium text-sm text-slate-900">Final Evaluations</span>
                </div>
                <Badge variant="amber">2 Pending</Badge>
              </div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-slate-400" />
                  <span className="font-medium text-sm text-slate-900">Certificates</span>
                </div>
                <Badge variant="emerald">1 Issued</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-slate-400" />
                  <span className="font-medium text-sm text-slate-900">PPO Decisions</span>
                </div>
                <Badge variant="indigo">1 Offered</Badge>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <Card title="Quick Actions" className="h-full">
            <div className="flex flex-col gap-2.5">
              <Button variant="outline" className="justify-between group bg-slate-50/50 hover:bg-indigo-50/50 hover:border-indigo-200 hover:text-indigo-700 transition-all" onClick={() => navigate('/company/listings')}>
                <div className="flex items-center gap-2.5">
                  <Briefcase className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                  <span>Create Internship</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-500" />
              </Button>
              <Button variant="outline" className="justify-between group bg-slate-50/50 hover:bg-indigo-50/50 hover:border-indigo-200 hover:text-indigo-700 transition-all" onClick={() => navigate('/company/applicants')}>
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                  <span>View Applicants</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-500" />
              </Button>
              <Button variant="outline" className="justify-between group bg-slate-50/50 hover:bg-indigo-50/50 hover:border-indigo-200 hover:text-indigo-700 transition-all" onClick={() => navigate('/company/mentors')}>
                <div className="flex items-center gap-2.5">
                  <UserCheck className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                  <span>Manage Mentors</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-500" />
              </Button>
              <Button variant="outline" className="justify-between group bg-slate-50/50 hover:bg-indigo-50/50 hover:border-indigo-200 hover:text-indigo-700 transition-all" onClick={() => navigate('/company/certificates')}>
                <div className="flex items-center gap-2.5">
                  <Award className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                  <span>Issue Certificates</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-500" />
              </Button>
            </div>
          </Card>
        </div>

        {/* High-Level Notifications */}
        <div className="lg:col-span-2">
          <Card title="Recent Notifications" className="h-full">
            <div className="space-y-0 pt-2">
              {mockCompanyNotifications.slice(0, 4).map((notif, index) => {
                let badgeColor = 'bg-slate-500';
                if (notif.priority === 'urgent') badgeColor = 'bg-rose-500';
                else if (notif.priority === 'important') badgeColor = 'bg-amber-500';
                else if (notif.category === 'applications') badgeColor = 'bg-indigo-500';
                else if (notif.category === 'certificates' || notif.category === 'milestones') badgeColor = 'bg-emerald-500';

                return (
                  <div key={notif.id} className="relative pl-6 pb-6 border-l border-slate-200 last:border-l-0 last:pb-0 ml-2">
                    <div className={`absolute left-[-5px] top-1.5 w-2.5 h-2.5 rounded-full ${badgeColor} ring-4 ring-white`}></div>
                    <p className="text-sm text-slate-800">
                      <span className="font-semibold text-slate-900">{notif.title}</span> - {notif.message}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">{formatTimeAgo(notif.createdAt)}</p>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end">
              <Button variant="ghost" size="sm" onClick={() => navigate('/company/notifications')}>
                View All Notifications
              </Button>
            </div>
          </Card>
        </div>
      </div>

    </div>
  );
};
