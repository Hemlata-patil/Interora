import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { PageHeader, Card, Button, Badge, StatCard, Input } from '@/components';
import { 
  Clock, CheckCircle2, AlertCircle, Calendar, Search, Filter, 
  MapPin, UserCheck, UserX, Loader2, Edit3, X 
} from 'lucide-react';
import { 
  fetchCompanyAttendanceBackend,
  updateCompanyAttendanceRecordBackend,
  fetchCompanyInternsBackend 
} from '@/services/api/backendService';

export interface CompanyAttendanceItem {
  id: string;
  assignmentId: string;
  studentName: string;
  studentRollNumber?: string;
  internshipTitle: string;
  attendanceDate: string;
  status: 'present' | 'absent' | 'late' | 'half_day' | 'leave';
  checkInTime?: string;
  checkOutTime?: string;
  workingHours?: number | string;
  geoVerified?: boolean;
  locationAddress?: string;
  checkInPhotoUrl?: string;
}

export const CompanyAttendance: React.FC = () => {
  const [records, setRecords] = useState<CompanyAttendanceItem[]>([]);
  const [interns, setInterns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedRecord, setSelectedRecord] = useState<CompanyAttendanceItem | null>(null);
  const [editStatus, setEditStatus] = useState<string>('present');
  const [editHours, setEditHours] = useState<string>('8.0');
  const [actionLoading, setActionLoading] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [backendRecords, backendInterns] = await Promise.all([
        fetchCompanyAttendanceBackend(),
        fetchCompanyInternsBackend(),
      ]);

      if (backendRecords && backendRecords.length > 0) {
        const mapped: CompanyAttendanceItem[] = backendRecords.map((r: any) => ({
          id: r.id,
          assignmentId: r.assignmentId,
          studentName: r.assignment?.student?.profile?.fullName || 'Assigned Intern',
          studentRollNumber: r.assignment?.student?.studentId || '',
          internshipTitle: r.assignment?.internship?.title || 'Internship Program',
          attendanceDate: r.attendanceDate ? new Date(r.attendanceDate).toISOString().split('T')[0] : '',
          status: r.status,
          checkInTime: r.checkInTime ? new Date(r.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined,
          checkOutTime: r.checkOutTime ? new Date(r.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined,
          workingHours: r.workingHours ? Number(r.workingHours) : undefined,
          geoVerified: r.geoVerified,
          locationAddress: r.checkInAddress || r.checkOutAddress || 'Office Premises',
          checkInPhotoUrl: r.checkInPhotoUrl,
        }));
        setRecords(mapped);
      } else {
        setRecords([]);
      }

      if (backendInterns) {
        setInterns(backendInterns);
      }
    } catch (err: any) {
      console.error('[CompanyAttendance] Error loading attendance:', err);
      setError('Failed to load company attendance records.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const matchesSearch = 
        r.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.internshipTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.attendanceDate.includes(searchTerm);
      
      const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [records, searchTerm, statusFilter]);

  // Metrics
  const totalCount = records.length;
  const presentCount = records.filter(r => r.status === 'present').length;
  const lateCount = records.filter(r => r.status === 'late').length;
  const absentCount = records.filter(r => r.status === 'absent' || r.status === 'leave').length;

  const handleOpenEdit = (rec: CompanyAttendanceItem) => {
    setSelectedRecord(rec);
    setEditStatus(rec.status);
    setEditHours(rec.workingHours ? String(rec.workingHours) : '8.0');
  };

  const handleSaveEdit = async () => {
    if (!selectedRecord) return;
    setActionLoading(true);
    try {
      await updateCompanyAttendanceRecordBackend(selectedRecord.id, {
        status: editStatus,
        workingHours: parseFloat(editHours) || 8.0,
      });
      await loadData();
      setSelectedRecord(null);
    } catch (err: any) {
      alert(err.message || 'Failed to update attendance record.');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'present':
        return <Badge variant="emerald"><CheckCircle2 className="w-3 h-3 mr-1" /> Present</Badge>;
      case 'late':
        return <Badge variant="amber"><Clock className="w-3 h-3 mr-1" /> Late</Badge>;
      case 'half_day':
        return <Badge variant="indigo"><Clock className="w-3 h-3 mr-1" /> Half Day</Badge>;
      case 'leave':
        return <Badge variant="neutral"><AlertCircle className="w-3 h-3 mr-1" /> On Leave</Badge>;
      case 'absent':
        return <Badge variant="rose"><UserX className="w-3 h-3 mr-1" /> Absent</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-8">
      <PageHeader
        title="Attendance Monitoring"
        description="Review daily check-ins, working hours, and verify student attendance records."
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total Logs" value={totalCount.toString()} icon={Calendar} />
        <StatCard title="Present" value={presentCount.toString()} icon={UserCheck} />
        <StatCard title="Late / Half-Day" value={lateCount.toString()} icon={Clock} />
        <StatCard title="Absent / Leave" value={absentCount.toString()} icon={UserX} />
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <Input
            placeholder="Search by student or date..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-slate-50 border-slate-200 text-sm"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="text-sm font-medium text-slate-700 mr-2">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="All">All Statuses</option>
            <option value="present">Present</option>
            <option value="late">Late</option>
            <option value="half_day">Half Day</option>
            <option value="leave">On Leave</option>
            <option value="absent">Absent</option>
          </select>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-500">
            <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading attendance records...
          </div>
        ) : error ? (
          <div className="p-8 text-center text-rose-600">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Intern Name</th>
                  <th className="py-3 px-4">Internship Program</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Check-In</th>
                  <th className="py-3 px-4">Check-Out</th>
                  <th className="py-3 px-4">Hours</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.length > 0 ? (
                  filteredRecords.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        {r.studentName}
                        {r.studentRollNumber && (
                          <span className="block text-xs text-slate-400 font-mono">{r.studentRollNumber}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 text-xs">
                        {r.internshipTitle}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 font-medium text-xs">
                        {r.attendanceDate}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 text-xs">
                        {r.checkInTime || '—'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 text-xs">
                        {r.checkOutTime || '—'}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs text-indigo-700 font-semibold">
                        {r.workingHours ? `${r.workingHours} hrs` : '—'}
                      </td>
                      <td className="py-3.5 px-4">
                        {getStatusBadge(r.status)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleOpenEdit(r)}
                          className="text-slate-600 hover:text-indigo-600"
                        >
                          <Edit3 className="w-4 h-4 mr-1" /> Adjust
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-500">
                      No attendance records found for this company.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Adjust Attendance Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <Card className="w-full max-w-md shadow-xl border-0 overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-slate-100">
              <h3 className="font-bold text-lg text-slate-900">Adjust Attendance</h3>
              <button onClick={() => setSelectedRecord(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5 space-y-4">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-sm">
                <p className="font-semibold text-slate-800">{selectedRecord.studentName}</p>
                <p className="text-xs text-slate-500">Date: {selectedRecord.attendanceDate} • {selectedRecord.internshipTitle}</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full text-sm border border-slate-200 rounded-lg p-2.5 bg-white"
                >
                  <option value="present">Present</option>
                  <option value="late">Late</option>
                  <option value="half_day">Half Day</option>
                  <option value="leave">On Leave</option>
                  <option value="absent">Absent</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Working Hours</label>
                <Input
                  type="number"
                  step="0.5"
                  value={editHours}
                  onChange={(e) => setEditHours(e.target.value)}
                  placeholder="8.0"
                />
              </div>
            </div>
            
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
              <Button variant="outline" onClick={() => setSelectedRecord(null)}>Cancel</Button>
              <Button onClick={handleSaveEdit} disabled={actionLoading}>
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Save Adjustments
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
