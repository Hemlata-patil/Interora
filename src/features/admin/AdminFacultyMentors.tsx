import React, { useState } from 'react';
import { PageHeader, Card, Badge, Input, Select, Button, Modal } from '@/components';
import { GraduationCap, Search, Plus, Edit3, Trash2, CheckCircle2, UserCheck, ShieldAlert, Mail } from 'lucide-react';
import { mockFacultyStudents } from '@/features/faculty/mockData';

export interface FacultyMentorRecord {
  id: string;
  facultyId: string;
  name: string;
  email: string;
  phone: string;
  department: 'CSE' | 'IT' | 'AIML' | 'ECE';
  designation: string;
  assignedStudentCount: number;
  status: 'Active' | 'Inactive';
}

export const initialFacultyMentors: FacultyMentorRecord[] = [
  {
    id: 'fac-1',
    facultyId: 'FAC-801',
    name: 'Dr. Rajesh Sharma',
    email: 'rajesh.sharma@college.edu',
    phone: '+91 98765 11223',
    department: 'CSE',
    designation: 'Professor & Head',
    assignedStudentCount: 3,
    status: 'Active',
  },
  {
    id: 'fac-2',
    facultyId: 'FAC-802',
    name: 'Dr. Anita Verma',
    email: 'anita.verma@college.edu',
    phone: '+91 98765 44556',
    department: 'IT',
    designation: 'Associate Professor',
    assignedStudentCount: 2,
    status: 'Active',
  },
  {
    id: 'fac-3',
    facultyId: 'FAC-803',
    name: 'Prof. Suresh Nair',
    email: 'suresh.nair@college.edu',
    phone: '+91 98765 77889',
    department: 'AIML',
    designation: 'Assistant Professor',
    assignedStudentCount: 1,
    status: 'Active',
  },
];

