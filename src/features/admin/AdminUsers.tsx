import React, { useState, useEffect } from 'react';
import { PageHeader, Card, Badge, Input, Select } from '@/components';
import { Search, ShieldCheck, Loader2 } from 'lucide-react';
import { fetchAdminUsersBackend, fetchDepartmentsBackend, type AdminUserRecord, type DepartmentRecord } from '@/services/api/backendService';
import { apiClient } from '@/services/api/apiClient';

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  const [departments, setDepartments] = useState<DepartmentRecord[]>([]);
  useEffect(() => {
    let isMounted = true;
    const loadUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        const [data, depts] = await Promise.all([
          fetchAdminUsersBackend(),
          fetchDepartmentsBackend()
        ]);
        if (isMounted) {
          setUsers(data);
          setDepartments(depts);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err?.message || 'Failed to fetch users');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadUsers();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.organization || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole =
      roleFilter === 'ALL' ||
      u.role === roleFilter ||
      (roleFilter === 'FACULTY_MENTOR' && (u.role === 'FACULTY' || u.role === 'FACULTY_MENTOR')) ||
      (roleFilter === 'INDUSTRY_MENTOR' && (u.role === 'MENTOR' || u.role === 'INDUSTRY_MENTOR'));
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Account Management"
        description="System-wide repository of registered Students, Faculty Advisors, and Industry Mentors."
      />

      <Card className="p-6 bg-white border border-slate-200">
        <div className="flex flex-col md:flex-row gap-4 justify-between mb-6">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <Input
              placeholder="Search by name, email, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="w-full md:w-56">
            <Select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              options={[
                { value: 'ALL', label: 'All User Roles' },
                { value: 'STUDENT', label: 'Students' },
                { value: 'FACULTY_MENTOR', label: 'Faculty Advisors' },
                { value: 'INDUSTRY_MENTOR', label: 'Industry Mentors' },
                { value: 'COMPANY', label: 'Company Users' },
                { value: 'HOD', label: 'Head of Department' },
                { value: 'ADMIN', label: 'Administrators' },
              ]}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-12 text-slate-400 text-sm">
            <Loader2 className="w-5 h-5 mr-2 animate-spin text-indigo-600" />
            Loading user directory...
          </div>
        ) : error ? (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-sm">
            {error}
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">
            No users found matching your search.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 bg-slate-50">
                  <th className="p-3 font-semibold">User Name</th>
                  <th className="p-3 font-semibold">Email Address</th>
                  <th className="p-3 font-semibold">Role</th>
                  <th className="p-3 font-semibold">Organization / Dept</th>
                  <th className="p-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50">
                    <td className="p-3 font-bold text-slate-800 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span>{u.name}</span>
                    </td>
                    <td className="p-3 text-slate-600">{u.email}</td>
                    <td className="p-3">
                      <Badge
                        variant={
                          u.role === 'STUDENT'
                            ? 'indigo'
                            : u.role === 'FACULTY' || u.role === 'FACULTY_MENTOR'
                            ? 'emerald'
                            : u.role === 'ADMIN'
                            ? 'amber'
                            : 'sky'
                        }
                      >
                        {u.role.replace(/_/g, ' ')}
                      </Badge>
                    </td>
                    <td className="p-3 text-slate-600">{u.organization}</td>
                    <td className="p-3">
                      <Badge
                        variant={
                          u.status === 'Active' || u.status === 'Completed'
                            ? 'emerald'
                            : 'amber'
                        }
                      >
                        {u.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};