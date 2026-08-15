import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockFacultyStudents } from './mockData';
import type { SharedStudentData } from './mockData';
import { 
  Users, 
  ClipboardList, 
  ShieldCheck, 
  Briefcase, 
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Star,
  Activity,
  BarChart3
} from 'lucide-react';
import { Button, ProgressBar, Badge } from '@/components';

const getRiskFactors = (student: SharedStudentData): string[] => {
  const factors: string[] = [];
  const attendancePct = Math.round((student.attendance.present / student.attendance.workingDays) * 100);
  
  if (attendancePct < 75) {
    factors.push('Low attendance');
  }

  if ((student.internshipStatus === 'Active' || student.internshipStatus === 'At Risk') && student.progressPercentage < 40) {
    factors.push('Low progress');
  }

  if (student.internshipStatus !== 'Completed' && student.internshipStatus !== 'Not Started') {
    if (student.lastActivity.includes('days') || student.lastActivity.includes('month') || student.lastActivity === 'Never') {
      factors.push('Low recent activity');
    }
  }

  if (student.riskIndicator !== 'None' && !factors.includes(student.riskIndicator)) {
    factors.push(student.riskIndicator);
  }

  return factors;
};

const getRiskLevel = (factors: string[]): 'On Track' | 'Needs Attention' | 'High Risk' => {
  if (factors.length === 0) return 'On Track';
  if (factors.length === 1) return 'Needs Attention';
  return 'High Risk';
};