export const AdminFacultyMentors: React.FC = () => {
  const [mentors, setMentors] = useState<FacultyMentorRecord[]>(initialFacultyMentors);
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMentor, setEditingMentor] = useState<FacultyMentorRecord | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    facultyId: '',
    department: 'CSE' as 'CSE' | 'IT' | 'AIML' | 'ECE',
    designation: 'Assistant Professor',
    phone: '',
    status: 'Active' as 'Active' | 'Inactive',
  });

  const filteredMentors = mentors.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.facultyId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = deptFilter === 'ALL' || m.department === deptFilter;
    return matchesSearch && matchesDept;
  });

  const handleOpenCreateModal = () => {
    setEditingMentor(null);
    setFormData({
      name: '',
      email: '',
      facultyId: `FAC-${Math.floor(800 + Math.random() * 90)}`,
      department: 'CSE',
      designation: 'Assistant Professor',
      phone: '',
      status: 'Active',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (m: FacultyMentorRecord) => {
    setEditingMentor(m);
    setFormData({
      name: m.name,
      email: m.email,
      facultyId: m.facultyId,
      department: m.department,
      designation: m.designation,
      phone: m.phone,
      status: m.status,
    });
    setIsModalOpen(true);
  };

  const handleSaveMentor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    if (editingMentor) {
      setMentors((prev) =>
        prev.map((m) => (m.id === editingMentor.id ? { ...m, ...formData } : m))
      );
      setSuccessNotice(`Faculty Mentor profile updated for ${formData.name}.`);
    } else {
      const newMentor: FacultyMentorRecord = {
        id: `fac-${Date.now()}`,
        ...formData,
        assignedStudentCount: 0,
      };
      setMentors((prev) => [...prev, newMentor]);
      setSuccessNotice(
        `Faculty Mentor account provisioned for ${formData.name}. Account login instructions have been generated for ${formData.email}.`
      );
    }
    setIsModalOpen(false);
  };

  const handleToggleStatus = (id: string) => {
    setMentors((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, status: m.status === 'Active' ? 'Inactive' : 'Active' } : m
      )
    );
  };

  const handleDeleteMentor = (id: string) => {
    setMentors((prev) => prev.filter((m) => m.id !== id));
    setDeleteConfirmId(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Faculty Mentor Management"
        description="Provision faculty advisor accounts, assign academic departments, and oversee assigned student internship cohorts."
      />

      {successNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex justify-between items-center">
          <span className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> {successNotice}
          </span>
          <Button variant="ghost" size="sm" onClick={() => setSuccessNotice(null)} className="text-xs">
            Dismiss
          </Button>
        </div>
      )}

      <Card className="p-6 bg-white border border-slate-200">
        <div className="flex flex-col md:flex-row gap-4 justify-between mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <Input
              placeholder="Search by faculty name, email, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-3">
            <div className="w-40">
              <Select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                options={[
                  { value: 'ALL', label: 'All Departments' },
                  { value: 'CSE', label: 'CSE' },
                  { value: 'IT', label: 'IT' },
                  { value: 'AIML', label: 'AIML' },
                  { value: 'ECE', label: 'ECE' },
                ]}
              />
            </div>
            <Button variant="primary" size="sm" onClick={handleOpenCreateModal} className="flex items-center gap-1.5 text-xs shrink-0">
              <Plus className="w-4 h-4" /> Create Faculty Mentor
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 bg-slate-50">
                <th className="p-3 font-semibold">Faculty ID & Name</th>
                <th className="p-3 font-semibold">Email & Phone</th>
                <th className="p-3 font-semibold">Department</th>
                <th className="p-3 font-semibold">Designation</th>
                <th className="p-3 font-semibold">Assigned Cohort</th>
                <th className="p-3 font-semibold">Status</th>
                <th className="p-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMentors.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/50">
                  <td className="p-3 font-bold text-slate-800 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-indigo-600 shrink-0" />
                    <div>
                      <span>{m.name}</span>
                      <span className="block text-[10px] text-slate-400 font-mono font-normal">{m.facultyId}</span>
                    </div>
                  </td>
                  <td className="p-3 text-slate-600">
                    <span className="block font-medium">{m.email}</span>
                    <span className="text-[10px] text-slate-400">{m.phone || 'N/A'}</span>
                  </td>
                  <td className="p-3">
                    <Badge variant="sky">{m.department}</Badge>
                  </td>
                  <td className="p-3 text-slate-700">{m.designation}</td>
                  <td className="p-3 font-semibold text-slate-700">{m.assignedStudentCount} Students</td>
                  <td className="p-3">
                    <Badge variant={m.status === 'Active' ? 'emerald' : 'amber'}>{m.status}</Badge>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-slate-600 hover:bg-slate-100 text-[11px] p-1.5"
                        onClick={() => handleOpenEditModal(m)}
                      >
                        <Edit3 className="w-3.5 h-3.5 mr-1" /> Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-indigo-600 hover:bg-indigo-50 text-[11px] p-1.5"
                        onClick={() => handleToggleStatus(m.id)}
                      >
                        {m.status === 'Active' ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-1.5"
                        onClick={() => setDeleteConfirmId(m.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal: Create / Edit Faculty Mentor */}
      {isModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsModalOpen(false)}
          title={editingMentor ? `Edit Faculty Mentor — ${editingMentor.name}` : 'Provision New Faculty Mentor Account'}
        >
          <form onSubmit={handleSaveMentor} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
              <Input
                required
                placeholder="e.g. Dr. Rajesh Sharma"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Official Institutional Email</label>
              <Input
                required
                type="email"
                placeholder="rajesh.sharma@college.edu"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Faculty / Employee ID</label>
                <Input
                  required
                  value={formData.facultyId}
                  onChange={(e) => setFormData({ ...formData, facultyId: e.target.value })}
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Academic Department</label>
                <Select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value as any })}
                  options={[
                    { value: 'CSE', label: 'Computer Science (CSE)' },
                    { value: 'IT', label: 'Information Tech (IT)' },
                    { value: 'AIML', label: 'AI & Machine Learning' },
                    { value: 'ECE', label: 'Electronics (ECE)' },
                  ]}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Designation</label>
                <Input
                  placeholder="e.g. Professor & Head"
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                <Input
                  placeholder="+91 98765 11223"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-lg text-indigo-900 text-[11px]">
              <p className="font-semibold flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-indigo-600" /> Account Credential Generation Policy
              </p>
              <p className="mt-1 text-slate-600">
                Institutional login onboarding instructions will be dispatched to <strong>{formData.email || 'the specified address'}</strong>. Passwords are set privately by the faculty member upon first authentication.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                {editingMentor ? 'Save Changes' : 'Provision Account'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: Delete Confirmation */}
      {deleteConfirmId && (
        <Modal
          isOpen={true}
          onClose={() => setDeleteConfirmId(null)}
          title="Confirm Faculty Mentor Account Deletion"
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-600">
              Are you sure you want to remove this Faculty Mentor account? This will revoke their administrative access to student internship evaluation workflows.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setDeleteConfirmId(null)}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" onClick={() => handleDeleteMentor(deleteConfirmId)}>
                Confirm Delete
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
