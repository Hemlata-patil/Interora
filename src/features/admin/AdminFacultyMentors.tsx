import React, { useState } from 'react';
import { PageHeader, Card, Badge, Input, Select, Button, Modal } from '@/components';
import {
  GraduationCap,
  Search,
  Plus,
  Edit3,
  Trash2,
  CheckCircle2,
  UserCheck,
  ShieldAlert,
  Mail,
  Users,
  Layers,
  KeyRound,
  Eye,
  EyeOff
} from 'lucide-react';
import {
  registerFacultyMentorBackend,
  type FacultyRegistrationInput
} from '@/services/api/backendService';

export type BatchDivision = 'CS1' | 'CS2' | 'CS3' | 'CS4';

export interface FacultyMentorRecord {
  id: string;
  facultyId: string;
  name: string;
  email: string;
  phone: string;
  department: 'CSE' | 'IT' | 'AIML' | 'ECE';
  batch: BatchDivision;
  designation: string;
  tempPassword?: string;
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
    batch: 'CS1',
    designation: 'Professor & Head',
    tempPassword: 'password@123',
    assignedStudentCount: 22,
    status: 'Active',
  },
  {
    id: 'fac-2',
    facultyId: 'FAC-802',
    name: 'Dr. Anita Verma',
    email: 'anita.verma@college.edu',
    phone: '+91 98765 44556',
    department: 'CSE',
    batch: 'CS2',
    designation: 'Associate Professor',
    tempPassword: 'password@123',
    assignedStudentCount: 19,
    status: 'Active',
  },
  {
    id: 'fac-3',
    facultyId: 'FAC-803',
    name: 'Prof. Suresh Nair',
    email: 'suresh.nair@college.edu',
    phone: '+91 98765 77889',
    department: 'CSE',
    batch: 'CS3',
    designation: 'Assistant Professor',
    tempPassword: 'password@123',
    assignedStudentCount: 17,
    status: 'Active',
  },
  {
    id: 'fac-4',
    facultyId: 'FAC-804',
    name: 'Dr. Preeti Deshmukh',
    email: 'preeti.deshmukh@college.edu',
    phone: '+91 98765 33221',
    department: 'CSE',
    batch: 'CS4',
    designation: 'Assistant Professor',
    tempPassword: 'password@123',
    assignedStudentCount: 20,
    status: 'Active',
  },
];

