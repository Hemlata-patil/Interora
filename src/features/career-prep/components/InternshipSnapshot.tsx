import React from 'react';
import { Card, Badge } from '@/components';
import { mockActiveInternshipData } from '@/features/internships/data/mockActiveInternship';
import { mockAttendanceHistory, calculateAttendanceMetrics } from '@/features/attendance/data/mockAttendance';
import { initialMockTasks, initialMockWorkLogs } from '@/features/tasks/data/mockTasks';
import { Building2, Calendar, CheckSquare, Clock, ShieldCheck } from 'lucide-react';

export const InternshipSnapshot: React.FC = () => {
  const active = mockActiveInternshipData;
  const attendance = calculateAttendanceMetrics(mockAttendanceHistory);

  const totalTasks = initialMockTasks.length;
  const completedTasks = initialMockTasks.filter((t) => t.status === 'Completed').length;
  const totalHours = initialMockWorkLogs.reduce((acc, curr) => acc + curr.hoursWorked, 0);

  if (!active) return null;

  return (
    <Card title="Your Internship Snapshot" subtitle="Verified live activity metrics from your enrolled internship">
      <div className="space-y-4 text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2">
              <h4 className="font-bold text-slate-900 text-sm">{active.internshipTitle}</h4>
              <Badge variant="emerald">Active Enrollment</Badge>
            </div>
            <p className="text-indigo-600 font-semibold text-xs mt-0.5">{active.companyName}</p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="indigo">{active.workMode}</Badge>
            <Badge variant="neutral">{active.duration}</Badge>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">ATTENDANCE</span>
            <span className="text-sm font-bold text-emerald-600">{attendance.attendancePercentage}%</span>
          </div>
          <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">TASKS COMPLETED</span>
            <span className="text-sm font-bold text-slate-800">{`${completedTasks} / ${totalTasks}`}</span>
          </div>
          <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">HOURS LOGGED</span>
            <span className="text-sm font-bold text-indigo-600">{totalHours} hrs</span>
          </div>
          <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">CURRENT PHASE</span>
            <span className="text-xs font-bold text-slate-800 truncate block mt-0.5">{active.currentPhase}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};