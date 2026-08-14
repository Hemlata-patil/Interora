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
  Alert 
} from '@/components';
import type { Column } from '@/components';
import { Search, UserCog, ShieldAlert } from 'lucide-react';
import type { UserProfile, UserRole } from '@/types';
import { fetchAdminUsers } from './mockData';

export const AdminUserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');

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
    </div>
  );
};
