import React, { useEffect, useState } from 'react';
import { apiClient } from '@/services/api/apiClient';

export const HodInternships: React.FC = () => {
  const [internships, setInternships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const response = await apiClient.get('/hod/internships');
      setInternships((response.data as any[]) || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch internships.');
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
      <h1 className="text-2xl font-bold text-slate-900">Internships</h1>
      
      {internships.length === 0 ? (
        <div className="text-slate-500">No active internships found for students in your department.</div>
      ) : (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-4">Student</th>
                <th className="p-4">Company</th>
                <th className="p-4">Assigned Faculty</th>
                <th className="p-4">Start Date</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {internships.map((internship: any) => {
                const startDate = new Date(internship.startDate).toLocaleDateString();
                return (
                  <tr key={internship.id} className="border-b border-slate-100">
                    <td className="p-4">
                      <div className="font-medium text-slate-900">{internship.student.profile.fullName}</div>
                      <div className="text-xs text-slate-500">{internship.student.profile.email}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium">{internship.company.companyName}</div>
                      <div className="text-xs text-slate-500">{internship.company.industryDomain}</div>
                    </td>
                    <td className="p-4 text-slate-700 font-medium">
                      {internship.facultyMentor.profile.fullName}
                    </td>
                    <td className="p-4 text-slate-600">
                      {startDate}
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 rounded text-xs font-semibold bg-indigo-50 text-indigo-700 capitalize">
                        {internship.status}
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
