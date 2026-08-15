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
import { Search, Building2, Users, CheckCircle2, Clock, XCircle, AlertCircle, Briefcase, Edit2, Trash2, Plus } from 'lucide-react';
import { fetchAdminOrganizations } from './mockData';
import type { AdminOrganizationsData, CompanyOversightRecord, DepartmentOversightRecord } from './types';

export const AdminOrganizationsOversight: React.FC = () => {
  const [data, setData] = useState<AdminOrganizationsData | null>(null);
  const [departments, setDepartments] = useState<DepartmentOversightRecord[]>([]);
  const [companies, setCompanies] = useState<CompanyOversightRecord[]>([]);
  
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState('departments');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal states
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<DepartmentOversightRecord | null>(null);
  const [deptForm, setDeptForm] = useState({ name: '', headOfDepartment: '', status: 'Active' as 'Active' | 'Inactive' });

  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<CompanyOversightRecord | null>(null);
  const [companyForm, setCompanyForm] = useState({ name: '', industry: '', verified: 'false', status: 'Active' as 'Active' | 'Pending' | 'Suspended' });

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: 'dept' | 'company', id: string, name: string } | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const result = await fetchAdminOrganizations();
        setData(result);
        if (result) {
          setDepartments(result.departments);
          setCompanies(result.companies);
        }
      } catch (err) {
        setError('Failed to fetch organizations data.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredDepartments = useMemo(() => {
    return departments.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.headOfDepartment.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || item.status.toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [departments, searchTerm, statusFilter]);

  const filteredCompanies = useMemo(() => {
    return companies.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.industry.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || item.status.toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [companies, searchTerm, statusFilter]);

  // Derived Stats
  const activeDepartments = departments.filter(d => d.status === 'Active').length;
  const activeCompanies = companies.filter(c => c.status === 'Active').length;
  const pendingVerifications = companies.filter(c => c.status === 'Pending').length;

  // Department Handlers
  const openAddDept = () => {
    setEditingDept(null);
    setDeptForm({ name: '', headOfDepartment: '', status: 'Active' });
    setIsDeptModalOpen(true);
  };

  const openEditDept = (dept: DepartmentOversightRecord) => {
    setEditingDept(dept);
    setDeptForm({ name: dept.name, headOfDepartment: dept.headOfDepartment, status: dept.status });
    setIsDeptModalOpen(true);
  };

  const saveDept = () => {
    if (editingDept) {
      setDepartments(departments.map(d => d.id === editingDept.id ? { ...d, ...deptForm } : d));
    } else {
      setDepartments([{
        id: `mock-dept-${Date.now()}`,
        totalStudents: 0,
        totalFaculty: 0,
        ...deptForm
      }, ...departments]);
    }
    setIsDeptModalOpen(false);
  };

  // Company Handlers
  const openAddCompany = () => {
    setEditingCompany(null);
    setCompanyForm({ name: '', industry: '', verified: 'false', status: 'Pending' });
    setIsCompanyModalOpen(true);
  };

  const openEditCompany = (comp: CompanyOversightRecord) => {
    setEditingCompany(comp);
    setCompanyForm({ name: comp.name, industry: comp.industry, verified: comp.verified ? 'true' : 'false', status: comp.status });
    setIsCompanyModalOpen(true);
  };

  const saveCompany = () => {
    if (editingCompany) {
      setCompanies(companies.map(c => c.id === editingCompany.id ? { 
        ...c, 
        ...companyForm, 
        verified: companyForm.verified === 'true' 
      } : c));
    } else {
      setCompanies([{
        id: `mock-comp-${Date.now()}`,
        activeInternshipsCount: 0,
        totalInternsHired: 0,
        ...companyForm,
        verified: companyForm.verified === 'true'
      }, ...companies]);
    }
    setIsCompanyModalOpen(false);
  };

  // Delete Handlers
  const confirmDelete = () => {
    if (itemToDelete?.type === 'dept') {
      setDepartments(departments.filter(d => d.id !== itemToDelete.id));
    } else if (itemToDelete?.type === 'company') {
      setCompanies(companies.filter(c => c.id !== itemToDelete.id));
    }
    setIsDeleteModalOpen(false);
    setItemToDelete(null);
  };

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
    },
    {
      header: 'Actions',
      cell: (row) => (
        <div className="flex items-center justify-end gap-2 pr-4">
          <Button variant="ghost" size="sm" onClick={() => openEditDept(row)}>
            <Edit2 className="w-4 h-4 text-slate-500" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => { setItemToDelete({ type: 'dept', id: row.id, name: row.name }); setIsDeleteModalOpen(true); }}>
            <Trash2 className="w-4 h-4 text-rose-500" />
          </Button>
        </div>
      ),
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
    },
    {
      header: 'Actions',
      cell: (row) => (
        <div className="flex items-center justify-end gap-2 pr-4">
          <Button variant="ghost" size="sm" onClick={() => openEditCompany(row)}>
            <Edit2 className="w-4 h-4 text-slate-500" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => { setItemToDelete({ type: 'company', id: row.id, name: row.name }); setIsDeleteModalOpen(true); }}>
            <Trash2 className="w-4 h-4 text-rose-500" />
          </Button>
        </div>
      ),
    }
  ];

  const tabs = [
    { id: 'departments', label: 'Departments', count: departments.length },
    { id: 'companies', label: 'Companies', count: companies.length }
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Organizations Oversight" description="Manage and monitor platform departments and partner companies." />
      
      {activeTab === 'departments' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Departments" value={departments.length} icon={Building2} />
          <StatCard title="Active Departments" value={activeDepartments} icon={CheckCircle2} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Companies" value={companies.length} icon={Briefcase} />
          <StatCard title="Active Companies" value={activeCompanies} icon={CheckCircle2} />
          <StatCard title="Pending Verifications" value={pendingVerifications} icon={Clock} />
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
          <Button onClick={activeTab === 'departments' ? openAddDept : openAddCompany}>
            <Plus className="w-4 h-4 mr-2" /> Add {activeTab === 'departments' ? 'Department' : 'Company'}
          </Button>
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

      {/* CRUD Modals */}
      <Modal
        isOpen={isDeptModalOpen}
        onClose={() => setIsDeptModalOpen(false)}
        title={editingDept ? 'Edit Department' : 'Add New Department'}
        description="Enter the department details below."
        footer={
          <>
            <Button variant="outline" onClick={() => setIsDeptModalOpen(false)}>Cancel</Button>
            <Button onClick={saveDept}>{editingDept ? 'Save Changes' : 'Create Department'}</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Department Name" value={deptForm.name} onChange={e => setDeptForm({...deptForm, name: e.target.value})} />
          <Input label="Head of Department" value={deptForm.headOfDepartment} onChange={e => setDeptForm({...deptForm, headOfDepartment: e.target.value})} />
          <Select 
            label="Status" 
            value={deptForm.status} 
            onChange={e => setDeptForm({...deptForm, status: e.target.value as 'Active' | 'Inactive'})}
            options={[
              { label: 'Active', value: 'Active' },
              { label: 'Inactive', value: 'Inactive' },
            ]}
          />
        </div>
      </Modal>

      <Modal
        isOpen={isCompanyModalOpen}
        onClose={() => setIsCompanyModalOpen(false)}
        title={editingCompany ? 'Edit Company' : 'Add New Company'}
        description="Enter the company details below."
        footer={
          <>
            <Button variant="outline" onClick={() => setIsCompanyModalOpen(false)}>Cancel</Button>
            <Button onClick={saveCompany}>{editingCompany ? 'Save Changes' : 'Add Company'}</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Company Name" value={companyForm.name} onChange={e => setCompanyForm({...companyForm, name: e.target.value})} />
          <Input label="Industry" value={companyForm.industry} onChange={e => setCompanyForm({...companyForm, industry: e.target.value})} />
          <Select 
            label="Verified" 
            value={companyForm.verified} 
            onChange={e => setCompanyForm({...companyForm, verified: e.target.value})}
            options={[
              { label: 'Yes', value: 'true' },
              { label: 'No', value: 'false' },
            ]}
          />
          <Select 
            label="Status" 
            value={companyForm.status} 
            onChange={e => setCompanyForm({...companyForm, status: e.target.value as 'Active' | 'Pending' | 'Suspended'})}
            options={[
              { label: 'Active', value: 'Active' },
              { label: 'Pending', value: 'Pending' },
              { label: 'Suspended', value: 'Suspended' },
            ]}
          />
        </div>
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Deletion"
        description={`Are you sure you want to delete "${itemToDelete?.name}"? This action cannot be undone.`}
        footer={
          <>
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={confirmDelete}>Delete</Button>
          </>
        }
      >
        <div className="py-2 text-sm text-slate-600">
          Deleting this record will completely remove it from the oversight list. Consider changing its status to Inactive/Suspended instead if you want to keep the historical record.
        </div>
      </Modal>

    </div>
  );
};

