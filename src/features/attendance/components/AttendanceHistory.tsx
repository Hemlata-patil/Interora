import React from 'react';
import { Card, Badge, Table } from '@/components';
import type { AttendanceRecord } from '../data/mockAttendance';

export interface AttendanceHistoryProps {
  records: AttendanceRecord[];
}

export const AttendanceHistory: React.FC<AttendanceHistoryProps> = ({ records }) => {
  const getStatusBadge = (status: AttendanceRecord['status']) => {
    switch (status) {
      case 'present':
        return <Badge variant="emerald">Present</Badge>;
      case 'late':
        return <Badge variant="amber">Late</Badge>;
      case 'absent':
        return <Badge variant="rose">Absent</Badge>;
      case 'weekend':
        return <Badge variant="neutral">Weekend</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const columns = [
    { key: 'date', header: 'Date', render: (r: AttendanceRecord) => <span className="font-semibold text-slate-800 text-xs">{r.date}</span> },
    { key: 'day', header: 'Day', render: (r: AttendanceRecord) => <span className="text-slate-600 text-xs">{r.day}</span> },
    { key: 'status', header: 'Status', render: (r: AttendanceRecord) => getStatusBadge(r.status) },
    { key: 'checkIn', header: 'Check In', render: (r: AttendanceRecord) => <span className="text-slate-700 text-xs font-mono">{r.checkIn}</span> },
    { key: 'checkOut', header: 'Check Out', render: (r: AttendanceRecord) => <span className="text-slate-700 text-xs font-mono">{r.checkOut}</span> },
    { key: 'workingHours', header: 'Working Hours', render: (r: AttendanceRecord) => <span className="text-slate-800 font-medium text-xs">{r.workingHours}</span> },
  ];

  return (
    <Card title="Attendance History Logs" subtitle="Detailed daily check-in and check-out timestamps">
      <div className="overflow-x-auto">
        <Table columns={columns} data={records} keyExtractor={(r) => r.id} />
      </div>
    </Card>
  );
};