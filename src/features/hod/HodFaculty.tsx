import React, { useEffect, useState } from 'react';
import { apiClient } from '@/services/api/apiClient';

export const HodFaculty: React.FC = () => {
  const [faculty, setFaculty] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', designation: '', phone: '' });
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const fetchFaculty = async () => {
    try {
      const response = await apiClient.get('/hod/faculty');
      setFaculty((response.data as any[]) || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch faculty.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaculty();
  }, []);

  const handleCreateFaculty = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormLoading(true);
    try {
      await apiClient.post('/hod/faculty', formData);
      setShowForm(false);
      setFormData({ name: '', email: '', designation: '', phone: '' });
      await fetchFaculty();
    } catch (err: any) {
      setFormError(err.message || 'Failed to create faculty member.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleStatusToggle = async (facultyId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      await apiClient.patch(`/hod/faculty/${facultyId}/status`, { status: newStatus });
      await fetchFaculty();
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-rose-600">{error}</div>;

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Department Faculty</h1>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700"
        >
          {showForm ? 'Cancel' : 'Add Faculty Member'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs mb-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Add New Faculty Member</h2>
          {formError && <div className="text-rose-600 mb-4 text-sm">{formError}</div>}
          <form onSubmit={handleCreateFaculty} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input 
                  type="text" 
                  required 
                  className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                <input 
                  type="email" 
                  required 
                  className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Designation</label>
                <input 
                  type="text" 
                  className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                  placeholder="e.g. Professor"
                  value={formData.designation}
                  onChange={(e) => setFormData({...formData, designation: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number (Optional)</label>
                <input 
                  type="tel" 
                  className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
            </div>
            <button 
              type="submit" 
              disabled={formLoading}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50"
            >
              {formLoading ? 'Creating...' : 'Create Account'}
            </button>
          </form>
        </div>
      )}
      
      {faculty.length === 0 ? (
        <div className="text-slate-500">No faculty members found in your department.</div>
      ) : (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Designation</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {faculty.map((f: any) => (
                <tr key={f.id} className="border-b border-slate-100">
                  <td className="p-4">{f.profile.fullName}</td>
                  <td className="p-4">{f.profile.email}</td>
                  <td className="p-4">{f.designation}</td>
                  <td className="p-4 capitalize">{f.profile.accountStatus}</td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleStatusToggle(f.id, f.profile.accountStatus)}
                      className={`px-3 py-1 rounded text-xs font-semibold ${
                        f.profile.accountStatus === 'active'
                          ? 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                          : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                      }`}
                    >
                      {f.profile.accountStatus === 'active' ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
