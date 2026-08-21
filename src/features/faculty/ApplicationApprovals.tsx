import React, { useState, useMemo } from 'react';
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
import { mockFacultyStudents, mockCompanyApplications, setMockCompanyApplications } from './mockData';
import type { SharedStudentData, ApplicationStatus } from './mockData';
import { FileText, CheckCircle, XCircle, Clock } from 'lucide-react';
import type { Column } from '@/components/ui/Table';

export const ApplicationApprovals: React.FC = () => {
  const [applications, setApplications] = useState<SharedStudentData[]>(mockFacultyStudents);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<SharedStudentData | null>(null);

  // Derived stats
  const total = applications.length;
  const pending = applications.filter(a => a.applicationStatus === 'Pending').length;
  const approved = applications.filter(a => a.applicationStatus === 'Approved').length;
  const rejected = applications.filter(a => a.applicationStatus === 'Rejected').length;

  // Filtering
  const filteredApps = useMemo(() => {
    return applications.filter(app => {
      const matchesSearch = app.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            app.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            app.company.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'All' || app.applicationStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [applications, searchTerm, statusFilter]);

  const handleApprove = (id: string) => {
    setApplications(prev => prev.map(app => 
      app.id === id ? { ...app, applicationStatus: 'Approved' } : app
    ));
    if (selectedApp && selectedApp.id === id) {
      setSelectedApp({ ...selectedApp, applicationStatus: 'Approved' });
    }
  };

  const handleReject = (id: string) => {
    setApplications(prev => prev.map(app => 
      app.id === id ? { ...app, applicationStatus: 'Rejected' } : app
    ));
    if (selectedApp && selectedApp.id === id) {
      setSelectedApp({ ...selectedApp, applicationStatus: 'Rejected' });
    }
  };

  const getStatusBadgeVariant = (status: ApplicationStatus) => {
    switch (status) {
      case 'Pending': return 'amber';
      case 'Approved': return 'emerald';
      case 'Rejected': return 'rose';
      default: return 'neutral';
    }
  };

  const columns: Column<SharedStudentData>[] = [
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
              >
                Approve
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-rose-600 border-rose-200 hover:bg-rose-50 hover:border-rose-300"
                onClick={() => handleReject(row.id)}
              >
                Reject
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
          {filteredApps.length > 0 ? (
            <Table 
              columns={columns} 
              data={filteredApps} 
              keyExtractor={(row) => row.id} 
            />
          ) : (
            <EmptyState 
              title="No applications found" 
              description="Try adjusting your search or filter criteria to find what you are looking for."
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
                {selectedApp.skills.map((skill, i) => (
                  <Badge key={i} variant="indigo">{skill}</Badge>
                ))}
              </div>
            </div>

            <div>
              <p className="text-slate-500 font-semibold mb-2 text-sm">Cover Message</p>
              <div className="bg-slate-50 p-4 rounded-lg text-sm text-slate-700 border border-slate-100">
                {selectedApp.coverMessage}
              </div>
            </div>

            {selectedApp.applicationStatus === 'Pending' && (
              <div className="pt-4 border-t border-slate-100 flex justify-end space-x-3">
                <Button 
                  variant="outline"
                  className="text-rose-600 border-rose-200 hover:bg-rose-50"
                  onClick={() => handleReject(selectedApp.id)}
                >
                  Reject Application
                </Button>
                <Button 
                  variant="primary"
                  className="bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => handleApprove(selectedApp.id)}
                >
                  Approve Application
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
