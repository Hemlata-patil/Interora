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
import { Search, Building2, Users, CheckCircle2, Clock, XCircle, AlertCircle, Briefcase } from 'lucide-react';
import { fetchAdminOrganizations } from './mockData';
import type { AdminOrganizationsData, CompanyOversightRecord, DepartmentOversightRecord } from './types';

export const AdminOrganizationsOversight: React.FC = () => {
  const [data, setData] = useState<AdminOrganizationsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState('departments');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const result = await fetchAdminOrganizations();
        setData(result);
      } catch (err) {
        setError('Failed to fetch organizations data.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredDepartments = useMemo(() => {
    if (!data) return [];
    return data.departments.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.headOfDepartment.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || item.status.toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [data, searchTerm, statusFilter]);

  const filteredCompanies = useMemo(() => {
    if (!data) return [];
    return data.companies.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.industry.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || item.status.toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [data, searchTerm, statusFilter]);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Organizations Oversight" description="Manage and monitor platform departments and partner companies." />
        <Card className="min-h-[400px] flex items-center justify-center">
          <LoadingState message="Loading organizations data..." />
        </Card>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-6">
        <PageHeader title="Organizations Oversight" description="Manage and monitor platform departments and partner companies." />
        <Alert type="error" title="Error Loading Data">{error || 'Data unavailable'}</Alert>
        <Card className="min-h-[400px] flex items-center justify-center">
          <EmptyState title="Failed to Load" description="Could not fetch organizations statistics." icon={<AlertCircle className="w-6 h-6" />} />
        </Card>
      </div>
    );
  }

  const departmentColumns: Column<DepartmentOversightRecord>[] = [
    {
      header: 'Department',
      cell: (row) => (
        <div>
          <div className="font-medium text-slate-900">{row.name}</div>
          <div className="text-xs text-slate-500">Head: {row.headOfDepartment}</div>
        </div>
      )
    },
    {
      header: 'Students',
      accessorKey: 'totalStudents',
      className: 'text-right'
    },
    {
      header: 'Faculty',
      accessorKey: 'totalFaculty',
      className: 'text-right'
    },
    {
      header: 'Status',
      cell: (row) => (
        <div className="flex justify-end">
          <Badge variant={row.status === 'Active' ? 'emerald' : 'neutral'} className="uppercase">
            {row.status}
          </Badge>
        </div>
      ),
      className: 'text-right'
    }
  ];

  const companyColumns: Column<CompanyOversightRecord>[] = [
    {
      header: 'Company',
      cell: (row) => (
        <div>
          <div className="font-medium text-slate-900 flex items-center space-x-2">
            <span>{row.name}</span>
            {row.verified && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
          </div>
          <div className="text-xs text-slate-500">{row.industry}</div>
        </div>
      )
    },
    {
      header: 'Active Internships',
      accessorKey: 'activeInternshipsCount',
      className: 'text-center'
    },
    {
      header: 'Total Hired',
      accessorKey: 'totalInternsHired',
      className: 'text-center'
    },
    {
      header: 'Status',
      cell: (row) => {
        let variant: 'emerald' | 'amber' | 'rose' | 'neutral' = 'neutral';
        switch (row.status) {
          case 'Active': variant = 'emerald'; break;
          case 'Pending': variant = 'amber'; break;
          case 'Suspended': variant = 'rose'; break;
        }
        return (
          <div className="flex justify-end">
            <Badge variant={variant} className="uppercase">{row.status}</Badge>
          </div>
        );
      },
      className: 'text-right'
    }
  ];

  const tabs = [
    { id: 'departments', label: 'Departments', count: data.stats.totalDepartments },
    { id: 'companies', label: 'Companies', count: data.stats.totalCompanies }
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Organizations Oversight" description="Manage and monitor platform departments and partner companies." />
      
      {activeTab === 'departments' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Departments" value={data.stats.totalDepartments} icon={Building2} />
          <StatCard title="Active Departments" value={data.stats.activeDepartments} icon={CheckCircle2} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Companies" value={data.stats.totalCompanies} icon={Briefcase} />
          <StatCard title="Active Companies" value={data.stats.activeCompanies} icon={CheckCircle2} />
          <StatCard title="Pending Verifications" value={data.stats.pendingVerifications} icon={Clock} />
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
                options={activeTab === 'departments' ? [
                  { label: 'All Statuses', value: 'all' },
                  { label: 'Active', value: 'active' },
                  { label: 'Inactive', value: 'inactive' }
                ] : [
                  { label: 'All Statuses', value: 'all' },
                  { label: 'Active', value: 'active' },
                  { label: 'Pending', value: 'pending' },
                  { label: 'Suspended', value: 'suspended' }
                ]}
              />
            </div>
          </div>
        </div>

        <div className="w-full overflow-hidden">
          {activeTab === 'departments' ? (
            filteredDepartments.length > 0 ? (
              <Table columns={departmentColumns} data={filteredDepartments} keyExtractor={(item) => item.id} className="border-0 shadow-none rounded-none" />
            ) : (
              <EmptyState title="No Departments Found" description="Try adjusting your search or filters." icon={<Building2 className="w-6 h-6" />} className="border-0 shadow-none my-8" />
            )
          ) : (
            filteredCompanies.length > 0 ? (
              <Table columns={companyColumns} data={filteredCompanies} keyExtractor={(item) => item.id} className="border-0 shadow-none rounded-none" />
            ) : (
              <EmptyState title="No Companies Found" description="Try adjusting your search or filters." icon={<Briefcase className="w-6 h-6" />} className="border-0 shadow-none my-8" />
            )
          )}
        </div>
      </Card>
    </div>
  );
};