export const FacultyDashboard: React.FC = () => {
  const navigate = useNavigate();
  const allStudents = mockFacultyStudents;

  // 1. Top Summary Cards Data
  const assignedStudentsCount = allStudents.length;
  const pendingApprovalsCount = allStudents.filter(s => s.applicationStatus === 'Pending').length;
  const pendingCrossVerificationsCount = allStudents.filter(s => s.crossVerificationStatus === 'Pending').length;
  const activeInternshipsCount = allStudents.filter(s => s.internshipStatus === 'Active').length;

  // 2. Internship Health Data
  const studentHealthData = useMemo(() => {
    return allStudents.map(student => {
      const factors = getRiskFactors(student);
      const riskLevel = getRiskLevel(factors);
      const attendancePct = Math.round((student.attendance.present / student.attendance.workingDays) * 100);
      return { ...student, riskFactors: factors, riskLevel, attendancePct };
    });
  }, [allStudents]);

  const healthyCount = studentHealthData.filter(s => s.riskLevel === 'On Track').length;
  const needsAttentionCount = studentHealthData.filter(s => s.riskLevel === 'Needs Attention').length;
  const atRiskCount = studentHealthData.filter(s => s.riskLevel === 'High Risk').length;
  const overallHealthPct = assignedStudentsCount > 0 ? Math.round((healthyCount / assignedStudentsCount) * 100) : 0;

  const studentsNeedingAttention = studentHealthData.filter(s => s.riskLevel !== 'On Track').slice(0, 2);

  // 3. Task & Milestone Progress Data
  let totalMilestones = 0;
  let completedMilestones = 0;
  let inProgressMilestones = 0;
  let pendingMilestones = 0;

  allStudents.forEach(s => {
    if (s.internshipStatus !== 'Not Started') {
      let foundInProgress = false;
      s.milestones.forEach(m => {
        totalMilestones++;
        if (m.completed) {
          completedMilestones++;
        } else {
          if (!foundInProgress) {
            inProgressMilestones++;
            foundInProgress = true;
          } else {
            pendingMilestones++;
          }
        }
      });
    }
  });

  const overallProgressPct = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

  const progressList = studentHealthData.map(s => ({
    name: s.studentName,
    progress: s.progressPercentage,
  })).slice(0, 4);

  // 4. Evaluations Data
  const evalsPending = allStudents.filter(s => s.evaluationStatus === 'Pending').length;
  const evalsInProgress = allStudents.filter(s => s.evaluationStatus === 'In Progress').length;
  const evalsCompleted = allStudents.filter(s => s.evaluationStatus === 'Completed').length;
  const totalEvals = evalsPending + evalsInProgress + evalsCompleted;

  // 5. Placement Analytics Data
  const depts = ['CSE', 'IT', 'AIML', 'ECE'] as const;
  const placementRates = depts.map(dept => {
    const deptStudents = allStudents.filter(s => s.department === dept);
    if (deptStudents.length === 0) return { dept, rate: Math.round(Math.random() * 40 + 50) }; // Fallback mock for empty depts just for visuals
    const placed = deptStudents.filter(s => s.applicationStatus === 'Approved').length;
    return { dept, rate: Math.round((placed / deptStudents.length) * 100) };
  });

  // 6. Recent Activity Data
  const allEvents = allStudents.flatMap(s => 
    s.timeline.map(t => ({
      student: s.studentName,
      date: t.date,
      event: t.event,
      riskLevel: studentHealthData.find(st => st.id === s.id)?.riskLevel || 'On Track'
    }))
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 4);

  return (
    <div className="space-y-6 pb-10">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            Good morning, Faculty <span className="text-2xl">👋</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">Here's an overview of your internship students and activities.</p>
        </div>
      </div>

      {/* SECTION 1 - TOP SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Assigned Students */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between h-32 hover:border-indigo-200 transition-colors">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">Assigned Students</p>
                <h3 className="text-3xl font-bold text-slate-900 leading-tight">{assignedStudentsCount}</h3>
              </div>
            </div>
          </div>
          <button 
            onClick={() => navigate('/faculty/students')}
            className="text-xs font-semibold text-indigo-600 flex items-center gap-1 hover:text-indigo-800 transition-colors w-fit"
          >
            View Students <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Pending Approvals */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between h-32 hover:border-indigo-200 transition-colors">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                <ClipboardList className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">Pending Approvals</p>
                <h3 className="text-3xl font-bold text-slate-900 leading-tight">{pendingApprovalsCount}</h3>
              </div>
            </div>
          </div>
          <button 
            onClick={() => navigate('/faculty/approvals')}
            className="text-xs font-semibold text-indigo-600 flex items-center gap-1 hover:text-indigo-800 transition-colors w-fit"
          >
            Review Applications <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Pending Cross-Verifications */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between h-32 hover:border-indigo-200 transition-colors">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">Pending Cross-Verifications</p>
                <h3 className="text-3xl font-bold text-slate-900 leading-tight">{pendingCrossVerificationsCount}</h3>
              </div>
            </div>
          </div>
          <button 
            onClick={() => navigate('/faculty/approvals')}
            className="text-xs font-semibold text-indigo-600 flex items-center gap-1 hover:text-indigo-800 transition-colors w-fit"
          >
            Review <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Active Internships */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between h-32 hover:border-indigo-200 transition-colors">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">Active Internships</p>
                <h3 className="text-3xl font-bold text-slate-900 leading-tight">{activeInternshipsCount}</h3>
              </div>
            </div>
          </div>
          <button 
            onClick={() => navigate('/faculty/students')}
            className="text-xs font-semibold text-indigo-600 flex items-center gap-1 hover:text-indigo-800 transition-colors w-fit"
          >
            View Internships <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* SECTION 2 - OVERALL MONITORING & STUDENTS NEEDING ATTENTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Overall Internship Health (Left) */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col h-[340px]">
          <div className="flex items-center gap-2 mb-6">
            <Activity className="w-5 h-5 text-indigo-500" />
            <h3 className="font-bold text-slate-900">Overall Internship Health</h3>
          </div>
          
          <div className="flex-1 flex items-center justify-center gap-8">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="16" fill="none" className="stroke-slate-100" strokeWidth="3" />
                
                {/* Needs Attention */}
                {needsAttentionCount > 0 && (
                  <circle 
                    cx="18" cy="18" r="16" fill="none" 
                    className="stroke-amber-500" 
                    strokeWidth="3" 
                    strokeDasharray={`${(needsAttentionCount / assignedStudentsCount) * 100} 100`}
                    strokeDashoffset={0} 
                  />
                )}
                
                {/* At Risk */}
                {atRiskCount > 0 && (
                  <circle 
                    cx="18" cy="18" r="16" fill="none" 
                    className="stroke-rose-500" 
                    strokeWidth="3" 
                    strokeDasharray={`${(atRiskCount / assignedStudentsCount) * 100} 100`}
                    strokeDashoffset={-(needsAttentionCount / assignedStudentsCount) * 100} 
                  />
                )}

                {/* Healthy */}
                {healthyCount > 0 && (
                  <circle 
                    cx="18" cy="18" r="16" fill="none" 
                    className="stroke-emerald-500" 
                    strokeWidth="3" 
                    strokeDasharray={`${(healthyCount / assignedStudentsCount) * 100} 100`}
                    strokeDashoffset={-((needsAttentionCount + atRiskCount) / assignedStudentsCount) * 100} 
                    strokeLinecap="round"
                  />
                )}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-slate-900">{overallHealthPct}%</span>
                <span className="text-[10px] font-medium text-slate-500">Overall Health</span>
              </div>
            </div>

            <div className="flex flex-col gap-4 justify-center">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <span className="text-lg font-bold text-slate-900 w-4">{healthyCount}</span>
                <span className="text-xs text-slate-500 font-medium">On Track</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                <span className="text-lg font-bold text-slate-900 w-4">{needsAttentionCount}</span>
                <span className="text-xs text-slate-500 font-medium">Needs Attention</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                <span className="text-lg font-bold text-slate-900 w-4">{atRiskCount}</span>
                <span className="text-xs text-slate-500 font-medium">At Risk</span>
              </div>
            </div>
          </div>
          
          <button 
            onClick={() => navigate('/faculty/insights')}
            className="text-xs font-semibold text-indigo-600 flex items-center gap-1 hover:text-indigo-800 transition-colors w-fit mt-2"
          >
            View Insights <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Students Needing Attention (Right) */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col h-[340px] lg:col-span-2">
          <div className="flex items-center gap-2 mb-6">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-slate-900">Students Needing Attention</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-4">
            {studentsNeedingAttention.map((student) => (
              <div key={student.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between border border-slate-100 p-4 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-colors gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-lg shrink-0">
                    {student.studentName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm leading-tight">{student.studentName}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">{student.role} • {student.company}</p>
                    
                    <div className="flex items-center gap-6 mt-2">
                      <div>
                        <p className="text-[10px] text-slate-400 font-medium uppercase">Attendance</p>
                        <p className={`text-xs font-bold ${student.attendancePct < 75 ? 'text-amber-600' : 'text-slate-700'}`}>{student.attendancePct}%</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-medium uppercase">Progress</p>
                        <p className="text-xs font-bold text-indigo-700">{student.progressPercentage}%</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-medium uppercase">Last Activity</p>
                        <p className="text-xs font-bold text-slate-700">{student.lastActivity}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-3 w-full sm:w-auto">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1.5 ${
                    student.riskLevel === 'High Risk' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${student.riskLevel === 'High Risk' ? 'bg-rose-500' : 'bg-amber-500'}`}></div>
                    {student.riskLevel}
                  </span>
                  <button 
                    onClick={() => navigate('/faculty/students')}
                    className="w-full sm:w-auto text-xs font-semibold px-4 py-1.5 border border-indigo-200 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors flex items-center justify-center gap-1"
                  >
                    View Details <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
            {studentsNeedingAttention.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mb-3" />
                <p className="text-sm font-semibold text-slate-900">All Students On Track</p>
                <p className="text-xs text-slate-500 mt-1">No students require immediate attention.</p>
              </div>
            )}
          </div>
          
          <button 
            onClick={() => navigate('/faculty/students')}
            className="text-xs font-semibold text-indigo-600 flex items-center gap-1 hover:text-indigo-800 transition-colors w-fit mt-4"
          >
            View All Students <ArrowRight className="w-3 h-3" />
          </button>
        </div>

      </div>

      {/* SECTION 3 - TASK, EVALUATIONS, RECENT ACTIVITY */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Task & Milestone Progress */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col h-[320px] lg:col-span-2">
          <div className="flex justify-between items-start mb-6">
            <h3 className="font-bold text-slate-900">Task & Milestone Progress</h3>
          </div>
          
          <div className="flex-1 flex gap-8">
            <div className="w-1/2 flex flex-col">
              <p className="text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Overall Progress</p>
              <h2 className="text-5xl font-bold text-indigo-600 mb-4">{overallProgressPct}%</h2>
              <div className="w-full h-2 bg-slate-100 rounded-full mb-6 overflow-hidden">
                <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${overallProgressPct}%` }}></div>
              </div>
              
              <div className="flex justify-between mt-auto bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <div>
                    <p className="text-sm font-bold text-slate-900 leading-none">{completedMilestones} / {totalMilestones}</p>
                    <p className="text-[9px] text-slate-500 font-medium uppercase mt-0.5">Completed Milestones</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-500" />
                  <div>
                    <p className="text-sm font-bold text-slate-900 leading-none">{inProgressMilestones}</p>
                    <p className="text-[9px] text-slate-500 font-medium uppercase mt-0.5">In Progress</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full border-2 border-amber-500 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 leading-none">{pendingMilestones}</p>
                    <p className="text-[9px] text-slate-500 font-medium uppercase mt-0.5">Pending</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="w-1/2 flex flex-col border-l border-slate-100 pl-8">
              <div className="flex-1 space-y-4 justify-center flex flex-col">
                {progressList.map((st, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-slate-700">{st.name}</span>
                      <span className="font-bold text-slate-900">{st.progress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${st.progress}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex justify-end mt-4">
            <button 
              onClick={() => navigate('/faculty/students')}
              className="text-xs font-semibold text-indigo-600 flex items-center gap-1 hover:text-indigo-800 transition-colors w-fit"
            >
              View Student Progress <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Evaluations */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col h-[320px]">
          <div className="flex items-center gap-2 mb-6">
            <Star className="w-5 h-5 text-indigo-500" />
            <h3 className="font-bold text-slate-900">Evaluations</h3>
          </div>
          
          <div className="flex-1 flex flex-col justify-center gap-6">
            <div className="flex items-center justify-center gap-6">
              <div className="relative w-28 h-28 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="16" fill="none" className="stroke-slate-100" strokeWidth="4" />
                  
                  {evalsPending > 0 && (
                    <circle cx="18" cy="18" r="16" fill="none" className="stroke-indigo-600" strokeWidth="4" 
                      strokeDasharray={`${(evalsPending / totalEvals) * 100} 100`} strokeDashoffset={0} 
                    />
                  )}
                  {evalsInProgress > 0 && (
                    <circle cx="18" cy="18" r="16" fill="none" className="stroke-amber-500" strokeWidth="4" 
                      strokeDasharray={`${(evalsInProgress / totalEvals) * 100} 100`} strokeDashoffset={-(evalsPending / totalEvals) * 100} 
                    />
                  )}
                  {evalsCompleted > 0 && (
                    <circle cx="18" cy="18" r="16" fill="none" className="stroke-emerald-500" strokeWidth="4" 
                      strokeDasharray={`${(evalsCompleted / totalEvals) * 100} 100`} strokeDashoffset={-((evalsPending + evalsInProgress) / totalEvals) * 100} 
                      strokeLinecap="round"
                    />
                  )}
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-indigo-300">
                  <Star className="w-6 h-6" />
                </div>
              </div>
              
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-600"></div>
                  <span className="text-sm font-bold text-slate-900">{evalsPending}</span>
                  <span className="text-xs text-slate-500">Pending</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                  <span className="text-sm font-bold text-slate-900">{evalsInProgress}</span>
                  <span className="text-xs text-slate-500">In Progress</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                  <span className="text-sm font-bold text-slate-900">{evalsCompleted}</span>
                  <span className="text-xs text-slate-500">Completed</span>
                </div>
              </div>
            </div>
          </div>
          
          <button 
            onClick={() => {}}
            className="text-xs font-semibold text-indigo-600 flex items-center gap-1 hover:text-indigo-800 transition-colors w-fit self-end mt-4"
          >
            View Evaluations <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col h-[320px]">
          <div className="flex items-center gap-2 mb-6">
            <Clock className="w-5 h-5 text-indigo-500" />
            <h3 className="font-bold text-slate-900">Recent Activity</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-4 relative">
            <div className="absolute left-[11px] top-2 bottom-2 w-px bg-slate-100 z-0"></div>
            {allEvents.map((evt, i) => {
              let iconColor = 'text-slate-400';
              let bgColor = 'bg-slate-50 border-slate-200';
              if (evt.event.toLowerCase().includes('completed') || evt.event.toLowerCase().includes('approved')) {
                iconColor = 'text-emerald-500';
                bgColor = 'bg-emerald-50 border-emerald-200';
              } else if (evt.riskLevel === 'High Risk' || evt.event.toLowerCase().includes('missed')) {
                iconColor = 'text-amber-500';
                bgColor = 'bg-amber-50 border-amber-200';
              } else if (evt.event.toLowerCase().includes('submitted')) {
                iconColor = 'text-indigo-500';
                bgColor = 'bg-indigo-50 border-indigo-200';
              }
              
              return (
                <div key={i} className="flex gap-3 relative z-10">
                  <div className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${bgColor}`}>
                    {iconColor === 'text-emerald-500' && <CheckCircle2 className={`w-3.5 h-3.5 ${iconColor}`} />}
                    {iconColor === 'text-amber-500' && <AlertTriangle className={`w-3 h-3 ${iconColor}`} />}
                    {(iconColor !== 'text-emerald-500' && iconColor !== 'text-amber-500') && <div className={`w-1.5 h-1.5 rounded-full ${iconColor.replace('text', 'bg')}`}></div>}
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-slate-800 leading-tight">
                      {evt.student} <span className="font-normal text-slate-600">{evt.event.toLowerCase()}</span>
                    </p>
                    <p className="text-[9px] text-slate-400 mt-0.5">{evt.date}</p>
                  </div>
                </div>
              );
            })}
          </div>
          
          <button 
            onClick={() => {}}
            className="text-xs font-semibold text-indigo-600 flex items-center gap-1 hover:text-indigo-800 transition-colors w-fit self-end mt-4"
          >
            View All Activity <ArrowRight className="w-3 h-3" />
          </button>
        </div>

      </div>

      {/* SECTION 4 - PLACEMENT ANALYTICS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col h-[220px]">
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
          
          <button 
            onClick={() => {}}
            className="text-xs font-semibold text-indigo-600 flex items-center gap-1 hover:text-indigo-800 transition-colors w-fit self-end"
          >
            View Analytics <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
      
    </div>
  );
};
