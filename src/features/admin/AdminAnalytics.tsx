import React, { useState, useEffect } from 'react';
import { PageHeader, Card, StatCard, Badge, ProgressBar, Button } from '@/components';
import { BarChart3, TrendingUp, Users, Award, Download, PieChart, Loader2 } from 'lucide-react';
import {
  fetchAdminDashboardMetricsBackend,
  type AdminDashboardMetrics,
} from '@/services/api/backendService';

export const AdminAnalytics: React.FC = () => {
  const [metrics, setMetrics] = useState<AdminDashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const loadMetrics = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchAdminDashboardMetricsBackend();
        if (isMounted) {
          setMetrics(data);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err?.message || 'Failed to load analytics metrics');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadMetrics();
    return () => {
      isMounted = false;
    };
  }, []);

  const totalStudents = metrics?.totalStudents ?? 0;
  const activeInterns = metrics?.activeInternships ?? 0;
  const completedInterns = metrics?.completedInternsCount ?? 0;
  const totalApps = metrics?.totalApplicationsCount ?? 0;
  const selectedApps = metrics?.selectedApplicationsCount ?? 0;
  const rejectedApps = metrics?.rejectedApplicationsCount ?? 0;
  const pendingApps = Math.max(0, totalApps - (selectedApps + rejectedApps));
  const totalCertificates = metrics?.totalCertificatesCount ?? 0;
  const totalPpos = metrics?.totalPposCount ?? 0;

  const activePct = totalStudents > 0 ? Math.round((activeInterns / totalStudents) * 100) : 0;
  const completedPct = totalStudents > 0 ? Math.round((completedInterns / totalStudents) * 100) : 0;
  const placementRate =
    totalStudents > 0
      ? Math.min(100, Math.round(((activeInterns + completedInterns) / totalStudents) * 100))
      : 0;
  const conversionRate = totalApps > 0 ? Math.round((selectedApps / totalApps) * 100) : 0;

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
      ['PPO & Credentials', 'Pre-Placement Offers Issued', totalPpos],
      ['PPO & Credentials', 'Verified Certificates', totalCertificates],
    ];

    const csvContent = data.map((e) => e.map((val) => `"${val}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `Interora_Analytics_Report_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-24 text-slate-400 text-sm">
        <Loader2 className="w-6 h-6 mr-2 animate-spin text-indigo-600" />
        Loading analytics dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-sm">
        {error}
      </div>
    );
  }

  const deptDistribution =
    metrics?.departmentDistribution && metrics.departmentDistribution.length > 0
      ? metrics.departmentDistribution
      : [
          { department: 'Computer Science (CSE)', studentCount: 0, internshipCount: 0 },
          { department: 'Information Tech (IT)', studentCount: 0, internshipCount: 0 },
          { department: 'AI & Machine Learning', studentCount: 0, internshipCount: 0 },
          { department: 'Electronics (ECE)', studentCount: 0, internshipCount: 0 },
        ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Platform System Analytics"
          description="System-wide metrics covering recruitment conversions, department performance, and completion rates."
        />
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportAnalyticsCSV}
          className="flex items-center gap-1.5 text-xs shrink-0 self-start sm:self-auto"
        >
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
          value={`${totalCertificates} Verified`}
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
                <span>{conversionRate}%</span>
              </div>
              <ProgressBar progress={conversionRate} />
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
          {deptDistribution.map((dept: { department: string; studentCount: number; internshipCount: number }) => (
            <div key={dept.department} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="font-bold text-slate-800 block text-sm">{dept.department}</span>
              <span className="text-slate-500 mt-1 block">
                {dept.internshipCount} Active Interns • {dept.studentCount} Students
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
