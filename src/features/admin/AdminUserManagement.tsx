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
  Button,
  Modal
} from '@/components';
import type { Column } from '@/components';
import { Search, UserCog, ShieldAlert, Edit2, Trash2, Plus } from 'lucide-react';
import type { UserProfile, UserRole } from '@/types';
import { fetchAdminUsers } from './mockData';

export const AdminUserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    role: 'student' as UserRole,
    department: '',
    organization: ''
  });

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        const data = await fetchAdminUsers();
        setUsers(data);
      } catch (err) {
        setError('Failed to fetch user list.');
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch = 
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, roleFilter]);

  const handleOpenAddModal = () => {
    setEditingUser(null);
    setFormData({ fullName: '', email: '', role: 'student', department: '', organization: '' });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user: UserProfile) => {
    setEditingUser(user);
    setFormData({
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      department: user.department || '',
      organization: user.organization || ''
    });
    setIsModalOpen(true);
  };

  const handleSaveUser = () => {
    if (editingUser) {
      setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...formData } : u));
    } else {
      const newUser: UserProfile = {
        id: `mock-id-${Date.now()}`,
        ...formData
      };
      setUsers([...users, newUser]);
    }
    setIsModalOpen(false);
  };

  const handleDeleteClick = (user: UserProfile) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (userToDelete) {
      setUsers(users.filter(u => u.id !== userToDelete.id));
    }
    setIsDeleteModalOpen(false);
    setUserToDelete(null);
  };

  const columns: Column<UserProfile>[] = [
    {
      header: 'Name',
      cell: (user) => (
        <div>
          <div className="font-medium text-slate-900">{user.fullName}</div>
          <div className="text-xs text-slate-500">{user.email}</div>
        </div>
      ),
    },
    {
      header: 'Role',
      cell: (user) => {
        let variant: 'emerald' | 'amber' | 'indigo' | 'rose' | 'neutral' = 'neutral';
        switch (user.role) {
          case 'admin': variant = 'rose'; break;
          case 'faculty': variant = 'indigo'; break;
          case 'company': variant = 'amber'; break;
          case 'student': variant = 'emerald'; break;
        }
        return (
          <Badge variant={variant} className="capitalize">
            {user.role}
          </Badge>
        );
      },
    },
    {
      header: 'Department / Organization',
      cell: (user) => (
        <span className="text-slate-600">
          {user.department || user.organization || '-'}
        </span>
      ),
    },
    {
      header: 'Status',
      cell: () => (
        <Badge variant="emerald">Active</Badge>
      ),
    },
    {
      header: 'Actions',
      cell: (user) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => handleOpenEditModal(user)}>
            <Edit2 className="w-4 h-4 text-slate-500" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleDeleteClick(user)}>
            <Trash2 className="w-4 h-4 text-rose-500" />
          </Button>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader 
          title="User Management" 
          description="Manage students, faculty, companies, and system administrators." 
        />
        <Card className="min-h-[400px] flex items-center justify-center">
          <LoadingState message="Loading users..." />
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader 
          title="User Management" 
          description="Manage students, faculty, companies, and system administrators." 
        />
        <Alert type="error" title="Error Loading Users">{error}</Alert>
        <Card className="min-h-[400px] flex items-center justify-center">
          <EmptyState 
            title="Failed to Load" 
            description="Could not load the user list from the server." 
            icon={<ShieldAlert className="w-6 h-6" />}
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="User Management" 
        description="Manage students, faculty, companies, and system administrators." 
      />

      <Card>
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <div className="w-full sm:w-72">
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-48">
              <Select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as UserRole | 'all')}
                options={[
                  { label: 'All Roles', value: 'all' },
                  { label: 'Student', value: 'student' },
                  { label: 'Faculty', value: 'faculty' },
                  { label: 'Company', value: 'company' },
                  { label: 'Admin', value: 'admin' },
                ]}
              />
            </div>
          </div>
          <Button onClick={handleOpenAddModal}>
            <Plus className="w-4 h-4 mr-2" /> Add User
          </Button>
        </div>

        <div className="w-full overflow-hidden">
          {filteredUsers.length > 0 ? (
            <Table
              columns={columns}
              data={filteredUsers}
              keyExtractor={(user) => user.id}
              className="border-0 shadow-none rounded-none"
            />
          ) : (
            <EmptyState
              title="No Users Found"
              description="No users match your search and filter criteria."
              icon={<UserCog className="w-6 h-6" />}
              className="border-0 shadow-none my-8"
            />
          )}
        </div>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? 'Edit User' : 'Add New User'}
        description="Enter the user details below."
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveUser}>{editingUser ? 'Save Changes' : 'Create User'}</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Full Name" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} />
          <Input label="Email" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          <Select 
            label="Role" 
            value={formData.role} 
            onChange={e => setFormData({...formData, role: e.target.value as UserRole})}
            options={[
              { label: 'Student', value: 'student' },
              { label: 'Faculty', value: 'faculty' },
              { label: 'Company', value: 'company' },
              { label: 'Admin', value: 'admin' },
            ]}
          />
          <Input label="Department" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} />
          <Input label="Organization" value={formData.organization} onChange={e => setFormData({...formData, organization: e.target.value})} />
        </div>
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Deletion"
        description={`Are you sure you want to delete ${userToDelete?.fullName}? This action cannot be undone.`}
        footer={
          <>
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={confirmDelete}>Delete User</Button>
          </>
        }
      >
        <div className="py-2 text-sm text-slate-600">
          Deleting this user will remove their access to the Interora platform.
        </div>
      </Modal>
    </div>
  );
};
