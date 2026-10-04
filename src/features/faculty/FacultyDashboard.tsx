import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, CheckCircle2, Award, Clock, ArrowUpRight, 
  ArrowRight, ShieldCheck, UserCheck, Star, 
  AlertTriangle, BarChart3, HelpCircle, Layers, RefreshCw
} from 'lucide-react';
import { 
  fetchFacultyAssignedStudentsBackend, 
  fetchFacultyDashboardMetricsBackend,
  type FacultyAssignedStudentRecord,
  type FacultyDashboardMetrics
} from '@/services/api/backendService';

export const FacultyDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [assignedStudents, setAssignedStudents] = useState<FacultyAssignedStudentRecord[]>([]);
  const [metrics, setMetrics] = useState<FacultyDashboardMetrics>({
    totalAssignedStudents: 0,
    activeInternshipsCount: 0,
    pendingApplicationReviews: 0,
    completedEvaluationsCount: 0,
    placementRate: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const loadFacultyDashboard = async () => {
    try {
      const [remoteStudents, remoteMetrics] = await Promise.all([
        fetchFacultyAssignedStudentsBackend(),
        fetchFacultyDashboardMetricsBackend(),
      ]);

      if (remoteStudents) setAssignedStudents(remoteStudents);
      if (remoteMetrics) setMetrics(remoteMetrics);
    } catch (err) {
      console.error('[FacultyDashboard] Load error:', err);
    }
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await loadFacultyDashboard();
    setIsRefreshing(false);
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await loadFacultyDashboard();
      setLoading(false);
    };

    init();

    const handleFocus = () => {
      loadFacultyDashboard();
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const totalAssigned = metrics.totalAssignedStudents || assignedStudents.length;
  const activeInterns = metrics.activeInternshipsCount || assignedStudents.filter((s) => s.applicationStatus === 'Selected').length;
  const pendingApprovals = metrics.pendingApplicationReviews || assignedStudents.filter((s) => s.applicationStatus === 'Submitted' || s.applicationStatus === 'Shortlisted').length;
  const placementRate = metrics.placementRate || (totalAssigned > 0 ? Math.round((activeInterns / totalAssigned) * 100) : 100);
  const evalsCompleted = metrics.completedEvaluationsCount || activeInterns;

  const placementRates = [
    { dept: 'CSE', rate: 92 },
    { dept: 'IT', rate: 88 },
    { dept: 'AIML', rate: 85 },
    { dept: 'ECE', rate: 78 },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Faculty Mentor Dashboard</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              System Connected
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">Academic overview & internship monitoring for assigned batch cohorts.</p>
        </div>

        <button
          onClick={handleManualRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all shadow-xs w-fit"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-indigo-600 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isRefreshing ? 'Syncing...' : 'Sync System Data'}</span>
        </button>
      </div>

      {/* SECTION 1 - METRIC CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1 */}
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-5 flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md">Live Cohort</span>
          </div>
          <div className="mt-4">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">{totalAssigned}</h2>
            <p className="text-xs font-semibold text-slate-500 mt-1">Total Assigned Students</p>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-5 flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md">Active</span>
          </div>
          <div className="mt-4">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">{activeInterns}</h2>
            <p className="text-xs font-semibold text-slate-500 mt-1">Active Internships</p>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-5 flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-50 text-amber-700 rounded-md">Review</span>
          </div>
          <div className="mt-4">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">{pendingApprovals}</h2>
            <p className="text-xs font-semibold text-slate-500 mt-1">Pending Application Reviews</p>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-5 flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600">
              <Award className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-sky-50 text-sky-700 rounded-md">Compliance</span>
          </div>
          <div className="mt-4">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">{placementRate}%</h2>
            <p className="text-xs font-semibold text-slate-500 mt-1">Placement Compliance Rate</p>
          </div>
        </div>
      </div>

      {/* SECTION 2 - ASSIGNED STUDENTS SUMMARY TABLE */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-6 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Assigned Student Cohort & Pipeline</h3>
            <p className="text-xs text-slate-500">Live student status queried from active records & applications</p>
          </div>
          <button
            onClick={() => navigate('/faculty/assigned-students')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            View All Cohort <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {assignedStudents.length > 0 ? (
          <div className="divide-y divide-slate-100 text-xs">
            {assignedStudents.slice(0, 6).map((student) => (
              <div key={student.assignmentId} className="py-3 flex items-center justify-between hover:bg-slate-50/50 px-2 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                    {student.studentName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{student.studentName}</h4>
                    <p className="text-slate-500 text-[11px] font-mono">{student.studentEmail}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-indigo-600 block">{student.internshipTitle}</span>
                  <div className="flex items-center justify-end gap-2 text-[10px] text-slate-400 mt-0.5">
                    <span>{student.companyName}</span>
                    <span>•</span>
                    <span className={`font-semibold px-1.5 py-0.2 rounded ${
                      student.applicationStatus === 'Selected'
                        ? 'bg-emerald-50 text-emerald-700'
                        : student.applicationStatus === 'Submitted'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {student.applicationStatus}
                    </span>
                  </div>
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
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-6 flex flex-col h-[320px]">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-indigo-500" />
              <h3 className="font-bold text-slate-900">Evaluations & Academic Reviews</h3>
            </div>
            <button
              onClick={() => navigate('/faculty/evaluations')}
              className="text-xs font-semibold text-indigo-600 hover:underline"
            >
              Manage
            </button>
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
                <div className="absolute inset-0 flex items-center justify-center text-indigo-400">
                  <Star className="w-6 h-6" />
                </div>
              </div>
              
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                  <span className="text-sm font-bold text-slate-900">{evalsCompleted}</span>
                  <span className="text-xs text-slate-500">Completed Reviews</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                  <span className="text-sm font-bold text-slate-900">{pendingApprovals}</span>
                  <span className="text-xs text-slate-500">Pending Evaluation Actions</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Bar */}
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-6 flex flex-col h-[320px]">
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
