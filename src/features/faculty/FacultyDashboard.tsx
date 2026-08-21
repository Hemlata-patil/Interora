import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, CheckCircle2, Award, Clock, ArrowUpRight, 
  ArrowRight, ShieldCheck, UserCheck, Star, 
  AlertTriangle, BarChart3, HelpCircle
} from 'lucide-react';
import { supabase } from '@/services/supabase/supabaseClient';
import { fetchFacultyAssignedStudentsBackend, type FacultyAssignedStudentRecord } from '@/services/api/backendService';

export const FacultyDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [assignedStudents, setAssignedStudents] = useState<FacultyAssignedStudentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadFacultyDashboard = async () => {
    const remoteStudents = await fetchFacultyAssignedStudentsBackend();
    setAssignedStudents(remoteStudents);
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await loadFacultyDashboard();
      setLoading(false);
    };

    init();

    // Subscribe to Realtime postgres_changes on faculty_student_assignments & student_applications
    const channel = supabase
      .channel('faculty_dashboard_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'faculty_student_assignments' },
        () => loadFacultyDashboard()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'student_applications' },
        () => loadFacultyDashboard()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const totalAssigned = assignedStudents.length;
  const activeInterns = assignedStudents.filter((s) => s.applicationStatus === 'Selected').length;
  const pendingApprovals = assignedStudents.filter((s) => s.applicationStatus === 'Submitted' || s.applicationStatus === 'Shortlisted').length;
  const placementRate = totalAssigned > 0 ? Math.round((activeInterns / totalAssigned) * 100) : 100;

  const evalsPending = 1;
  const evalsInProgress = 2;
  const evalsCompleted = activeInterns;
  const totalEvals = evalsPending + evalsInProgress + evalsCompleted;

  const placementRates = [
    { dept: 'CS', rate: 88 },
    { dept: 'IT', rate: 92 },
    { dept: 'AI/DS', rate: 76 },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Faculty Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Academic overview & internship monitoring for assigned students.</p>
        </div>
      </div>

      {/* SECTION 1 - METRIC CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1 */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">{totalAssigned}</h2>
            <p className="text-xs font-semibold text-slate-500 mt-1">Total Assigned Students</p>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">{activeInterns}</h2>
            <p className="text-xs font-semibold text-slate-500 mt-1">Active Internships</p>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">{pendingApprovals}</h2>
            <p className="text-xs font-semibold text-slate-500 mt-1">Pending Application Reviews</p>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">{placementRate}%</h2>
            <p className="text-xs font-semibold text-slate-500 mt-1">Placement Compliance Rate</p>
          </div>
        </div>
      </div>

      {/* SECTION 2 - ASSIGNED STUDENTS SUMMARY TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Assigned Student Pipeline</h3>
            <p className="text-xs text-slate-500">Live student status synced with Supabase database</p>
          </div>
          <button
            onClick={() => navigate('/faculty/assigned-students')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            View All <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {assignedStudents.length > 0 ? (
          <div className="divide-y divide-slate-100 text-xs">
            {assignedStudents.slice(0, 5).map((student) => (
              <div key={student.assignmentId} className="py-3 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900">{student.studentName}</h4>
                  <p className="text-slate-500 text-[11px]">{student.studentEmail}</p>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-indigo-600 block">{student.internshipTitle}</span>
                  <span className="text-[10px] text-slate-400">{student.companyName} • Status: {student.applicationStatus}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic text-center py-6">
            {loading ? 'Loading assigned students...' : 'No assigned students found.'}
          </p>
        )}
      </div>

      {/* SECTION 3 - EVALUATIONS & RECENT ACTIVITY */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Evaluations */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col h-[320px]">
          <div className="flex items-center gap-2 mb-6">
            <Star className="w-5 h-5 text-indigo-500" />
            <h3 className="font-bold text-slate-900">Evaluations Summary</h3>
          </div>
          
          <div className="flex-1 flex flex-col justify-center gap-6">
            <div className="flex items-center justify-center gap-6">
              <div className="relative w-28 h-28 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="16" fill="none" className="stroke-slate-100" strokeWidth="4" />
                  <circle cx="18" cy="18" r="16" fill="none" className="stroke-emerald-500" strokeWidth="4" 
                    strokeDasharray="100 100" strokeDashoffset="0" strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-indigo-300">
                  <Star className="w-6 h-6" />
                </div>
              </div>
              
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                  <span className="text-sm font-bold text-slate-900">{evalsCompleted}</span>
                  <span className="text-xs text-slate-500">Completed Reviews</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col h-[320px]">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Placement Analytics</h3>
                <p className="text-xs text-slate-500 mt-0.5">Internship Placement Rate by Department</p>
              </div>
            </div>
          </div>
          
          <div className="flex-1 flex items-end justify-around px-8 pt-4 pb-2 border-t border-slate-50">
            {placementRates.map(dept => (
              <div key={dept.dept} className="flex flex-col items-center gap-2">
                <span className="text-[10px] font-bold text-slate-700">{dept.rate}%</span>
                <div className="w-12 bg-indigo-600 rounded-t-sm" style={{ height: `${dept.rate}px` }}></div>
                <span className="text-[10px] font-semibold text-slate-500 uppercase">{dept.dept}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
