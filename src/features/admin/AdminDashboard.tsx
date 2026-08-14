import React, { useEffect, useState } from 'react';
import { PageHeader, StatCard, Card, Alert, Badge, LoadingState, EmptyState, ProgressBar, Table } from '@/components';
import type { Column } from '@/components';
import { Users, GraduationCap, Building2, Briefcase, FileText, Award, Activity, CheckCircle2, Clock } from 'lucide-react';
import { fetchAdminDashboardData } from './mockData';
import type { AdminDashboardData, DepartmentSummary } from './types';

export const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const result = await fetchAdminDashboardData();
        if (result) {
          setData(result);
        } else {
          setError('No data found');
        }
      } catch (err) {
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Admin Dashboard" description="Overview of the Interora platform." />
        <Card className="min-h-[400px] flex items-center justify-center">
          <LoadingState message="Loading dashboard data..." />
        </Card>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-6">
        <PageHeader title="Admin Dashboard" description="Overview of the Interora platform." />
        <Alert type="error" title="Error Loading Data">
          {error || 'Unable to load dashboard data.'}
        </Alert>
        <Card className="min-h-[400px] flex items-center justify-center">
          <EmptyState title="Data Unavailable" description="Could not fetch the latest statistics." />
        </Card>
      </div>
    );
  }

  const departmentColumns: Column<DepartmentSummary>[] = [
    { header: 'Department', accessorKey: 'name', className: 'font-medium' },
    { header: 'Students', accessorKey: 'studentsCount' },
    { header: 'Faculty', accessorKey: 'facultyCount' },
    {
      header: 'Status',
      cell: (row) => (
        <Badge variant={row.status === 'Active' ? 'emerald' : row.status === 'Pending' ? 'amber' : 'neutral'}>
          {row.status}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Dashboard"
        description="Comprehensive overview of the Interora platform, users, and activities."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard title="Total Students" value={data.stats.totalStudents.toLocaleString()} icon={GraduationCap} />
        <StatCard title="Total Faculty" value={data.stats.totalFaculty.toLocaleString()} icon={Users} />
        <StatCard title="Total Companies" value={data.stats.totalCompanies.toLocaleString()} icon={Building2} />
        <StatCard title="Total Internships" value={data.stats.totalInternships.toLocaleString()} icon={Briefcase} />
        <StatCard title="Total Applications" value={data.stats.totalApplications.toLocaleString()} icon={FileText} />
        <StatCard title="Certificates Issued" value={data.stats.certificatesIssued.toLocaleString()} icon={Award} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Internship Overview" className="col-span-1">
          <div className="space-y-6 mt-2">
            <ProgressBar 
              progress={(data.internshipOverview.active / (data.internshipOverview.active + data.internshipOverview.pending + data.internshipOverview.completed)) * 100} 
              label={`Active (${data.internshipOverview.active})`} 
              color="emerald" 
            />
            <ProgressBar 
              progress={(data.internshipOverview.pending / (data.internshipOverview.active + data.internshipOverview.pending + data.internshipOverview.completed)) * 100} 
              label={`Pending (${data.internshipOverview.pending})`} 
              color="amber" 
            />
            <ProgressBar 
              progress={(data.internshipOverview.completed / (data.internshipOverview.active + data.internshipOverview.pending + data.internshipOverview.completed)) * 100} 
              label={`Completed (${data.internshipOverview.completed})`} 
              color="indigo" 
            />
          </div>
        </Card>

        <Card title="Department Overview" className="col-span-1 lg:col-span-2 overflow-hidden">
          <Table 
            columns={departmentColumns} 
            data={data.departments} 
            keyExtractor={(row) => row.id} 
            className="border-0 shadow-none"
          />
        </Card>
      </div>

      <Card title="Recent Platform Activity">
        <div className="space-y-4">
          {data.recentActivities.length > 0 ? (
            data.recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-4 p-4 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                <div className={`p-2 rounded-full ${
                  activity.status === 'Success' ? 'bg-emerald-100 text-emerald-600' :
                  activity.status === 'Pending' ? 'bg-amber-100 text-amber-600' :
                  'bg-slate-100 text-slate-600'
                }`}>
                  {activity.status === 'Success' ? <CheckCircle2 className="w-4 h-4" /> :
                   activity.status === 'Pending' ? <Clock className="w-4 h-4" /> :
                   <Activity className="w-4 h-4" />}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className="text-sm font-semibold text-slate-800">{activity.type}</h4>
                    <span className="text-xs text-slate-500">{activity.timestamp}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">{activity.description}</p>
                </div>
              </div>
            ))
          ) : (
            <EmptyState title="No Activity" description="There has been no recent platform activity." />
          )}
        </div>
      </Card>
    </div>
  );
};
