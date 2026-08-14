import React, { useEffect, useState } from 'react';
import { 
  PageHeader, 
  Card, 
  Table, 
  Badge, 
  LoadingState, 
  EmptyState, 
  Alert,
  StatCard
} from '@/components';
import type { Column } from '@/components';
import { fetchAdminAnalytics } from './mockData';
import type { AdminAnalyticsData, RecentAiActivity } from './types';
import { 
  Users, 
  HardDrive, 
  Cpu, 
  Sparkles, 
  FileText, 
  Zap, 
  TrendingUp, 
  Building2, 
  GraduationCap 
} from 'lucide-react';

export const AdminAnalytics: React.FC = () => {
  const [data, setData] = useState<AdminAnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const result = await fetchAdminAnalytics();
        setData(result);
      } catch (err) {
        setError('Failed to fetch analytics data.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Analytics & AI Oversight" description="Monitor platform health, growth, and AI module usage." />
        <Card className="min-h-[400px] flex items-center justify-center">
          <LoadingState message="Loading analytics..." />
        </Card>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-6">
        <PageHeader title="Analytics & AI Oversight" description="Monitor platform health, growth, and AI module usage." />
        <Alert type="error" title="Error Loading Data">{error || 'Data unavailable'}</Alert>
        <Card className="min-h-[400px] flex items-center justify-center">
          <EmptyState title="Failed to Load" description="Could not fetch analytics statistics." />
        </Card>
      </div>
    );
  }

  const columns: Column<RecentAiActivity>[] = [
    { header: 'Action', accessorKey: 'action', className: 'font-medium text-slate-900' },
    { header: 'Target User', accessorKey: 'targetUser' },
    { header: 'Timestamp', accessorKey: 'timestamp', className: 'text-slate-500' },
    {
      header: 'Status',
      cell: (row) => {
        if (row.status === 'Success') return <Badge variant="emerald">SUCCESS</Badge>;
        if (row.status === 'Processing') return <Badge variant="amber">PROCESSING</Badge>;
        return <Badge variant="rose">FAILED</Badge>;
      }
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Analytics & AI Oversight" description="Monitor platform health, growth, and AI module usage." />
      
      {/* System Health */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">System Health</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard title="Active Users" value={data.systemHealth.activeUsers.toLocaleString()} icon={Users} />
          <StatCard title="Storage Used (GB)" value={data.systemHealth.storageUsedGB} icon={HardDrive} />
          <StatCard title="Compute Load" value={`${data.systemHealth.computeLoadPercent}%`} icon={Cpu} />
        </div>
      </div>

      {/* AI Metrics */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4 mt-8">AI Service Metrics</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard title="Recommendations Gen." value={data.aiMetrics.recommendationsGenerated.toLocaleString()} icon={Sparkles} />
          <StatCard title="Profile Analyses" value={data.aiMetrics.profileAnalyses.toLocaleString()} icon={FileText} />
          
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-slate-100 rounded-lg">
                <Zap className="w-5 h-5 text-slate-600" />
              </div>
              <p className="text-sm font-medium text-slate-600">API Credits</p>
            </div>
            <div className="flex items-end gap-2 mb-3">
              <span className="text-2xl font-bold text-slate-900">{data.aiMetrics.apiCreditsUsed.toLocaleString()}</span>
              <span className="text-sm font-medium text-slate-500 mb-1">/ {data.aiMetrics.apiCreditsTotal.toLocaleString()}</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2">
              <div 
                className="bg-indigo-600 h-2 rounded-full" 
                style={{ width: `${(data.aiMetrics.apiCreditsUsed / data.aiMetrics.apiCreditsTotal) * 100}%` }}
              />
            </div>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        {/* Recent AI Activity */}
        <div className="lg:col-span-2">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent AI Activity</h3>
          <Card>
            <div className="w-full overflow-hidden">
              <Table columns={columns} data={data.recentAiActivity} keyExtractor={(item) => item.id} className="border-0 shadow-none rounded-none" />
            </div>
          </Card>
        </div>

        {/* Platform Growth */}
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-4">MOM Growth</h3>
          <Card className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <GraduationCap className="w-5 h-5 text-indigo-600" />
                <span className="font-medium text-slate-900">Students</span>
              </div>
              <Badge variant="emerald" className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                {data.platformGrowth.studentGrowthPercent}%
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-emerald-600" />
                <span className="font-medium text-slate-900">Faculty</span>
              </div>
              <Badge variant="emerald" className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                {data.platformGrowth.facultyGrowthPercent}%
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5 text-amber-600" />
                <span className="font-medium text-slate-900">Companies</span>
              </div>
              <Badge variant="emerald" className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                {data.platformGrowth.companyGrowthPercent}%
              </Badge>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
