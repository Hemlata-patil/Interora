import React, { useState, useMemo } from 'react';
import { PageHeader, Card, Badge, Button, EmptyState } from '@/components';
import { mockActiveInternshipData } from '@/features/internships/data/mockActiveInternship';
import {
  mockAttendanceHistory,
  calculateAttendanceMetrics,
  type AttendanceRecord,
} from './data/mockAttendance';
import { initialMockTasks, initialMockWorkLogs } from '@/features/tasks/data/mockTasks';
import { AttendanceSummary } from './components/AttendanceSummary';
import { AttendanceCalendar } from './components/AttendanceCalendar';
import { AttendanceHistory } from './components/AttendanceHistory';
import { Compass, CheckSquare, FileText, Calendar, LogIn, LogOut, CheckCircle2, ArrowRight, Clock, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AttendancePage: React.FC = () => {
  const activeInternship = mockActiveInternshipData; // Active enrollment

  const [history, setHistory] = useState<AttendanceRecord[]>(mockAttendanceHistory);
  const [todayState, setTodayState] = useState<'not_checked_in' | 'checked_in' | 'completed'>('not_checked_in');
  const [checkInTime, setCheckInTime] = useState<string | null>(null);
  const [checkOutTime, setCheckOutTime] = useState<string | null>(null);

  // 1. Calculate Attendance Metrics
  const attendanceMetrics = useMemo(() => calculateAttendanceMetrics(history), [history]);

  // 2. Calculate Daily Tasks Metrics from Phase 6 Data
  const taskMetrics = useMemo(() => {
    const total = initialMockTasks.length;
    const inProgress = initialMockTasks.filter((t) => t.status === 'In Progress').length;
    const completed = initialMockTasks.filter((t) => t.status === 'Completed').length;
    const pendingBlocked = initialMockTasks.filter((t) => t.status === 'To Do' || t.status === 'Blocked').length;
    return { total, inProgress, completed, pendingBlocked };
  }, []);

  // 3. Calculate Work Logs Metrics from Phase 6 Data
  const workLogMetrics = useMemo(() => {
    const totalHours = initialMockWorkLogs.reduce((acc, curr) => acc + curr.hoursWorked, 0);
    const loggedDays = initialMockWorkLogs.length;
    const currentWeekHours = initialMockWorkLogs.slice(0, 5).reduce((acc, curr) => acc + curr.hoursWorked, 0);
    const avgHoursPerDay = loggedDays > 0 ? (totalHours / loggedDays).toFixed(1) : '0';
    return { totalHours, loggedDays, currentWeekHours, avgHoursPerDay };
  }, []);

  const handleCheckIn = () => {
    const timeNow = '09:05 AM';
    setCheckInTime(timeNow);
    setTodayState('checked_in');
  };

  const handleCheckOut = () => {
    const timeOut = '05:30 PM';
    setCheckOutTime(timeOut);
    setTodayState('completed');

    // Dynamically append today's completed attendance to history logs
    const todayRecord: AttendanceRecord = {
      id: `att_${Date.now()}`,
      date: '2026-08-14',
      day: 'Fri',
      status: 'present',
      checkIn: checkInTime || '09:05 AM',
      checkOut: timeOut,
      workingHours: '8h 25m',
    };

    setHistory((prev) => {
      const filtered = prev.filter((r) => r.date !== '2026-08-14');
      return [todayRecord, ...filtered];
    });
  };

  if (!activeInternship) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Productivity"
          description="Manage your attendance, daily tasks, and work logs during your active internship."
        />
        <EmptyState
          icon={<Compass className="w-6 h-6 text-slate-400" />}
          title="No Active Internship"
          description="You don't have an active internship yet. Browse verified opportunities to get started."
          action={
            <Link to="/student/internships">
              <Button variant="primary" size="sm">
                Browse Internships â†’
              </Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <PageHeader
        title="Productivity"
        description="Manage your attendance, daily tasks, and work logs during your active internship."
      />

      {/* 2. Active Internship Context Banner Card */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-bold text-slate-900">{activeInternship.internshipTitle}</h3>
              <Badge variant="emerald">Active Enrollment</Badge>
            </div>
            <p className="text-slate-600 font-semibold mt-0.5">
              {activeInternship.companyName} â€¢ <span className="text-slate-500 font-normal">{activeInternship.duration} ({activeInternship.workMode})</span>
            </p>
          </div>

          <div className="flex items-center space-x-3 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-semibold">ATTENDANCE RATE</span>
              <span className="font-bold text-indigo-600 text-sm">{attendanceMetrics.attendancePercentage}%</span>
            </div>
            <div className="h-6 w-px bg-slate-200"></div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-semibold">HEALTH STATUS</span>
              <span className="font-bold text-emerald-600 text-xs">{attendanceMetrics.healthStatus}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* 3. CARD 1: ATTENDANCE OVERVIEW & CHECK IN/OUT */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Attendance Tracking</h3>
          <Badge variant="emerald">Rate: {attendanceMetrics.attendancePercentage}%</Badge>
        </div>

        <AttendanceSummary metrics={attendanceMetrics} />

        {/* Today's Attendance Check-in Widget */}
        <Card title="Today's Attendance Action" subtitle="Friday, 14 August 2026">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1 text-xs">
              <div className="flex items-center space-x-2">
                <span className="text-slate-500">Current Status:</span>
                {todayState === 'not_checked_in' && <Badge variant="amber">Not Checked In</Badge>}
                {todayState === 'checked_in' && <Badge variant="indigo">Checked In (Active Working Session)</Badge>}
                {todayState === 'completed' && <Badge variant="emerald">Completed For Today</Badge>}
              </div>

              <div className="flex items-center space-x-4 text-slate-600 pt-1">
                <span>Check In: <strong className="text-slate-900 font-mono">{checkInTime || '-'}</strong></span>
                <span>â€¢</span>
                <span>Check Out: <strong className="text-slate-900 font-mono">{checkOutTime || '-'}</strong></span>
              </div>
            </div>

            <div className="shrink-0">
              {todayState === 'not_checked_in' && (
                <Button variant="primary" size="md" onClick={handleCheckIn}>
                  <LogIn className="w-4 h-4 mr-2" /> Check In Now
                </Button>
              )}

              {todayState === 'checked_in' && (
                <Button variant="secondary" size="md" onClick={handleCheckOut}>
                  <LogOut className="w-4 h-4 mr-2 text-indigo-600" /> Check Out Now
                </Button>
              )}

              {todayState === 'completed' && (
                <div className="inline-flex items-center space-x-1.5 text-emerald-700 bg-emerald-50 px-3.5 py-2 rounded-lg text-xs font-semibold border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Shift Completed (8h 25m)</span>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* 4. PRODUCTIVITY CARDS GRID: DAILY TASKS & WORK LOGS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CARD 2: DAILY TASKS */}
        <Card className="hover:border-slate-300 transition-all flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <CheckSquare className="w-5 h-5 text-indigo-600" />
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Daily Tasks</h4>
                  <span className="text-[11px] text-slate-500 block">Assigned sprint tasks & deliverables</span>
                </div>
              </div>
              <Badge variant="indigo">{taskMetrics.total} Total Tasks</Badge>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">TOTAL TASKS</span>
                <span className="text-lg font-bold text-slate-800">{taskMetrics.total}</span>
              </div>
              <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-lg">
                <span className="text-indigo-600 block text-[10px] uppercase font-semibold">IN PROGRESS</span>
                <span className="text-lg font-bold text-indigo-700">{taskMetrics.inProgress}</span>
              </div>
              <div className="p-3 bg-emerald-50/60 border border-emerald-100 rounded-lg">
                <span className="text-emerald-600 block text-[10px] uppercase font-semibold">COMPLETED</span>
                <span className="text-lg font-bold text-emerald-700">{taskMetrics.completed}</span>
              </div>
              <div className="p-3 bg-amber-50/60 border border-amber-100 rounded-lg">
                <span className="text-amber-600 block text-[10px] uppercase font-semibold">PENDING</span>
                <span className="text-lg font-bold text-amber-700">{taskMetrics.pendingBlocked}</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4 flex justify-end">
            <Link to="/student/tasks">
              <Button variant="outline" size="sm">
                View Daily Tasks <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </Link>
          </div>
        </Card>

        {/* CARD 3: WORK LOGS */}
        <Card className="hover:border-slate-300 transition-all flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Work Logs</h4>
                  <span className="text-[11px] text-slate-500">Daily hours & completed work summaries</span>
                </div>
              </div>
              <Badge variant="indigo">{workLogMetrics.totalHours} hrs Total</Badge>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">TOTAL HOURS</span>
                <span className="text-lg font-bold text-slate-800">{workLogMetrics.totalHours} hrs</span>
              </div>
              <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-lg">
                <span className="text-indigo-600 block text-[10px] uppercase font-semibold">THIS WEEK</span>
                <span className="text-lg font-bold text-indigo-700">{workLogMetrics.currentWeekHours} hrs</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">AVG / DAY</span>
                <span className="text-lg font-bold text-slate-800">{workLogMetrics.avgHoursPerDay} hrs</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">LOG ENTRIES</span>
                <span className="text-lg font-bold text-slate-800">{workLogMetrics.loggedDays}</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4 flex justify-end">
            <Link to="/student/work-logs">
              <Button variant="outline" size="sm">
                View Work Logs <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      {/* 5. Attendance Calendar & History */}
      <AttendanceCalendar records={history} />
      <AttendanceHistory records={history} />
    </div>
  );
};