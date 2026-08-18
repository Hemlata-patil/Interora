export type AttendanceDayStatus = 'present' | 'absent' | 'late' | 'weekend';

export interface AttendanceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  day: string; // e.g. Mon, Tue
  status: AttendanceDayStatus;
  checkIn: string; // e.g. 09:00 AM or '-'
  checkOut: string; // e.g. 05:30 PM or '-'
  workingHours: string; // e.g. 8h 30m or '-'
}

export const mockAttendanceHistory: AttendanceRecord[] = [
  { id: 'att_01', date: '2026-08-03', day: 'Mon', status: 'present', checkIn: '09:02 AM', checkOut: '05:30 PM', workingHours: '8h 28m' },
  { id: 'att_02', date: '2026-08-04', day: 'Tue', status: 'present', checkIn: '08:55 AM', checkOut: '05:40 PM', workingHours: '8h 45m' },
  { id: 'att_03', date: '2026-08-05', day: 'Wed', status: 'late', checkIn: '09:35 AM', checkOut: '05:45 PM', workingHours: '8h 10m' },
  { id: 'att_04', date: '2026-08-06', day: 'Thu', status: 'present', checkIn: '09:00 AM', checkOut: '05:30 PM', workingHours: '8h 30m' },
  { id: 'att_05', date: '2026-08-07', day: 'Fri', status: 'present', checkIn: '08:58 AM', checkOut: '05:32 PM', workingHours: '8h 34m' },
  { id: 'att_06', date: '2026-08-08', day: 'Sat', status: 'weekend', checkIn: '-', checkOut: '-', workingHours: '-' },
  { id: 'att_07', date: '2026-08-09', day: 'Sun', status: 'weekend', checkIn: '-', checkOut: '-', workingHours: '-' },
  { id: 'att_08', date: '2026-08-10', day: 'Mon', status: 'present', checkIn: '08:50 AM', checkOut: '05:30 PM', workingHours: '8h 40m' },
  { id: 'att_09', date: '2026-08-11', day: 'Tue', status: 'present', checkIn: '09:01 AM', checkOut: '05:35 PM', workingHours: '8h 34m' },
  { id: 'att_10', date: '2026-08-12', day: 'Wed', status: 'absent', checkIn: '-', checkOut: '-', workingHours: '-' },
  { id: 'att_11', date: '2026-08-13', day: 'Thu', status: 'present', checkIn: '08:59 AM', checkOut: '05:31 PM', workingHours: '8h 32m' },
  { id: 'att_12', date: '2026-08-14', day: 'Fri', status: 'present', checkIn: '09:05 AM', checkOut: '05:30 PM', workingHours: '8h 25m' },
];

export interface AttendanceMetrics {
  totalWorkingDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  attendancePercentage: number;
  healthStatus: 'Excellent' | 'Good' | 'Needs Attention';
}

export const calculateAttendanceMetrics = (records: AttendanceRecord[]): AttendanceMetrics => {
  const workingRecords = records.filter((r) => r.status !== 'weekend');
  const totalWorkingDays = workingRecords.length;
  const presentDays = workingRecords.filter((r) => r.status === 'present').length;
  const lateDays = workingRecords.filter((r) => r.status === 'late').length;
  const absentDays = workingRecords.filter((r) => r.status === 'absent').length;

  // Present + Late counts towards valid attendance
  const effectivePresent = presentDays + lateDays;
  const attendancePercentage = totalWorkingDays > 0 ? Math.round((effectivePresent / totalWorkingDays) * 100) : 0;

  let healthStatus: 'Excellent' | 'Good' | 'Needs Attention' = 'Needs Attention';
  if (attendancePercentage >= 90) {
    healthStatus = 'Excellent';
  } else if (attendancePercentage >= 75) {
    healthStatus = 'Good';
  }

  return {
    totalWorkingDays,
    presentDays,
    absentDays,
    lateDays,
    attendancePercentage,
    healthStatus,
  };
};