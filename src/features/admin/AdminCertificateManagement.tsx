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
  StatCard
} from '@/components';
import type { Column } from '@/components';
import { Search, Award, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { fetchAdminCertificates } from './mockData';
import type { AdminCertificateData, AdminCertificateRecord } from './types';

export const AdminCertificateManagement: React.FC = () => {
  const [data, setData] = useState<AdminCertificateData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const result = await fetchAdminCertificates();
        setData(result);
      } catch (err) {
        setError('Failed to fetch certificates data.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredCertificates = useMemo(() => {
    if (!data) return [];
    return data.certificates.filter((item) => {
      const matchesSearch = 
        item.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || item.status.toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [data, searchTerm, statusFilter]);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Certificate Management" description="Monitor and audit platform-issued certificates." />
        <Card className="min-h-[400px] flex items-center justify-center">
          <LoadingState message="Loading certificate data..." />
        </Card>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-6">
        <PageHeader title="Certificate Management" description="Monitor and audit platform-issued certificates." />
        <Alert type="error" title="Error Loading Data">{error || 'Data unavailable'}</Alert>
        <Card className="min-h-[400px] flex items-center justify-center">
          <EmptyState title="Failed to Load" description="Could not fetch certificate statistics." icon={<AlertCircle className="w-6 h-6" />} />
        </Card>
      </div>
    );
  }

  const columns: Column<AdminCertificateRecord>[] = [
    {
      header: 'Certificate ID',
      accessorKey: 'id',
      className: 'font-mono text-sm text-slate-600'
    },
    {
      header: 'Student',
      accessorKey: 'studentName',
      className: 'font-medium text-slate-900'
    },
    {
      header: 'Internship / Company',
      cell: (row) => (
        <div>
          <div className="text-sm font-medium text-slate-900">{row.internshipTitle}</div>
          <div className="text-xs text-slate-500">{row.companyName}</div>
        </div>
      )
    },
    {
      header: 'Issue Date',
      accessorKey: 'issueDate'
    },
    {
      header: 'Status',
      cell: (row) => (
        <Badge variant={row.status === 'Valid' ? 'emerald' : 'rose'} className="uppercase">
          {row.status}
        </Badge>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Certificate Management" description="Monitor and audit platform-issued certificates." />
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard title="Total Issued" value={data.stats.totalIssued} icon={Award} />
        <StatCard title="Valid Certificates" value={data.stats.validCertificates} icon={CheckCircle2} />
        <StatCard title="Revoked Certificates" value={data.stats.revokedCertificates} icon={XCircle} />
      </div>

      <Card>
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <div className="w-full sm:w-80">
              <Input
                placeholder="Search by student, company, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-48">
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { label: 'All Statuses', value: 'all' },
                  { label: 'Valid', value: 'valid' },
                  { label: 'Revoked', value: 'revoked' }
                ]}
              />
            </div>
          </div>
        </div>

        <div className="w-full overflow-hidden">
          {filteredCertificates.length > 0 ? (
            <Table columns={columns} data={filteredCertificates} keyExtractor={(item) => item.id} className="border-0 shadow-none rounded-none" />
          ) : (
            <EmptyState title="No Certificates Found" description="Try adjusting your search or filters." icon={<Award className="w-6 h-6" />} className="border-0 shadow-none my-8" />
          )}
        </div>
      </Card>
    </div>
  );
};
