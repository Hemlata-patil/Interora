import React, { useEffect, useState } from 'react';
import { apiClient } from '@/services/api/apiClient';

export const HodStudents: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const response = await apiClient.get('/hod/students');
      setStudents((response.data as any[]) || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch students.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-rose-600">{error}</div>;

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Department Students & Interns</h1>
      
      {students.length === 0 ? (
        <div className="text-slate-500">No students found in your department.</div>
      ) : (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Course/Batch</th>
                <th className="p-4">Assigned Faculty</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s: any) => {
                const assignedMapping = s.facultyMappings?.[0];
                const assignedName = assignedMapping?.faculty?.profile?.fullName || 'Unassigned';
                const status = assignedName === 'Unassigned' ? 'Unassigned' : 'Assigned';

                return (
                  <tr key={s.id} className="border-b border-slate-100">
                    <td className="p-4">{s.profile.fullName}</td>
                    <td className="p-4">{s.profile.email}</td>
                    <td className="p-4">{s.course} ({s.batchYear})</td>
                    <td className="p-4 font-medium text-slate-700">
                      {assignedName}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        status === 'Assigned' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'
                      }`}>
                        {status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
