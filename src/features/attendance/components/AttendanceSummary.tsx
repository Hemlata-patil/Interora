import React from 'react';
import { StatCard, Card, Badge } from '@/components';
import { CheckSquare, Calendar, AlertCircle, Clock, Sparkles } from 'lucide-react';
import type { AttendanceMetrics } from '../data/mockAttendance';

export interface AttendanceSummaryProps {
  metrics: AttendanceMetrics;
}

export const AttendanceSummary: React.FC<AttendanceSummaryProps> = ({ metrics }) => {
  const getHealthBadge = (status: AttendanceMetrics['healthStatus']) => {
    switch (status) {
      case 'Excellent':
        return <Badge variant="emerald">Excellent Health (90%+)</Badge>;
      case 'Good':
        return <Badge variant="indigo">Good Health (75-89%)</Badge>;
      default:
        return <Badge variant="rose">Needs Attention (&lt;75%)</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Attendance Rate"
          value={`${metrics.attendancePercentage}%`}
          icon={CheckSquare}
          trend={{ value: `${metrics.healthStatus} Status`, isPositive: metrics.attendancePercentage >= 75 }}
        />
        <StatCard
          title="Present Days"
          value={metrics.presentDays}
          icon={Calendar}
          description={`Out of ${metrics.totalWorkingDays} working days`}
        />
        <StatCard
          title="Late Arrivals"
          value={metrics.lateDays}
          icon={Clock}
          description="Within grace period"
        />
        <StatCard
          title="Absent Days"
          value={metrics.absentDays}
          icon={AlertCircle}
          description="Unexcused / Leave"
        />
      </div>
    </div>
  );
};