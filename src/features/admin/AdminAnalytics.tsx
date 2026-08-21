import React from 'react';
import { PageHeader, Card, StatCard, Badge, ProgressBar, Button } from '@/components';
import { BarChart3, TrendingUp, Users, Award, Download, PieChart, Layers } from 'lucide-react';
import {
  mockFacultyStudents,
  mockCompanyInternships,
  mockCompanyApplications,
  mockCompanyCertificates,
  mockCompanyPPOs,
} from '@/features/faculty/mockData';

export const AdminAnalytics: React.FC = () => {
  const totalStudents = mockFacultyStudents.length;
  const activeInterns = mockFacultyStudents.filter((s) => s.internshipStatus === 'Active').length;
  const completedInterns = mockFacultyStudents.filter((s) => s.internshipStatus === 'Completed').length;
  const totalApps = mockCompanyApplications.length;
  const selectedApps = mockCompanyApplications.filter((a) => a.applicationStatus === 'Selected').length;
  const rejectedApps = mockCompanyApplications.filter((a) => a.applicationStatus === 'Rejected').length;
  const pendingApps = totalApps - (selectedApps + rejectedApps);

  const activePct = Math.round((activeInterns / totalStudents) * 100);
  const completedPct = Math.round((completedInterns / totalStudents) * 100);
  const placementRate = Math.round(((activeInterns + completedInterns) / totalStudents) * 100);

  const handleExportAnalyticsCSV = () => {
    const data = [
      ['Metric Category', 'Metric Name', 'Calculated Value'],
      ['Student Statistics', 'Total Enrolled Students', totalStudents],
      ['Student Statistics', 'Active Interns', activeInterns],
      ['Student Statistics', 'Completed Internships', completedInterns],
      ['Student Statistics', 'Overall Placement Rate', `${placementRate}%`],
      ['Recruitment Applications', 'Total Applications Submitted', totalApps],
      ['Recruitment Applications', 'Applications Selected', selectedApps],
      ['Recruitment Applications', 'Applications Rejected', rejectedApps],
      ['Recruitment Applications', 'Applications Pending', pendingApps],
      ['PPO & Credentials', 'Pre-Placement Offers Issued', mockCompanyPPOs.length],
      ['PPO & Credentials', 'Verified Certificates', mockCompanyCertificates.length],
    ];

    const csvContent = data.map((e) => e.map((val) => `"${val}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Interora_Analytics_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Platform System Analytics"
          description="System-wide metrics covering recruitment conversions, department performance, and completion rates."
        />
        <Button variant="outline" size="sm" onClick={handleExportAnalyticsCSV} className="flex items-center gap-1.5 text-xs shrink-0 self-start sm:self-auto">
          <Download className="w-4 h-4 text-indigo-600" />
          Export Analytics CSV
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Placement Rate"
          value={`${placementRate}%`}
          icon={TrendingUp}
          trend={{ value: '+12% this semester', isPositive: true }}
        />
        <StatCard
          title="Total Applications"
          value={`${totalApps} Submitted`}
          icon={BarChart3}
          description={`${selectedApps} selected • ${pendingApps} pending`}
        />
        <StatCard
          title="Active Interns"
          value={`${activeInterns} Students`}
          icon={Users}
          description={`${completedPct}% already graduated`}
        />
        <StatCard
          title="Certificates Issued"
          value={`${mockCompanyCertificates.length} Verified`}
          icon={Award}
          description="100% QR authenticated"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Student Lifecycle Progress Breakdown">
          <div className="space-y-4 pt-2">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Active Internships ({activeInterns})</span>
                <span>{activePct}%</span>
              </div>
              <ProgressBar progress={activePct} />
            </div>
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Completed Internships ({completedInterns})</span>
                <span>{completedPct}%</span>
              </div>
              <ProgressBar progress={completedPct} />
            </div>
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Application Conversion Rate</span>
                <span>{Math.round((selectedApps / (totalApps || 1)) * 100)}%</span>
              </div>
              <ProgressBar progress={Math.round((selectedApps / (totalApps || 1)) * 100)} />
            </div>
          </div>
        </Card>

        <Card title="Recruitment Status Distribution">
          <div className="space-y-3 pt-1 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg flex items-center justify-between">
              <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                <PieChart className="w-3.5 h-3.5 text-emerald-600" /> Selected / Offered
              </span>
              <Badge variant="emerald">{selectedApps} Applications</Badge>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg flex items-center justify-between">
              <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                <PieChart className="w-3.5 h-3.5 text-amber-600" /> Under Review / Pending
              </span>
              <Badge variant="amber">{pendingApps} Applications</Badge>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg flex items-center justify-between">
              <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                <PieChart className="w-3.5 h-3.5 text-rose-600" /> Rejected / Closed
              </span>
              <Badge variant="rose">{rejectedApps} Applications</Badge>
            </div>
          </div>
        </Card>
      </div>

      <Card title="Departmental Distribution">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="font-bold text-slate-800 block text-sm">Computer Science (CSE)</span>
            <span className="text-slate-500 mt-1 block">3 Active Interns • 4 Applications</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="font-bold text-slate-800 block text-sm">Information Tech (IT)</span>
            <span className="text-slate-500 mt-1 block">1 Active Intern • 2 Applications</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="font-bold text-slate-800 block text-sm">AI & Machine Learning</span>
            <span className="text-slate-500 mt-1 block">1 Active Intern • 1 Application</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="font-bold text-slate-800 block text-sm">Electronics (ECE)</span>
            <span className="text-slate-500 mt-1 block">0 Active Interns • 0 Applications</span>
          </div>
        </div>
      </Card>
    </div>
  );
};
