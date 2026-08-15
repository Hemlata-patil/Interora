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
  Button,
  Modal
} from '@/components';
import type { Column } from '@/components';
import { Search, Award, CheckCircle2, XCircle, AlertCircle, Ban, RefreshCw } from 'lucide-react';
import { fetchAdminCertificates } from './mockData';
import type { AdminCertificateData, AdminCertificateRecord } from './types';

export const AdminCertificateManagement: React.FC = () => {
  const [data, setData] = useState<AdminCertificateData | null>(null);
  const [certificates, setCertificates] = useState<AdminCertificateRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Confirmation Modal State
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [targetCertificate, setTargetCertificate] = useState<AdminCertificateRecord | null>(null);
  const [actionType, setActionType] = useState<'Revoke' | 'Restore'>('Revoke');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const result = await fetchAdminCertificates();
        setData(result);
        if (result) {
          setCertificates(result.certificates);
        }
      } catch (err) {
        setError('Failed to fetch certificates data.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredCertificates = useMemo(() => {
    return certificates.filter((item) => {
      const matchesSearch = 
        item.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || item.status.toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [certificates, searchTerm, statusFilter]);

  const totalIssued = certificates.length;
  const validCertificates = certificates.filter(c => c.status === 'Valid').length;
  const revokedCertificates = certificates.filter(c => c.status === 'Revoked').length;

  const handleActionClick = (cert: AdminCertificateRecord, type: 'Revoke' | 'Restore') => {
    setTargetCertificate(cert);
    setActionType(type);
    setIsConfirmModalOpen(true);
  };

  const confirmAction = () => {
    if (targetCertificate) {
      setCertificates(certificates.map(c => 
        c.id === targetCertificate.id 
          ? { ...c, status: actionType === 'Revoke' ? 'Revoked' : 'Valid' } 
          : c
      ));
    }
    setIsConfirmModalOpen(false);
    setTargetCertificate(null);
  };

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
    },
    {
      header: 'Actions',
      cell: (row) => (
        <div className="flex items-center justify-end pr-4">
          {row.status === 'Valid' ? (
            <Button variant="ghost" size="sm" onClick={() => handleActionClick(row, 'Revoke')}>
              <Ban className="w-4 h-4 text-rose-500 mr-2" /> Revoke
            </Button>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => handleActionClick(row, 'Restore')}>
              <RefreshCw className="w-4 h-4 text-emerald-500 mr-2" /> Restore
            </Button>
          )}
        </div>
      ),
      className: 'text-right'
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Certificate Management" description="Monitor and audit platform-issued certificates." />
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard title="Total Issued" value={totalIssued} icon={Award} />
        <StatCard title="Valid Certificates" value={validCertificates} icon={CheckCircle2} />
        <StatCard title="Revoked Certificates" value={revokedCertificates} icon={XCircle} />
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

      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title={`Confirm ${actionType === 'Revoke' ? 'Revocation' : 'Restoration'}`}
        description={`Are you sure you want to ${actionType.toLowerCase()} the certificate for ${targetCertificate?.studentName} (ID: ${targetCertificate?.id})?`}
        footer={
          <>
            <Button variant="outline" onClick={() => setIsConfirmModalOpen(false)}>Cancel</Button>
            <Button 
              variant={actionType === 'Revoke' ? 'danger' : 'primary'} 
              onClick={confirmAction}
            >
              {actionType} Certificate
            </Button>
          </>
        }
      >
        <div className="py-2 text-sm text-slate-600">
          {actionType === 'Revoke' 
            ? 'Revoking this certificate will invalidate it across the entire platform. The student and any scanning parties will see it as Revoked.'
            : 'Restoring this certificate will re-validate it across the platform. The student will be able to share it as a valid credential again.'}
        </div>
      </Modal>

    </div>
  );
};

