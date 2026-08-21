import React, { useState } from 'react';
import { PageHeader, Card, Badge, Button } from '@/components';
import { mockAttendanceHistory, calculateAttendanceMetrics } from './data/mockAttendance';
import type { InternshipMode, StudentInternshipStatus } from '@/features/student/types/studentJourneyTypes';
import { getStudentFeatureAvailability } from '@/features/student/utils/studentJourneyUtils';
import { RestrictedFeatureGuard } from '@/features/student/components/RestrictedFeatureGuard';
import { mockActiveInternshipsList } from '@/features/internships/data/mockActiveInternship';
import { MapPin, Wifi, Building2, CheckCircle2, Clock, Calendar } from 'lucide-react';

export const AttendancePage: React.FC = () => {
  const [studentStatus] = useState<StudentInternshipStatus>('ACTIVE'); // Dynamic student lifecycle state
  const permissions = getStudentFeatureAvailability(studentStatus);

  const [selectedInternshipId, setSelectedInternshipId] = useState<string>(mockActiveInternshipsList[0].id);
  const activeInternship = mockActiveInternshipsList.find((i) => i.id === selectedInternshipId) || mockActiveInternshipsList[0];
  const [internshipMode, setInternshipMode] = useState<InternshipMode>(activeInternship.workMode.toUpperCase() as any || 'HYBRID');

  const metrics = calculateAttendanceMetrics(mockAttendanceHistory);

  if (!permissions.canAccessAttendance) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Student Productivity & Attendance"
          description="Verify daily check-ins, venue check-outs, and online work session logs."
        />
        <RestrictedFeatureGuard title="Attendance Tracking Unavailable" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Productivity & Attendance"
        description="Verify daily check-ins, venue check-outs, and online work session logs."
        action={
          <Badge variant="emerald" className="px-3 py-1 text-xs font-semibold">
            {metrics.attendancePercentage}% Verified Attendance
          </Badge>
        }
      />

      {/* Multi-Internship Attendance Selector */}
      {mockActiveInternshipsList.length > 1 && (
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
          <span className="text-slate-600 font-medium">Selected Internship Context:</span>
          <select
            value={selectedInternshipId}
            onChange={(e) => {
              setSelectedInternshipId(e.target.value);
              const selected = mockActiveInternshipsList.find((i) => i.id === e.target.value);
              if (selected) {
                setInternshipMode(selected.workMode.toUpperCase() as any);
              }
            }}
            className="p-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500"
          >
            {mockActiveInternshipsList.map((item) => (
              <option key={item.id} value={item.id}>
                {item.companyName} ({item.workMode})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Mode Selector Tabs */}
      <div className="flex border-b border-slate-200 text-xs font-bold">
        <button
          onClick={() => setInternshipMode('HYBRID')}
          className={`py-2.5 px-4 border-b-2 cursor-pointer transition-all ${
            internshipMode === 'HYBRID' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Hybrid Mode (Online & Venue)
        </button>
        <button
          onClick={() => setInternshipMode('OFFLINE')}
          className={`py-2.5 px-4 border-b-2 cursor-pointer transition-all ${
            internshipMode === 'OFFLINE' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Offline Venue Mode
        </button>
        <button
          onClick={() => setInternshipMode('ONLINE')}
          className={`py-2.5 px-4 border-b-2 cursor-pointer transition-all ${
            internshipMode === 'ONLINE' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Online Remote Mode
        </button>
      </div>

      {/* Active Attendance Verification Box */}
      <Card title="Today's Attendance Verification" subtitle={`Active Internship: ${activeInternship.companyName} (${internshipMode})`}>
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(internshipMode === 'OFFLINE' || internshipMode === 'HYBRID') && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center space-x-2 text-slate-800 font-bold">
                  <Building2 className="w-4 h-4 text-indigo-600" />
                  <span>Venue Check-In Status</span>
                </div>
                <p className="text-slate-500 text-[11px]">{activeInternship.companyName} HQ â€¢ Office Location</p>
                <Badge variant="emerald">Checked In at 09:14 AM</Badge>
              </div>
            )}

            {(internshipMode === 'ONLINE' || internshipMode === 'HYBRID') && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center space-x-2 text-slate-800 font-bold">
                  <Wifi className="w-4 h-4 text-indigo-600" />
                  <span>Online Remote Work Session</span>
                </div>
                <p className="text-slate-500 text-[11px]">Logged in via Dev Workstation</p>
                <Badge variant="indigo">Session Active (4h 12m)</Badge>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};
