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
  Tabs,
  Button,
  Modal
} from '@/components';
import type { Column } from '@/components';
import { Search, Briefcase, FileText, CheckCircle2, Clock, XCircle, AlertCircle, Edit2, Trash2, Plus } from 'lucide-react';
import { fetchAdminOversight } from './mockData';
import type { AdminOversightData, AdminInternshipListing } from './types';
import type { ApplicationRecord, ApplicationStatus } from '@/types';

export const AdminInternshipOversight: React.FC = () => {
  const [data, setData] = useState<AdminOversightData | null>(null);
  const [internships, setInternships] = useState<AdminInternshipListing[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState('internships');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal states for CRUD
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInternship, setEditingInternship] = useState<AdminInternshipListing | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    companyName: '',
    location: '',
    stipend: '',
    duration: '',
    requiredSkills: '',
    status: 'open' as 'open' | 'closed'
  });

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [internshipToDelete, setInternshipToDelete] = useState<AdminInternshipListing | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const result = await fetchAdminOversight();
        setData(result);
        if (result) {
          setInternships(result.internships);
        }
      } catch (err) {
        setError('Failed to fetch oversight data.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredInternships = useMemo(() => {
    return internships.filter((item) => {
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || item.companyName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [internships, searchTerm, statusFilter]);

  const filteredApplications = useMemo(() => {
    if (!data) return [];
    return data.applications.filter((item) => {
      const matchesSearch = item.internshipTitle.toLowerCase().includes(searchTerm.toLowerCase()) || item.companyName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [data, searchTerm, statusFilter]);

  // CRUD Handlers
  const handleOpenAddModal = () => {
    setEditingInternship(null);
    setFormData({
      title: '',
      companyName: '',
      location: '',
      stipend: '',
      duration: '',
      requiredSkills: '',
      status: 'open'
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (internship: AdminInternshipListing) => {
    setEditingInternship(internship);
    setFormData({
      title: internship.title,
      companyName: internship.companyName,
      location: internship.location,
      stipend: internship.stipend,
      duration: internship.duration,
      requiredSkills: internship.requiredSkills.join(', '),
      status: internship.status
    });
    setIsModalOpen(true);
  };

  const handleSaveInternship = () => {
    const skillsArray = formData.requiredSkills.split(',').map(s => s.trim()).filter(Boolean);
    
    if (editingInternship) {
      setInternships(internships.map(i => i.id === editingInternship.id ? { 
        ...i, 
        ...formData,
        requiredSkills: skillsArray
      } : i));
    } else {
      const newInternship: AdminInternshipListing = {
        id: `mock-int-${Date.now()}`,
        createdAt: new Date().toISOString().split('T')[0],
        applicationCount: 0,
        ...formData,
        requiredSkills: skillsArray
      };
      setInternships([newInternship, ...internships]);
    }
    setIsModalOpen(false);
  };

  const handleDeleteClick = (internship: AdminInternshipListing) => {
    setInternshipToDelete(internship);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (internshipToDelete) {
      setInternships(internships.filter(i => i.id !== internshipToDelete.id));
    }
    setIsDeleteModalOpen(false);
    setInternshipToDelete(null);
  };

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
    },
    {
      header: 'Actions',
      cell: (row) => (
        <div className="flex items-center justify-end gap-2 pr-4">
          <Button variant="ghost" size="sm" onClick={() => handleOpenEditModal(row)}>
            <Edit2 className="w-4 h-4 text-slate-500" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleDeleteClick(row)}>
            <Trash2 className="w-4 h-4 text-rose-500" />
          </Button>
        </div>
      ),
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
    { id: 'internships', label: 'Internships', count: internships.length },
    { id: 'applications', label: 'Applications', count: data.applications.length }
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Internship & Application Oversight" description="System-wide view of all platform internships and student applications." />
      
      {activeTab === 'internships' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Internships" value={internships.length} icon={Briefcase} />
          <StatCard title="Active Internships" value={internships.filter(i => i.status === 'open').length} icon={CheckCircle2} />
          <StatCard title="Closed Internships" value={internships.filter(i => i.status === 'closed').length} icon={XCircle} />
          <StatCard title="Total Applications" value={data.stats.totalApplications} icon={FileText} />
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
          {activeTab === 'internships' && (
            <Button onClick={handleOpenAddModal}>
              <Plus className="w-4 h-4 mr-2" /> Add Internship
            </Button>
          )}
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

      {/* CRUD Modals for Internships */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingInternship ? 'Edit Internship' : 'Add New Internship'}
        description="Enter the internship details below."
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveInternship}>{editingInternship ? 'Save Changes' : 'Create Internship'}</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Internship Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
          <Input label="Company Name" value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} />
          <Input label="Location" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Stipend" value={formData.stipend} onChange={e => setFormData({...formData, stipend: e.target.value})} />
            <Input label="Duration" value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} />
          </div>
          <Input 
            label="Required Skills (comma separated)" 
            value={formData.requiredSkills} 
            onChange={e => setFormData({...formData, requiredSkills: e.target.value})} 
            placeholder="e.g. React, TypeScript, Node.js"
          />
          <Select 
            label="Status" 
            value={formData.status} 
            onChange={e => setFormData({...formData, status: e.target.value as 'open' | 'closed'})}
            options={[
              { label: 'Open', value: 'open' },
              { label: 'Closed', value: 'closed' },
            ]}
          />
        </div>
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Deletion"
        description={`Are you sure you want to delete "${internshipToDelete?.title}" at ${internshipToDelete?.companyName}? This action cannot be undone.`}
        footer={
          <>
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={confirmDelete}>Delete Internship</Button>
          </>
        }
      >
        <div className="py-2 text-sm text-slate-600">
          Deleting this internship will remove it from the platform. Alternatively, you can edit it and set its status to Closed.
        </div>
      </Modal>

    </div>
  );
};
