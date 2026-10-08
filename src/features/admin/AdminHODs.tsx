import React, { useState, useEffect } from 'react';
import { PageHeader, Card, Badge, Input } from '@/components';
import { Loader2, GraduationCap, Pencil } from 'lucide-react';
import { fetchAdminUsersBackend, fetchDepartmentsBackend, type AdminUserRecord, type DepartmentRecord } from '@/services/api/backendService';
import { apiClient } from '@/services/api/apiClient';

export const AdminHODs: React.FC = () => {
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [departments, setDepartments] = useState<DepartmentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [hodForm, setHodForm] = useState({ name: '', email: '', departmentId: '' });

  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', departmentId: '', status: 'active' });

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [usersData, depts] = await Promise.all([
        fetchAdminUsersBackend(),
        fetchDepartmentsBackend()
      ]);
      setUsers(usersData.filter(u => u.role === 'hod' || u.role === 'HOD'));
      setDepartments(depts);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch HODs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateHod = async () => {
    try {
      if (!hodForm.name || !hodForm.email || !hodForm.departmentId) {
        alert('Please fill all fields');
        return;
      }
      await apiClient.post('/admin/hod', hodForm);
      alert('HOD created successfully');
      setShowForm(false);
      setHodForm({ name: '', email: '', departmentId: '' });
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || err.message || 'Failed to create HOD');
    }
  };

  const handleEdit = (u: AdminUserRecord) => {
    setEditingUserId(u.id);
    setEditForm({
      name: u.name,
      email: u.email,
      departmentId: u.departmentId || '',
      status: u.status.toLowerCase()
    });
  };

  const handleUpdateHod = async () => {
    try {
      if (!editForm.name || !editForm.email) {
        alert('Please fill name and email');
        return;
      }
      await apiClient.patch(`/admin/hod/${editingUserId}`, editForm);
      alert('HOD updated successfully');
      setEditingUserId(null);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || err.message || 'Failed to update HOD');
    }
  };

  const handleToggleStatus = async (u: AdminUserRecord) => {
    try {
      const newStatus = u.status === 'Active' ? 'inactive' : 'active';
      await apiClient.patch(`/admin/hod/${u.id}`, { status: newStatus });
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || err.message || 'Failed to update status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <PageHeader
          title="HOD Management"
          description="Create and manage Heads of Departments across the system."
        />
        <button 
          onClick={() => setShowForm(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700"
        >
          + Add HOD
        </button>
      </div>

      {showForm && (
        <Card className="p-6 bg-slate-50 border border-slate-200 mb-6">
          <h3 className="text-lg font-bold mb-4">Create New HOD Account</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input placeholder="Full Name" value={hodForm.name} onChange={(e) => setHodForm({...hodForm, name: e.target.value})} />
            <Input placeholder="Email Address" type="email" value={hodForm.email} onChange={(e) => setHodForm({...hodForm, email: e.target.value})} />
            <div className="md:col-span-2">
              <select 
                className="w-full border border-slate-200 rounded p-2 text-sm"
                value={hodForm.departmentId} 
                onChange={(e) => setHodForm({...hodForm, departmentId: e.target.value})}
              >
                <option value="">Select Department...</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4 flex space-x-3">
            <button 
              onClick={handleCreateHod}
              className="bg-indigo-600 text-white px-4 py-2 rounded text-sm font-semibold hover:bg-indigo-700"
            >
              Create Account
            </button>
            <button 
              onClick={() => setShowForm(false)}
              className="text-slate-500 text-sm font-semibold underline hover:text-slate-700"
            >
              Cancel
            </button>
          </div>
        </Card>
      )}

      {editingUserId && (
        <Card className="p-6 bg-slate-50 border border-slate-200 mb-6">
          <h3 className="text-lg font-bold mb-4">Edit HOD Account</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input placeholder="Full Name" value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} />
            <Input placeholder="Email Address" type="email" value={editForm.email} onChange={(e) => setEditForm({...editForm, email: e.target.value})} />
            <div className="md:col-span-2">
              <select 
                className="w-full border border-slate-200 rounded p-2 text-sm"
                value={editForm.departmentId} 
                onChange={(e) => setEditForm({...editForm, departmentId: e.target.value})}
              >
                <option value="">Not Assigned</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2 flex items-center">
              <label className="mr-2 text-sm font-semibold">Status:</label>
              <select
                className="border border-slate-200 rounded p-2 text-sm"
                value={editForm.status}
                onChange={(e) => setEditForm({...editForm, status: e.target.value})}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div className="mt-4 flex space-x-3">
            <button 
              onClick={handleUpdateHod}
              className="bg-indigo-600 text-white px-4 py-2 rounded text-sm font-semibold hover:bg-indigo-700"
            >
              Save Changes
            </button>
            <button 
              onClick={() => setEditingUserId(null)}
              className="text-slate-500 text-sm font-semibold underline hover:text-slate-700"
            >
              Cancel
            </button>
          </div>
        </Card>
      )}

      <Card className="p-6 bg-white border border-slate-200">
        {loading ? (
          <div className="flex items-center justify-center p-12 text-slate-400 text-sm">
            <Loader2 className="w-5 h-5 mr-2 animate-spin text-indigo-600" />
            Loading HOD directory...
          </div>
        ) : error ? (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-sm">
            {error}
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">
            No HODs found. Create one above.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 bg-slate-50">
                  <th className="p-3 font-semibold">User Name</th>
                  <th className="p-3 font-semibold">Email Address</th>
                  <th className="p-3 font-semibold">Department</th>
                  <th className="p-3 font-semibold">Status</th>
                  <th className="p-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50">
                    <td className="p-3 font-bold text-slate-800 flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span>{u.name}</span>
                    </td>
                    <td className="p-3 text-slate-600">{u.email}</td>
                    <td className="p-3 text-slate-600">{u.organization}</td>
                    <td className="p-3">
                      <Badge variant={u.status === 'Active' ? 'emerald' : 'amber'}>
                        {u.status}
                      </Badge>
                    </td>
                    <td className="p-3 flex space-x-2">
                      <button
                        onClick={() => handleEdit(u)}
                        className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded hover:bg-slate-50 hover:text-indigo-600 transition-colors shadow-sm"
                      >
                        <Pencil className="w-3.5 h-3.5 mr-1.5" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleToggleStatus(u)}
                        className={`inline-flex items-center px-2.5 py-1.5 text-xs font-medium border rounded transition-colors shadow-sm ${
                          u.status === 'Active'
                            ? 'text-rose-600 bg-white border-rose-200 hover:bg-rose-50'
                            : 'text-emerald-600 bg-white border-emerald-200 hover:bg-emerald-50'
                        }`}
                      >
                        {u.status === 'Active' ? 'Deactivate' : 'Activate'}
                      </button>
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
