import React, { useEffect, useState } from 'react';
import { apiClient } from '@/services/api/apiClient';

export const HodAssignments: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [faculty, setFaculty] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [assigningStudent, setAssigningStudent] = useState<string | null>(null);
  const [selectedFaculty, setSelectedFaculty] = useState<string>('');

  const fetchData = async () => {
    try {
      const [studentsRes, facultyRes] = await Promise.all([
        apiClient.get('/hod/students'),
        apiClient.get('/hod/faculty')
      ]);
      setStudents((studentsRes.data as any[]) || []);
      setFaculty((facultyRes.data as any[]) || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAssign = async (studentId: string) => {
    if (!selectedFaculty) return;
    try {
      await apiClient.post('/hod/faculty-assignment', {
        studentId,
        facultyId: selectedFaculty
      });
      setAssigningStudent(null);
      setSelectedFaculty('');
      fetchData(); // Refresh list
    } catch (err: any) {
      alert(err.message || 'Failed to assign faculty.');
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-rose-600">{error}</div>;

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Faculty Assignments</h1>
      
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
                <th className="p-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s: any) => {
                const isAssigning = assigningStudent === s.id;
                const assignedMapping = s.facultyMappings?.[0];
                const assignedName = assignedMapping?.faculty?.profile?.fullName || 'Unassigned';

                return (
                  <tr key={s.id} className="border-b border-slate-100">
                    <td className="p-4">{s.profile.fullName}</td>
                    <td className="p-4">{s.profile.email}</td>
                    <td className="p-4">{s.course} ({s.batchYear})</td>
                    <td className="p-4 font-medium text-slate-700">
                      {assignedName}
                    </td>
                    <td className="p-4">
                      {isAssigning ? (
                        <div className="flex items-center space-x-2">
                          <select 
                            className="text-sm border border-slate-300 rounded p-1"
                            value={selectedFaculty}
                            onChange={(e) => setSelectedFaculty(e.target.value)}
                          >
                            <option value="">Select Faculty...</option>
                            {faculty.filter(f => f.profile.accountStatus === 'active').map(f => (
                              <option key={f.id} value={f.id}>{f.profile.fullName}</option>
                            ))}
                          </select>
                          <button 
                            onClick={() => handleAssign(s.id)}
                            className="bg-indigo-600 text-white px-2 py-1 rounded text-xs font-semibold hover:bg-indigo-700"
                          >
                            Save
                          </button>
                          <button 
                            onClick={() => { setAssigningStudent(null); setSelectedFaculty(''); }}
                            className="text-slate-500 hover:text-slate-700 text-xs underline"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => setAssigningStudent(s.id)}
                          className="text-indigo-600 hover:text-indigo-800 text-sm font-semibold"
                        >
                          {assignedName === 'Unassigned' ? 'Assign' : 'Change'}
                        </button>
                      )}
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
