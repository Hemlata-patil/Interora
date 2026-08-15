import React, { useState, useMemo } from 'react';
import { PageHeader, Card, Badge, Button, EmptyState } from '@/components';
import { mockActiveInternshipData } from '@/features/internships/data/mockActiveInternship';
import {
  mockAttendanceHistory,
  calculateAttendanceMetrics,
  type AttendanceRecord,
  type AttendanceDayStatus,
} from './data/mockAttendance';
import { AttendanceSummary } from './components/AttendanceSummary';
import { AttendanceCalendar } from './components/AttendanceCalendar';
import { AttendanceHistory } from './components/AttendanceHistory';
import { Compass, Clock, LogIn, LogOut, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AttendancePage: React.FC = () => {
  const activeInternship = mockActiveInternshipData; // Active enrollment

  const [history, setHistory] = useState<AttendanceRecord[]>(mockAttendanceHistory);
  const [todayState, setTodayState] = useState<'not_checked_in' | 'checked_in' | 'completed'>('not_checked_in');
  const [checkInTime, setCheckInTime] = useState<string | null>(null);
  const [checkOutTime, setCheckOutTime] = useState<string | null>(null);

  const metrics = useMemo(() => calculateAttendanceMetrics(history), [history]);

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
          title="Attendance & Work Logs"
          description="Track your attendance throughout your active internship."
        />
        <EmptyState
          icon={<Compass className="w-6 h-6 text-slate-400" />}
          title="No Active Internship Yet"
          description="You don't have an active internship yet. Browse verified opportunities to get started."
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

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <PageHeader
        title="Attendance & Daily Logs"
        description="Track your daily check-in timestamps, monthly attendance rate, and health metrics."
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
              <span className="font-bold text-indigo-600 text-sm">{metrics.attendancePercentage}%</span>
            </div>
            <div className="h-6 w-px bg-slate-200"></div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-semibold">HEALTH STATUS</span>
              <span className="font-bold text-emerald-600 text-xs">{metrics.healthStatus}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* 3. Summary Stat Cards */}
      <AttendanceSummary metrics={metrics} />

      {/* 4. Today's Attendance Check-in Widget */}
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

      {/* 5. Attendance Calendar & History */}
      <AttendanceCalendar records={history} />
      <AttendanceHistory records={history} />
    </div>
  );
};