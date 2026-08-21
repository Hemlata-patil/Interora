import React, { useState, useEffect } from 'react';
import { PageHeader, Card, Button, Badge } from '@/components';
import { Search, UserCheck, Mail, ArrowRight } from 'lucide-react';
import { fetchFacultyAssignedStudentsBackend, type FacultyAssignedStudentRecord } from '@/services/api/backendService';

export const AssignedStudents: React.FC = () => {
  const [students, setStudents] = useState<FacultyAssignedStudentRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadStudents = async () => {
      setLoading(true);
      const remote = await fetchFacultyAssignedStudentsBackend();
      setStudents(remote);
      setLoading(false);
    };

    loadStudents();
  }, []);

  const filtered = students.filter(
    (s) =>
      s.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.internshipTitle?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-8">
      <PageHeader
        title="Assigned Students"
        description="Monitor and guide students assigned to your faculty mentorship cohort."
      />

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search assigned students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.length > 0 ? (
          filtered.map((s) => (
            <Card key={s.assignmentId} className="hover:border-slate-300 transition-all space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-indigo-100 text-indigo-700 font-bold rounded-full flex items-center justify-center text-sm">
                    {s.studentName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{s.studentName}</h3>
                    <p className="text-xs text-slate-500">{s.studentEmail}</p>
                  </div>
                </div>
                <Badge variant={s.applicationStatus === 'Selected' ? 'emerald' : 'amber'}>
                  {s.applicationStatus}
                </Badge>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-xs space-y-1">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">ENROLLED INTERNSHIP</span>
                <span className="font-bold text-indigo-700 truncate block">{s.internshipTitle}</span>
                <span className="text-slate-500 text-[11px] truncate block">{s.companyName}</span>
              </div>
            </Card>
          ))
        ) : (
          <div className="col-span-2 text-center py-12 bg-white border border-slate-200 rounded-xl">
            <UserCheck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-500 italic">
              {loading ? 'Loading assigned students...' : 'No assigned students found matching search.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
