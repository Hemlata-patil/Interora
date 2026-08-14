import React, { useEffect, useState, useMemo } from 'react';
import { 
  PageHeader, 
  Card, 
  Table, 
  Badge, 
  Input, 
  Select, 
  LoadingState, 
  EmptyState, 
  Alert,
  StatCard,
  Tabs
} from '@/components';
import type { Column } from '@/components';
import { Search, Briefcase, FileText, CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react';
import { fetchAdminOversight } from './mockData';
import type { AdminOversightData, AdminInternshipListing } from './types';
import type { ApplicationRecord, ApplicationStatus } from '@/types';

export const AdminInternshipOversight: React.FC = () => {
  const [data, setData] = useState<AdminOversightData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState('internships');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const result = await fetchAdminOversight();
        setData(result);
      } catch (err) {
        setError('Failed to fetch oversight data.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredInternships = useMemo(() => {
    if (!data) return [];
    return data.internships.filter((item) => {
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || item.companyName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [data, searchTerm, statusFilter]);

  const filteredApplications = useMemo(() => {
    if (!data) return [];
    return data.applications.filter((item) => {
      const matchesSearch = item.internshipTitle.toLowerCase().includes(searchTerm.toLowerCase()) || item.companyName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [data, searchTerm, statusFilter]);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Internship & Application Oversight" description="System-wide view of all platform internships and student applications." />
        <Card className="min-h-[400px] flex items-center justify-center">
          <LoadingState message="Loading oversight data..." />
        </Card>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-6">
        <PageHeader title="Internship & Application Oversight" description="System-wide view of all platform internships and student applications." />
        <Alert type="error" title="Error Loading Data">{error || 'Data unavailable'}</Alert>
        <Card className="min-h-[400px] flex items-center justify-center">
          <EmptyState title="Failed to Load" description="Could not fetch oversight statistics." icon={<AlertCircle className="w-6 h-6" />} />
        </Card>
      </div>
    );
  }

  const internshipColumns: Column<AdminInternshipListing>[] = [
    {
      header: 'Internship Title',
      cell: (row) => (
        <div>
          <div className="font-medium text-slate-900">{row.title}</div>
          <div className="text-xs text-slate-500">{row.companyName} • {row.location}</div>
        </div>
      )
    },
    {
      header: 'Status',
      cell: (row) => (
        <Badge variant={row.status === 'open' ? 'emerald' : 'neutral'} className="uppercase">
          {row.status}
        </Badge>
      )
    },
    {
      header: 'Applications',
      accessorKey: 'applicationCount',
      className: 'text-center'
    }
  ];

  const applicationColumns: Column<ApplicationRecord>[] = [
    {
      header: 'Application',
      cell: (row) => (
        <div>
          <div className="font-medium text-slate-900">{row.internshipTitle}</div>
          <div className="text-xs text-slate-500">{row.companyName}</div>
        </div>
      )
    },
    { header: 'Applied Date', accessorKey: 'appliedDate' },
    {
      header: 'Status',
      cell: (row) => {
        let variant: 'emerald' | 'amber' | 'indigo' | 'rose' | 'neutral' = 'neutral';
        let label = row.status.replace('_', ' ');
        switch (row.status) {
          case 'selected': variant = 'emerald'; break;
          case 'faculty_approved': variant = 'indigo'; break;
          case 'under_review': variant = 'amber'; break;
          case 'rejected': variant = 'rose'; break;
          case 'applied': variant = 'neutral'; break;
        }
        return <Badge variant={variant} className="capitalize">{label}</Badge>;
      }
    }
  ];

  const tabs = [
    { id: 'internships', label: 'Internships', count: data.stats.totalInternships },
    { id: 'applications', label: 'Applications', count: data.stats.totalApplications }
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Internship & Application Oversight" description="System-wide view of all platform internships and student applications." />
      
      {activeTab === 'internships' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Internships" value={data.stats.totalInternships} icon={Briefcase} />
          <StatCard title="Active Internships" value={data.stats.activeInternships} icon={CheckCircle2} />
          <StatCard title="Pending / Upcoming" value={data.stats.pendingInternships} icon={Clock} />
          <StatCard title="Closed / Completed" value={data.stats.completedInternships} icon={XCircle} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Applications" value={data.stats.totalApplications} icon={FileText} />
          <StatCard title="Under Review" value={data.stats.pendingApplications} icon={Clock} />
          <StatCard title="Approved / Selected" value={data.stats.approvedApplications} icon={CheckCircle2} />
          <StatCard title="Rejected" value={data.stats.rejectedApplications} icon={XCircle} />
        </div>
      )}

      <Card>
        <div className="px-6 pt-4">
          <Tabs tabs={tabs} activeTab={activeTab} onChange={(id) => { setActiveTab(id); setSearchTerm(''); setStatusFilter('all'); }} />
        </div>

        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <div className="w-full sm:w-72">
              <Input
                placeholder={`Search ${activeTab}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-48">
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={activeTab === 'internships' ? [
                  { label: 'All Statuses', value: 'all' },
                  { label: 'Open', value: 'open' },
                  { label: 'Closed', value: 'closed' }
                ] : [
                  { label: 'All Statuses', value: 'all' },
                  { label: 'Applied', value: 'applied' },
                  { label: 'Under Review', value: 'under_review' },
                  { label: 'Faculty Approved', value: 'faculty_approved' },
                  { label: 'Selected', value: 'selected' },
                  { label: 'Rejected', value: 'rejected' }
                ]}
              />
            </div>
          </div>
        </div>

        <div className="w-full overflow-hidden">
          {activeTab === 'internships' ? (
            filteredInternships.length > 0 ? (
              <Table columns={internshipColumns} data={filteredInternships} keyExtractor={(item) => item.id} className="border-0 shadow-none rounded-none" />
            ) : (
              <EmptyState title="No Internships Found" description="Try adjusting your search or filters." icon={<Briefcase className="w-6 h-6" />} className="border-0 shadow-none my-8" />
            )
          ) : (
            filteredApplications.length > 0 ? (
              <Table columns={applicationColumns} data={filteredApplications} keyExtractor={(item) => item.id} className="border-0 shadow-none rounded-none" />
            ) : (
              <EmptyState title="No Applications Found" description="Try adjusting your search or filters." icon={<FileText className="w-6 h-6" />} className="border-0 shadow-none my-8" />
            )
          )}
        </div>
      </Card>
    </div>
  );
};
