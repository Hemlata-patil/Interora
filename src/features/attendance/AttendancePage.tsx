import React, { useState, useMemo, useEffect } from 'react';
import { PageHeader, Card, Badge, Button } from '@/components';
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
import { CheckSquare, FileText, LogIn, LogOut, CheckCircle2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/services/supabase/supabaseClient';
import { fetchStudentAttendanceBackend, createAttendanceRecordBackend } from '@/services/api/backendService';

export const AttendancePage: React.FC = () => {
  const activeInternship = mockActiveInternshipData;

  const [history, setHistory] = useState<AttendanceRecord[]>(mockAttendanceHistory);
  const [todayState, setTodayState] = useState<'not_checked_in' | 'checked_in' | 'completed'>('not_checked_in');
  const [checkInTime, setCheckInTime] = useState<string | null>(null);
  const [checkOutTime, setCheckOutTime] = useState<string | null>(null);

  const loadAttendance = async () => {
    const remoteRecords = await fetchStudentAttendanceBackend();
    if (remoteRecords.length > 0) {
      const mapped: AttendanceRecord[] = remoteRecords.map((r) => {
        const d = new Date(r.attendanceDate);
        return {
          id: r.id,
          date: r.attendanceDate,
          day: d.toLocaleDateString('en-US', { weekday: 'short' }),
          status: r.status as any,
          checkIn: r.checkInTime ? new Date(r.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '09:00 AM',
          checkOut: r.checkOutTime ? new Date(r.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '05:00 PM',
          workingHours: '8.0 hrs',
          notes: 'Standard Working Shift',
          location: 'Office / Remote',
        };
      });
      setHistory(mapped);
    }
  };

  useEffect(() => {
    loadAttendance();

    // Subscribe to Realtime postgres changes on attendance_records table
    const channel = supabase
      .channel('attendance_records_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'attendance_records' },
        () => {
          loadAttendance();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleCheckIn = async () => {
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setCheckInTime(timeNow);
    setTodayState('checked_in');
    await createAttendanceRecordBackend('present');
    await loadAttendance();
  };

  const handleCheckOut = () => {
    const timeOut = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setCheckOutTime(timeOut);
    setTodayState('completed');
  };

  const attendanceMetrics = useMemo(() => calculateAttendanceMetrics(history), [history]);

  const taskMetrics = useMemo(() => {
    const total = initialMockTasks.length;
    const inProgress = initialMockTasks.filter((t) => t.status === 'In Progress').length;
    const completed = initialMockTasks.filter((t) => t.status === 'Completed').length;
    const pendingBlocked = initialMockTasks.filter((t) => t.status === 'To Do' || t.status === 'Blocked').length;
    return { total, inProgress, completed, pendingBlocked };
  }, []);

  const workLogMetrics = useMemo(() => {
    const totalHours = initialMockWorkLogs.reduce((acc, curr) => acc + curr.hoursWorked, 0);
    const loggedDays = initialMockWorkLogs.length;
    const currentWeekHours = initialMockWorkLogs.slice(0, 5).reduce((acc, curr) => acc + curr.hoursWorked, 0);
    const avgHoursPerDay = loggedDays > 0 ? (totalHours / loggedDays).toFixed(1) : '0';

    return { totalHours, currentWeekHours, avgHoursPerDay, loggedDays };
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance & Check-in Tracker"
        description="Log daily check-ins, verify shift hours, and monitor cumulative internship attendance compliance."
      />

      <Card className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 text-white p-6 rounded-2xl border-none shadow-md">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Badge variant="emerald">ACTIVE ENROLLMENT</Badge>
              <span className="text-xs text-indigo-200">ID: {activeInternship.internshipId}</span>
            </div>
            <h2 className="text-xl font-bold text-white">{activeInternship.internshipTitle}</h2>
            <p className="text-xs text-indigo-200">{activeInternship.companyName} • Mentor: {activeInternship.mentorName}</p>
          </div>

          <div className="flex items-center space-x-4 bg-white/10 p-3 rounded-xl backdrop-blur-xs border border-white/10 shrink-0">
            <div className="text-center">
              <span className="text-[10px] text-indigo-200 uppercase font-semibold block">CUMULATIVE ATTENDANCE</span>
              <span className="text-xl font-extrabold text-emerald-400">{attendanceMetrics.attendancePercentage}%</span>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-center">
              <span className="text-[10px] text-indigo-200 uppercase font-semibold block">COMPLIANCE STATUS</span>
              <span className="font-bold text-emerald-600 text-xs">{attendanceMetrics.healthStatus}</span>
            </div>
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Attendance Tracking</h3>
          <Badge variant="emerald">Rate: {attendanceMetrics.attendancePercentage}%</Badge>
        </div>

        <AttendanceSummary metrics={attendanceMetrics} />

        <Card title="Today's Attendance Action" subtitle={new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}>
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
                <span>•</span>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

      <AttendanceCalendar records={history} />
      <AttendanceHistory records={history} />
    </div>
  );
};
