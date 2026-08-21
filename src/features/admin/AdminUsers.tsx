import React, { useState } from 'react';
import { PageHeader, Card, Badge, Input, Select } from '@/components';
import { Users, Search, ShieldCheck } from 'lucide-react';
import { mockFacultyStudents, mockCompanyMentors } from '@/features/faculty/mockData';

export const AdminUsers: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  const studentUsers = mockFacultyStudents.map((s) => ({
    id: s.id,
    name: s.studentName,
    email: s.email,
    role: 'STUDENT',
    organization: `Dept: ${s.department}`,
    status: s.internshipStatus,
  }));

  const mentorUsers = mockCompanyMentors.map((m) => ({
    id: m.id,
    name: m.name,
    email: m.email,
    role: 'INDUSTRY_MENTOR',
    organization: `Dept: ${m.department} â€¢ ${m.designation}`,
    status: m.status,
  }));

  const facultyUsers = [
    {
      id: 'fac-1',
      name: 'Dr. Rajesh Sharma',
      email: 'rajesh.sharma@college.edu',
      role: 'FACULTY_MENTOR',
      organization: 'Dept: CSE â€¢ Professor',
      status: 'Active',
    },
    {
      id: 'fac-2',
      name: 'Dr. Anita Verma',
      email: 'anita.verma@college.edu',
      role: 'FACULTY_MENTOR',
      organization: 'Dept: IT â€¢ Assoc Professor',
      status: 'Active',
    },
  ];

  const allUsers = [...studentUsers, ...mentorUsers, ...facultyUsers];

  const filteredUsers = allUsers.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.organization.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
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
              ]}
            />
          </div>
        </div>

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
                    <Badge variant={u.role === 'STUDENT' ? 'indigo' : u.role === 'FACULTY_MENTOR' ? 'emerald' : 'sky'}>
                      {u.role.replace('_', ' ')}
                    </Badge>
                  </td>
                  <td className="p-3 text-slate-600">{u.organization}</td>
                  <td className="p-3">
                    <Badge variant={u.status === 'Active' || u.status === 'Completed' ? 'emerald' : 'amber'}>
                      {u.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};