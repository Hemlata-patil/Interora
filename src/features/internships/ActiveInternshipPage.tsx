import React, { useState, useEffect } from 'react';
import { PageHeader, Card, Badge, ProgressBar, Button, EmptyState } from '@/components';
import { mockActiveInternshipData, type ActiveInternshipDetails } from './data/mockActiveInternship';
import { initialMockTasks, initialMockWorkLogs } from '@/features/tasks/data/mockTasks';
import { mockAttendanceHistory, calculateAttendanceMetrics } from '@/features/attendance/data/mockAttendance';
import { Compass, Calendar, Clock, MapPin, UserCheck, Mail, ArrowRight, CheckCircle2, CheckSquare, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/services/supabase/supabaseClient';
import { fetchActiveStudentInternshipBackend } from '@/services/api/backendService';

export const ActiveInternshipPage: React.FC = () => {
  const [activeData, setActiveData] = useState<ActiveInternshipDetails | null>(mockActiveInternshipData);
  const [loading, setLoading] = useState<boolean>(true);

  const loadActiveInternship = async () => {
    const remoteRecord = await fetchActiveStudentInternshipBackend();
    if (remoteRecord) {
      const liveDetails: ActiveInternshipDetails = {
        internshipId: remoteRecord.internshipId,
        internshipTitle: remoteRecord.title,
        companyName: remoteRecord.companyName,
        location: remoteRecord.location,
        workMode: 'Remote',
        internshipType: 'Full-time',
        duration: remoteRecord.duration,
        startDate: remoteRecord.appliedAt ? remoteRecord.appliedAt.slice(0, 10) : '2026-08-01',
        endDate: '2026-11-30',
        mentorName: 'TPO Assigned Lead',
        mentorRole: 'Technical Lead',
        mentorEmail: 'mentor@interora.app',
        status: 'Active',
        progressPercentage: 75,
        currentPhase: 'Phase 2: Project Development & Sprint Execution',
        totalMilestones: 4,
        completedMilestones: 2,
        nextMilestone: 'Sprint Evaluation & Code Review',
        nextMilestoneDate: '2026-08-31',
        journeyPhases: [
          { title: 'Phase 1: Onboarding & Setup', description: 'Access granted & dev environment verified.', status: 'completed' },
          { title: 'Phase 2: Core Development', description: 'Core features and backend API integration.', status: 'current' },
          { title: 'Phase 3: Final Project Review & PPO Evaluation', description: 'TPO & Company final evaluation.', status: 'upcoming' },
        ],
      };
      setActiveData(liveDetails);
    }
  };

  useEffect(() => {
    loadActiveInternship();

    // Subscribe to Realtime postgres changes on student_applications table
    const channel = supabase
      .channel('active_internship_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'student_applications' },
        () => {
          loadActiveInternship();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (!activeData) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="My Internship"
          description="Track your current internship and stay updated on your progress."
        />
        <EmptyState
          icon={<Compass className="w-6 h-6 text-slate-400" />}
          title="No Active Internship Yet"
          description="You are currently not enrolled in an active internship. Browse open opportunities and apply."
          action={
            <Link to="/student/internships">
              <Button variant="primary" size="sm">
                Browse Internships
              </Button>
            </Link>
          }
        />
      </div>
    );
  }

  const totalTasks = initialMockTasks.length;
  const inProgressTasks = initialMockTasks.filter((t) => t.status === 'In Progress').length;
  const completedTasks = initialMockTasks.filter((t) => t.status === 'Completed').length;

  const totalHoursLogged = initialMockWorkLogs.reduce((acc, curr) => acc + curr.hoursWorked, 0);
  const currentWeekHours = initialMockWorkLogs.slice(0, 5).reduce((acc, curr) => acc + curr.hoursWorked, 0);

  const attendanceMetrics = calculateAttendanceMetrics(mockAttendanceHistory);

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Active Internship"
        description="Monitor your ongoing internship milestones, attendance, tasks, and mentor contact."
        action={
          <Link to="/student/attendance">
            <Button variant="primary" size="sm">
              <Clock className="w-4 h-4 mr-1.5" /> Check-in Today
            </Button>
          </Link>
        }
      />

      <Card className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 text-white p-6 sm:p-8 rounded-2xl border-none shadow-lg">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="emerald">ACTIVE ENROLLMENT</Badge>
              <span className="text-xs text-indigo-200">ID: {activeData.internshipId}</span>
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {activeData.internshipTitle}
              </h2>
              <p className="text-sm text-indigo-200 mt-1 font-medium">
                {activeData.companyName}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-indigo-100 pt-1">
              <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-indigo-400" /> {activeData.location}</span>
              <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-indigo-400" /> {activeData.duration} ({activeData.startDate} to {activeData.endDate})</span>
            </div>
          </div>

          <div className="w-full lg:w-72 bg-white/10 p-4 rounded-xl backdrop-blur-xs border border-white/10 space-y-2.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-indigo-200 font-semibold uppercase text-[10px]">OVERALL PROGRESS</span>
              <span className="font-bold text-emerald-400">{activeData.progressPercentage}%</span>
            </div>
            <ProgressBar progress={activeData.progressPercentage} color="emerald" showPercent={false} />
            <span className="text-[11px] text-indigo-200 block text-right">Status: {activeData.status}</span>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs flex items-center justify-between">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">ATTENDANCE RATE</span>
            <span className="text-xl font-extrabold text-slate-800">{attendanceMetrics.attendancePercentage}%</span>
            <span className="text-[10px] text-emerald-600 font-semibold block">Compliant</span>
          </div>
          <Calendar className="w-8 h-8 text-emerald-500 bg-emerald-50 p-1.5 rounded-lg" />
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs flex items-center justify-between">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">TASKS COMPLETED</span>
            <span className="text-xl font-extrabold text-slate-800">{completedTasks} / {totalTasks}</span>
            <span className="text-[10px] text-indigo-600 font-semibold block">{inProgressTasks} In Progress</span>
          </div>
          <CheckSquare className="w-8 h-8 text-indigo-500 bg-indigo-50 p-1.5 rounded-lg" />
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs flex items-center justify-between">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">TOTAL WORK LOGGED</span>
            <span className="text-xl font-extrabold text-slate-800">{totalHoursLogged} hrs</span>
            <span className="text-[10px] text-slate-500 block">{currentWeekHours} hrs this week</span>
          </div>
          <FileText className="w-8 h-8 text-sky-500 bg-sky-50 p-1.5 rounded-lg" />
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs flex items-center justify-between">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">MENTOR CONTACT</span>
            <span className="text-sm font-bold text-slate-800 truncate block max-w-[130px]">{activeData.mentorName}</span>
            <span className="text-[10px] text-indigo-600 font-semibold block">Assigned Lead</span>
          </div>
          <UserCheck className="w-8 h-8 text-indigo-500 bg-indigo-50 p-1.5 rounded-lg" />
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Quick Actions & Shortcuts</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="hover:border-slate-300 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckSquare className="w-4 h-4 text-indigo-600" />
                  <h4 className="font-bold text-slate-900 text-sm">Daily Tasks</h4>
                </div>
                <Badge variant="indigo">{inProgressTasks} Active</Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg">
                  <span className="text-slate-400 block text-[10px]">TOTAL TASKS</span>
                  <span className="text-base font-bold text-slate-800">{totalTasks}</span>
                </div>
                <div className="p-2.5 bg-emerald-50/50 border border-emerald-100 rounded-lg">
                  <span className="text-emerald-600 block text-[10px]">COMPLETED</span>
                  <span className="text-base font-bold text-emerald-700">{completedTasks}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 mt-3">
              <Link to="/student/tasks" className="w-full block">
                <Button variant="outline" size="sm" className="w-full justify-between">
                  <span>View Tasks</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </Card>

          <Card className="hover:border-slate-300 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <h4 className="font-bold text-slate-900 text-sm">Work Logs</h4>
                </div>
                <Badge variant="indigo">{totalHoursLogged}h Total</Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg">
                  <span className="text-slate-400 block text-[10px]">TOTAL HOURS</span>
                  <span className="text-base font-bold text-slate-800">{totalHoursLogged} hrs</span>
                </div>
                <div className="p-2.5 bg-indigo-50/50 border border-indigo-100 rounded-lg">
                  <span className="text-indigo-600 block text-[10px]">THIS WEEK</span>
                  <span className="text-base font-bold text-indigo-700">{currentWeekHours} hrs</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 mt-3">
              <Link to="/student/work-logs" className="w-full block">
                <Button variant="outline" size="sm" className="w-full justify-between">
                  <span>View Work Logs</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </Card>

          <Card className="hover:border-slate-300 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  <h4 className="font-bold text-slate-900 text-sm">Attendance</h4>
                </div>
                <Badge variant="emerald">{attendanceMetrics.attendancePercentage}%</Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg">
                  <span className="text-slate-400 block text-[10px]">ATTENDANCE %</span>
                  <span className="text-base font-bold text-emerald-600">{attendanceMetrics.attendancePercentage}%</span>
                </div>
                <div className="p-2.5 bg-emerald-50/50 border border-emerald-100 rounded-lg">
                  <span className="text-emerald-600 block text-[10px]">HEALTH</span>
                  <span className="text-xs font-bold text-emerald-700 truncate block mt-0.5">{attendanceMetrics.healthStatus}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 mt-3">
              <Link to="/student/attendance" className="w-full block">
                <Button variant="outline" size="sm" className="w-full justify-between">
                  <span>View Attendance</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card title="Internship Journey & Phases" subtitle="Structured phases for host internship program">
            <div className="space-y-5 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {activeData.journeyPhases.map((phase, idx) => {
                const isCompleted = phase.status === 'completed';
                const isCurrent = phase.status === 'current';

                return (
                  <div key={idx} className="relative flex items-start space-x-4 pl-8">
                    <div
                      className={`absolute left-1.5 top-0.5 -translate-x-1/2 w-4 h-4 rounded-full border-2 bg-white flex items-center justify-center ${
                        isCompleted
                          ? 'border-emerald-600 bg-emerald-600 text-white'
                          : isCurrent
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                          : 'border-slate-300'
                      }`}
                    >
                      {isCompleted && <CheckCircle2 className="w-3 h-3 text-white" />}
                    </div>

                    <div className="space-y-0.5 text-xs">
                      <div className="flex items-center justify-between">
                        <h4 className={`font-bold ${isCompleted ? 'text-slate-900' : isCurrent ? 'text-indigo-600' : 'text-slate-400'}`}>
                          {phase.title}
                        </h4>
                        {isCurrent && <Badge variant="indigo" className="text-[10px] py-0 px-1.5">Current Phase</Badge>}
                      </div>
                      <p className="text-slate-500 text-[11px] leading-snug">{phase.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Current Focus">
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Target Milestone</span>
                <p className="font-bold text-slate-800 leading-snug">{activeData.nextMilestone}</p>
              </div>

              <div className="p-3 bg-amber-50/60 border border-amber-100 rounded-lg text-amber-800 flex items-center justify-between">
                <span className="text-[11px] font-medium">Target Due Date</span>
                <span className="font-bold text-xs">{activeData.nextMilestoneDate}</span>
              </div>
            </div>
          </Card>

          <Card title="Host Mentor Details">
            <div className="space-y-3 text-xs">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-indigo-100 text-indigo-700 font-bold rounded-full flex items-center justify-center shrink-0 text-sm">
                  {activeData.mentorName.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">{activeData.mentorName}</h4>
                  <p className="text-[11px] text-slate-500">{activeData.mentorRole}</p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-slate-700 flex items-center space-x-2">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="font-medium truncate">{activeData.mentorEmail}</span>
              </div>

              <a href={`mailto:${activeData.mentorEmail}`} className="block w-full">
                <Button variant="secondary" className="w-full">
                  <Mail className="w-4 h-4 mr-1.5" /> Contact Mentor
                </Button>
              </a>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
