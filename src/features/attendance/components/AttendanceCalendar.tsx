import React from 'react';
import { Card, Badge } from '@/components';
import type { AttendanceRecord } from '../data/mockAttendance';

export interface AttendanceCalendarProps {
  records: AttendanceRecord[];
}

export const AttendanceCalendar: React.FC<AttendanceCalendarProps> = ({ records }) => {
  const recordMap = new Map<string, AttendanceRecord>();
  records.forEach((r) => recordMap.set(r.date, r));

  // Calendar days grid for August 2026 (1 to 31)
  const totalDays = 31;
  const daysArray = Array.from({ length: totalDays }, (_, i) => {
    const dayNum = i + 1;
    const dateStr = `2026-08-${dayNum < 10 ? '0' + dayNum : dayNum}`;
    return {
      dayNum,
      dateStr,
      record: recordMap.get(dateStr),
    };
  });

  const getStatusColor = (status?: AttendanceRecord['status']) => {
    switch (status) {
      case 'present':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'late':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'absent':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'weekend':
        return 'bg-slate-100 text-slate-400 border-slate-200';
      default:
        return 'bg-white text-slate-500 border-slate-200';
    }
  };

  return (
    <Card title="August 2026 Attendance Calendar" subtitle="Visual record of daily attendance tracking">
      <div className="space-y-4">
        {/* Calendar Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded bg-emerald-500 inline-block"></span>
            <span className="text-slate-600 font-medium">Present</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded bg-amber-500 inline-block"></span>
            <span className="text-slate-600 font-medium">Late</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded bg-rose-500 inline-block"></span>
            <span className="text-slate-600 font-medium">Absent</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded bg-slate-300 inline-block"></span>
            <span className="text-slate-600 font-medium">Weekend / Off</span>
          </div>
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1.5 text-center text-xs">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <span key={day} className="font-semibold text-slate-400 py-1 text-[11px]">
              {day}
            </span>
          ))}

          {/* Padding offset for August 2026 (Starts on Saturday) */}
          <div className="p-2 border rounded-lg border-transparent"></div>
          <div className="p-2 border rounded-lg border-transparent"></div>
          <div className="p-2 border rounded-lg border-transparent"></div>
          <div className="p-2 border rounded-lg border-transparent"></div>
          <div className="p-2 border rounded-lg border-transparent"></div>
          <div className="p-2 border rounded-lg border-transparent"></div>

          {daysArray.map(({ dayNum, dateStr, record }) => {
            const isToday = dateStr === '2026-08-14';
            return (
              <div
                key={dayNum}
                className={`p-2 rounded-lg border flex flex-col items-center justify-between min-h-[50px] ${getStatusColor(
                  record?.status
                )} ${isToday ? 'ring-2 ring-indigo-600 ring-offset-1 font-bold' : ''}`}
              >
                <span className="text-[11px] font-semibold">{dayNum}</span>
                {record && (
                  <span className="text-[9px] uppercase font-bold tracking-wider">
                    {record.status}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};