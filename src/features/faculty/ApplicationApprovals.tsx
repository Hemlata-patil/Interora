import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  PageHeader, 
  StatCard, 
  Table, 
  Badge, 
  Button, 
  Modal, 
  Input, 
  Select, 
  EmptyState 
} from '@/components';
import { FileText, CheckCircle, XCircle, Clock, Loader2, AlertCircle } from 'lucide-react';
import type { Column } from '@/components/ui/Table';
import {
  fetchFacultyApplicationsBackend,
  decideFacultyApplicationBackend,
  type FacultyApplicationItem,
} from '@/services/api/backendService';

export const ApplicationApprovals: React.FC = () => {
  const [applications, setApplications] = useState<FacultyApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<FacultyApplicationItem | null>(null);
  const [rating, setRating] = useState<number>(0);

  const loadApplications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchFacultyApplicationsBackend();
      setApplications(data);
    } catch (err: any) {
      console.error('Failed to load faculty applications:', err);
      setError(err?.message || 'Failed to load applications. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  // Derived stats
  const total = applications.length;
  const pending = applications.filter(a => a.applicationStatus === 'Pending').length;
  const approved = applications.filter(a => a.applicationStatus === 'Approved').length;
  const rejected = applications.filter(a => a.applicationStatus === 'Rejected').length;

  // Filtering
  const filteredApps = useMemo(() => {
    return applications.filter(app => {
      const matchesSearch = 
        app.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        app.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.company.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'All' || app.applicationStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [applications, searchTerm, statusFilter]);

  const handleApprove = async (id: string) => {
    try {
      setActionLoading(id);
      await decideFacultyApplicationBackend(id, 'approve', rating > 0 ? rating : undefined);
      
      setApplications(prev => prev.map(app => 
        app.id === id ? { ...app, applicationStatus: 'Approved', facultyRating: rating > 0 ? rating : app.facultyRating } : app
      ));
      if (selectedApp && selectedApp.id === id) {
        setSelectedApp({ ...selectedApp, applicationStatus: 'Approved', facultyRating: rating > 0 ? rating : selectedApp.facultyRating });
      }
      setIsModalOpen(false);
      setRating(0);
    } catch (err: any) {
      console.error('Error approving application:', err);
      alert(err?.message || 'Failed to approve application.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    try {
      setActionLoading(id);
      await decideFacultyApplicationBackend(id, 'reject');
      
      setApplications(prev => prev.map(app => 
        app.id === id ? { ...app, applicationStatus: 'Rejected' } : app
      ));
      if (selectedApp && selectedApp.id === id) {
        setSelectedApp({ ...selectedApp, applicationStatus: 'Rejected' });
      }
      setIsModalOpen(false);
    } catch (err: any) {
      console.error('Error rejecting application:', err);
      alert(err?.message || 'Failed to reject application.');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadgeVariant = (status: 'Pending' | 'Approved' | 'Rejected') => {
    switch (status) {
      case 'Pending': return 'amber';
      case 'Approved': return 'emerald';
      case 'Rejected': return 'rose';
      default: return 'neutral';
    }
  };

  const columns: Column<FacultyApplicationItem>[] = [
    {
      header: 'Student',
      accessorKey: 'studentName',
      className: 'font-medium',
    },
    {
      header: 'Internship',
      accessorKey: 'role',
    },
    {
      header: 'Company',
      accessorKey: 'company',
    },
    {
      header: 'Applied Date',
      accessorKey: 'appliedDate',
    },
    {
      header: 'Status',
      cell: (row) => (
        <Badge variant={getStatusBadgeVariant(row.applicationStatus)}>
          {row.applicationStatus}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      cell: (row) => (
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              setSelectedApp(row);
              setRating(row.facultyRating || 0);
              setIsModalOpen(true);
            }}
          >
            View
          </Button>
          {row.applicationStatus === 'Pending' && (
            <>
              <Button 
                variant="primary" 
                size="sm" 
                className="bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500 border-transparent"
                onClick={() => handleApprove(row.id)}
                disabled={actionLoading === row.id}
              >
                {actionLoading === row.id ? 'Processing...' : 'Approve'}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-rose-600 border-rose-200 hover:bg-rose-50 hover:border-rose-300"
                onClick={() => handleReject(row.id)}
                disabled={actionLoading === row.id}
              >
                {actionLoading === row.id ? 'Processing...' : 'Reject'}
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Application Approvals"
        description="Review and manage student internship applications requiring faculty approval."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Applications" value={total} icon={FileText} />
        <StatCard title="Pending Review" value={pending} icon={Clock} />
        <StatCard title="Approved" value={approved} icon={CheckCircle} />
        <StatCard title="Rejected" value={rejected} icon={XCircle} />
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 items-end">
          <div className="w-full sm:max-w-xs">
            <Input 
              placeholder="Search student, role, or company..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              label="Search"
            />
          </div>
          <div className="w-full sm:max-w-xs">
            <Select 
              label="Filter by Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { label: 'All Statuses', value: 'All' },
                { label: 'Pending', value: 'Pending' },
                { label: 'Approved', value: 'Approved' },
                { label: 'Rejected', value: 'Rejected' },
              ]}
            />
          </div>
        </div>

        <div className="p-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
              <p className="text-sm">Loading applications...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 text-rose-600">
              <AlertCircle className="w-8 h-8 mb-2" />
              <p className="text-sm font-medium">{error}</p>
              <Button variant="outline" size="sm" onClick={loadApplications} className="mt-4">
                Retry
              </Button>
            </div>
          ) : filteredApps.length > 0 ? (
            <Table 
              columns={columns} 
              data={filteredApps} 
              keyExtractor={(row) => row.id} 
            />
          ) : (
            <EmptyState 
              title="No applications found" 
              description="No applications found matching your criteria."
            />
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Application Details"
        description="Review the full application before making a decision."
      >
        {selectedApp && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-500 font-semibold mb-1">Student</p>
                <p className="text-slate-900">{selectedApp.studentName}</p>
                <p className="text-slate-500 text-xs">{selectedApp.email}</p>
              </div>
              <div>
                <p className="text-slate-500 font-semibold mb-1">Status</p>
                <Badge variant={getStatusBadgeVariant(selectedApp.applicationStatus)}>
                  {selectedApp.applicationStatus}
                </Badge>
              </div>
              <div>
                <p className="text-slate-500 font-semibold mb-1">Internship</p>
                <p className="text-slate-900">{selectedApp.role}</p>
              </div>
              <div>
                <p className="text-slate-500 font-semibold mb-1">Company</p>
                <p className="text-slate-900">{selectedApp.company}</p>
              </div>
              <div>
                <p className="text-slate-500 font-semibold mb-1">Applied Date</p>
                <p className="text-slate-900">{selectedApp.appliedDate}</p>
              </div>
            </div>

            <div>
              <p className="text-slate-500 font-semibold mb-2 text-sm">Skills Match</p>
              <div className="flex flex-wrap gap-2">
                {selectedApp.skills && selectedApp.skills.length > 0 ? (
                  selectedApp.skills.map((skill, i) => (
                    <Badge key={i} variant="indigo">{skill}</Badge>
                  ))
                ) : (
                  <span className="text-xs text-slate-400">No skills specified</span>
                )}
              </div>
            </div>

            <div>
              <p className="text-slate-500 font-semibold mb-2 text-sm">Cover Message</p>
              <div className="bg-slate-50 p-4 rounded-lg text-sm text-slate-700 border border-slate-100">
                {selectedApp.coverMessage || 'No cover message provided.'}
              </div>
            </div>

            {selectedApp.applicationStatus === 'Pending' && (
              <div className="pt-4 border-t border-slate-100 flex flex-col space-y-4">
                <div>
                  <p className="text-slate-500 font-semibold mb-2 text-sm">Faculty Rating</p>
                  <div className="flex items-center space-x-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className={`text-2xl focus:outline-none transition-colors ${
                          rating >= star ? 'text-amber-400' : 'text-slate-200 hover:text-slate-300'
                        }`}
                      >
                        ★
                      </button>
                    ))}
                    <span className="ml-3 text-sm font-medium text-slate-600">
                      {rating > 0 ? `${rating} / 5` : 'Select a rating'}
                    </span>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 pt-2">
                  <Button 
                    variant="outline"
                    className="text-rose-600 border-rose-200 hover:bg-rose-50"
                    onClick={() => handleReject(selectedApp.id)}
                    disabled={actionLoading === selectedApp.id}
                  >
                    {actionLoading === selectedApp.id ? 'Processing...' : 'Reject Application'}
                  </Button>
                  <Button 
                    variant="primary"
                    className="bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => handleApprove(selectedApp.id)}
                    disabled={rating === 0 || actionLoading === selectedApp.id}
                  >
                    {actionLoading === selectedApp.id ? 'Processing...' : 'Approve Application'}
                  </Button>
                </div>
              </div>
            )}
            {selectedApp.applicationStatus !== 'Pending' && selectedApp.facultyRating && (
              <div className="pt-4 border-t border-slate-100">
                <p className="text-slate-500 font-semibold mb-2 text-sm">Faculty Rating</p>
                <div className="flex items-center">
                  <span className="text-amber-400 text-lg mr-2">{'★'.repeat(selectedApp.facultyRating)}{'☆'.repeat(5 - selectedApp.facultyRating)}</span>
                  <span className="text-sm font-medium text-slate-700">{selectedApp.facultyRating} / 5</span>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