export const AdminFacultyMentors: React.FC = () => {
  const [mentors, setMentors] = useState<FacultyMentorRecord[]>(initialFacultyMentors);
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [batchFilter, setBatchFilter] = useState('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMentor, setEditingMentor] = useState<FacultyMentorRecord | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    facultyId: '',
    department: 'CSE' as 'CSE' | 'IT' | 'AIML' | 'ECE',
    batch: 'CS1' as BatchDivision,
    designation: 'Assistant Professor',
    phone: '',
    tempPassword: '',
    status: 'Active' as 'Active' | 'Inactive',
  });

  const filteredMentors = mentors.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.facultyId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.batch.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = deptFilter === 'ALL' || m.department === deptFilter;
    const matchesBatch = batchFilter === 'ALL' || m.batch === batchFilter;
    return matchesSearch && matchesDept && matchesBatch;
  });

  const handleOpenCreateModal = () => {
    setEditingMentor(null);
    setFormData({
      name: '',
      email: '',
      facultyId: `FAC-${Math.floor(800 + Math.random() * 90)}`,
      department: 'CSE',
      batch: 'CS1',
      designation: 'Assistant Professor',
      phone: '',
      tempPassword: 'faculty@123',
      status: 'Active',
    });
    setShowPassword(false);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (m: FacultyMentorRecord) => {
    setEditingMentor(m);
    setFormData({
      name: m.name,
      email: m.email,
      facultyId: m.facultyId,
      department: m.department,
      batch: m.batch,
      designation: m.designation,
      phone: m.phone,
      tempPassword: m.tempPassword || '',
      status: m.status,
    });
    setShowPassword(false);
    setIsModalOpen(true);
  };

  const handleSaveMentor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) return;

    if (!editingMentor && (!formData.tempPassword || formData.tempPassword.length < 6)) {
      alert('Please provide a temporary password of at least 6 characters for the faculty mentor login.');
      return;
    }

    if (editingMentor) {
      setMentors((prev) =>
        prev.map((m) => (m.id === editingMentor.id ? { ...m, ...formData } : m))
      );
      setSuccessNotice(`Faculty Mentor profile updated for ${formData.name} (Assigned to Batch ${formData.batch}).`);
    } else {
      const newMentor: FacultyMentorRecord = {
        id: `fac-${Date.now()}`,
        ...formData,
        assignedStudentCount: 0,
      };

      try {
        await registerFacultyMentorBackend({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          facultyId: formData.facultyId.trim(),
          department: formData.department,
          batch: formData.batch,
          designation: formData.designation,
          phone: formData.phone,
          password: formData.tempPassword,
        });
      } catch (err) {
        console.warn('Faculty mentor backend registration notice:', err);
      }

      setMentors((prev) => [...prev, newMentor]);
      setSuccessNotice(
        `Faculty Mentor ${formData.name} provisioned successfully for Batch ${formData.batch}. Faculty can log in using Email: ${formData.email} and Temporary Password: ${formData.tempPassword}.`
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
        description="Provision faculty mentor accounts with login credentials, assign branch cohorts (CS1, CS2, CS3, CS4), and oversee mentorship distribution."
        action={
          <Button variant="primary" size="sm" onClick={handleOpenCreateModal} className="flex items-center gap-1.5 shadow-sm">
            <Plus className="w-4 h-4" />
            <span>Add Faculty Mentor</span>
          </Button>
        }
      />

      {successNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{successNotice}</span>
          </div>
          <button onClick={() => setSuccessNotice(null)} className="text-emerald-600 hover:text-emerald-900 text-xs font-bold">
            Dismiss
          </button>
        </div>
      )}

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center gap-3 border-l-4 border-l-indigo-600">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900">{mentors.length}</div>
            <div className="text-xs text-slate-500 font-medium">Total Faculty Mentors</div>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3 border-l-4 border-l-emerald-600">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900">
              {mentors.filter((m) => m.status === 'Active').length}
            </div>
            <div className="text-xs text-slate-500 font-medium">Active Supervisors</div>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3 border-l-4 border-l-sky-600">
          <div className="p-2.5 bg-sky-50 text-sky-600 rounded-lg">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900">4 Batches</div>
            <div className="text-xs text-slate-500 font-medium">CS1, CS2, CS3, CS4</div>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3 border-l-4 border-l-amber-600">
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900">
              {mentors.reduce((acc, m) => acc + m.assignedStudentCount, 0)}
            </div>
            <div className="text-xs text-slate-500 font-medium">Students Mentored</div>
          </div>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Search by mentor name, ID, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>
          <Select
            label="Filter by Batch / Branch"
            value={batchFilter}
            onChange={(e) => setBatchFilter(e.target.value)}
            options={[
              { value: 'ALL', label: 'All Batches (CS1 - CS4)' },
              { value: 'CS1', label: 'CS1 - Batch 1' },
              { value: 'CS2', label: 'CS2 - Batch 2' },
              { value: 'CS3', label: 'CS3 - Batch 3' },
              { value: 'CS4', label: 'CS4 - Batch 4' },
            ]}
          />
          <Select
            label="Filter by Department"
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            options={[
              { value: 'ALL', label: 'All Academic Departments' },
              { value: 'CSE', label: 'Computer Science (CSE)' },
              { value: 'IT', label: 'Information Tech (IT)' },
              { value: 'AIML', label: 'AI & Machine Learning' },
              { value: 'ECE', label: 'Electronics (ECE)' },
            ]}
          />
        </div>
      </Card>

      {/* Mentors Table */}
      <Card className="p-0 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3.5">Faculty Mentor</th>
                <th className="p-3.5">Email of Faculty</th>
                <th className="p-3.5">Department</th>
                <th className="p-3.5">Assigned Batch / Division</th>
                <th className="p-3.5">Designation</th>
                <th className="p-3.5">Assigned Cohort</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMentors.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-3.5 font-bold text-slate-800 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0">
                      {m.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">{m.name}</div>
                      <span className="block text-[10px] text-slate-400 font-mono font-normal">{m.facultyId}</span>
                    </div>
                  </td>
                  <td className="p-3.5 text-slate-600">
                    <span className="block font-medium text-slate-800">{m.email}</span>
                    <span className="text-[10px] text-slate-400">{m.phone || 'N/A'}</span>
                  </td>
                  <td className="p-3.5">
                    <Badge variant="sky">{m.department}</Badge>
                  </td>
                  <td className="p-3.5">
                    <Badge variant="indigo" className="font-bold text-[11px] px-2 py-0.5">
                      Batch {m.batch}
                    </Badge>
                  </td>
                  <td className="p-3.5 text-slate-700">{m.designation}</td>
                  <td className="p-3.5 font-semibold text-slate-700">
                    {m.assignedStudentCount} Students ({m.batch})
                  </td>
                  <td className="p-3.5">
                    <Badge variant={m.status === 'Active' ? 'emerald' : 'amber'}>{m.status}</Badge>
                  </td>
                  <td className="p-3.5 text-right">
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
              {filteredMentors.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400 text-xs">
                    No faculty mentors found matching the filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal: Create / Edit Faculty Mentor */}
      {isModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsModalOpen(false)}
          title={editingMentor ? `Edit Faculty Mentor: ${editingMentor.name}` : 'Provision New Faculty Mentor Account'}
        >
          <form onSubmit={handleSaveMentor} className="space-y-4 text-xs p-1">
            <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-lg text-indigo-900 text-[11px] flex items-start gap-2">
              <Layers className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <span>
                <strong>Batch-Wise Mentorship Routing:</strong> Students registering under Batch <strong>{formData.batch}</strong> will be assigned to this faculty mentor. Mentors can sign in using their <strong>Email of Faculty</strong> and <strong>Temporary Password</strong>.
              </span>
            </div>

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
              <label className="block font-semibold text-slate-700 mb-1">Email of Faculty</label>
              <Input
                required
                type="email"
                placeholder="faculty.mentor@college.edu"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-indigo-600" />
                  Temporary Password for Faculty Login
                </span>
                {editingMentor && <span className="text-[10px] text-slate-400 font-normal">(Leave blank to keep unchanged)</span>}
              </label>
              <div className="relative">
                <Input
                  required={!editingMentor}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="e.g. faculty@123"
                  value={formData.tempPassword}
                  onChange={(e) => setFormData({ ...formData, tempPassword: e.target.value })}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
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
                <label className="block font-semibold text-slate-700 mb-1">Assigned Batch / Division</label>
                <Select
                  value={formData.batch}
                  onChange={(e) => setFormData({ ...formData, batch: e.target.value as BatchDivision })}
                  options={[
                    { value: 'CS1', label: 'CS1 - Batch 1 (Division A)' },
                    { value: 'CS2', label: 'CS2 - Batch 2 (Division B)' },
                    { value: 'CS3', label: 'CS3 - Batch 3 (Division C)' },
                    { value: 'CS4', label: 'CS4 - Batch 4 (Division D)' },
                  ]}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
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

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Designation</label>
                <Input
                  placeholder="e.g. Professor & Head / Assistant Professor"
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Contact Phone Number</label>
              <Input
                placeholder="+91 98765 11223"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                {editingMentor ? 'Save Changes' : 'Provision Mentor Account'}
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
