import React, { useState } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Building2, Laptop, Briefcase, CheckCircle2, XCircle, Users } from 'lucide-react';
import { mockFacultyStudents } from './mockData';
import type { SharedStudentData, WorkMode } from './mockData';

export const AttendanceMonitoring: React.FC = () => {
  const [selectedStudent, setSelectedStudent] = useState<SharedStudentData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Derived statistics
  const totalStudents = mockFacultyStudents.length;
  
  let totalPresent = 0;
  let totalWorkingDays = 0;
  let goodCount = 0;
  let needsReviewCount = 0;
  let criticalCount = 0;

  const getAttendancePercentage = (student: SharedStudentData) => {
    return Math.round((student.attendance.present / student.attendance.workingDays) * 100);
  };

  mockFacultyStudents.forEach(student => {
    const p = student.attendance.present;
    const w = student.attendance.workingDays;
    totalPresent += p;
    totalWorkingDays += w;
    const pct = Math.round((p / w) * 100);
    
    if (pct >= 85) {
      goodCount++;
    } else if (pct >= 70) {
      needsReviewCount++;
    } else {
      criticalCount++;
    }
  });

  const overallAttendance = Math.round((totalPresent / totalWorkingDays) * 100);

  const getAttendanceColor = (pct: number) => {
    if (pct >= 85) return 'emerald';
    if (pct >= 70) return 'amber';
    return 'rose';
  };
  
  const getAttendanceStrokeClass = (pct: number) => {
    if (pct >= 85) return 'stroke-emerald-500';
    if (pct >= 70) return 'stroke-amber-500';
    return 'stroke-rose-500';
  };
  
  const getAttendanceTextClass = (pct: number) => {
    if (pct >= 85) return 'text-emerald-700';
    if (pct >= 70) return 'text-amber-700';
    return 'text-rose-700';
  };

  const getStatusBadge = (pct: number) => {
    if (pct >= 85) return <Badge variant="emerald">Good</Badge>;
    if (pct >= 70) return <Badge variant="amber">Needs Attention</Badge>;
    return <Badge variant="rose">Critical</Badge>;
  };

  const getWorkModeIcon = (mode: WorkMode) => {
    switch (mode) {
      case 'On-site': return <Building2 className="w-4 h-4 text-slate-500" />;
      case 'Remote': return <Laptop className="w-4 h-4 text-slate-500" />;
      case 'Hybrid': return <Briefcase className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <PageHeader
        title="Attendance Monitoring"
        description="Track attendance and engagement of your assigned interns"
      />

      {/* Main Overview Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Large Overview Card */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 shadow-sm p-8 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
          
          <h3 className="text-slate-500 font-semibold mb-6 uppercase tracking-widest text-xs">Overall Student Attendance</h3>
          
          <div className="relative w-40 h-40 flex items-center justify-center mb-4">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="16" fill="none" className="stroke-slate-100" strokeWidth="3" />
              <circle 
                cx="18" cy="18" r="16" fill="none" 
                className={`${getAttendanceStrokeClass(overallAttendance)} transition-all duration-1000 ease-out`}
                strokeWidth="3" 
                strokeDasharray="100" 
                strokeDashoffset={100 - overallAttendance} 
                strokeLinecap="round" 
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className={`text-4xl font-bold ${getAttendanceTextClass(overallAttendance)}`}>
                {overallAttendance}%
              </span>
            </div>
          </div>
          <p className="text-sm text-slate-500 text-center px-4">
            Average attendance across all your assigned interns this period.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 flex items-start space-x-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Total Interns</p>
              <p className="text-2xl font-bold text-slate-900">{totalStudents}</p>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl border border-slate-200 p-6 flex items-start space-x-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Good Attendance</p>
              <p className="text-2xl font-bold text-slate-900">{goodCount}</p>
              <p className="text-xs text-emerald-600 font-medium mt-1">Above 85%</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 flex items-start space-x-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Needs Attention</p>
              <p className="text-2xl font-bold text-slate-900">{needsReviewCount}</p>
              <p className="text-xs text-amber-600 font-medium mt-1">70% – 84%</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 flex items-start space-x-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
              <XCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Critical Review</p>
              <p className="text-2xl font-bold text-slate-900">{criticalCount}</p>
              <p className="text-xs text-rose-600 font-medium mt-1">Below 70%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-semibold text-slate-800">Student Attendance Directory</h3>
        </div>
        
        <Table 
          data={mockFacultyStudents}
          keyExtractor={(row) => row.id}
          columns={[
            {
              header: 'Student',
              cell: (row) => (
                <div className="flex items-center space-x-3 py-1">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm shrink-0">
                    {row.studentName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{row.studentName}</p>
                    <p className="text-xs text-slate-500">{row.email}</p>
                  </div>
                </div>
              )
            },
            {
              header: 'Company',
              cell: (row) => (
                <div>
                  <p className="text-sm text-slate-900">{row.company}</p>
                  <p className="text-xs text-slate-500">{row.role}</p>
                </div>
              )
            },
            {
              header: 'Work Mode',
              cell: (row) => (
                <div className="flex items-center space-x-2 bg-slate-50 px-2 py-1 rounded-md w-max">
                  {getWorkModeIcon(row.workMode)}
                  <span className="text-sm text-slate-700 font-medium">{row.workMode}</span>
                </div>
              )
            },
            {
              header: 'Attendance',
              cell: (row) => {
                const pct = getAttendancePercentage(row);
                return (
                  <div className="flex items-center space-x-3">
                    <div className="relative flex items-center justify-center w-8 h-8 shrink-0">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="16" fill="none" className="stroke-slate-100" strokeWidth="4" />
                        <circle 
                          cx="18" cy="18" r="16" fill="none" 
                          className={getAttendanceStrokeClass(pct)}
                          strokeWidth="4" 
                          strokeDasharray="100" 
                          strokeDashoffset={100 - pct} 
                          strokeLinecap="round" 
                        />
                      </svg>
                    </div>
                    <div>
                      <p className={`text-sm font-bold ${getAttendanceTextClass(pct)}`}>{pct}%</p>
                      <p className="text-xs text-slate-400">{row.attendance.present}/{row.attendance.workingDays} days</p>
                    </div>
                  </div>
                );
              }
            },
            {
              header: 'Status',
              cell: (row) => getStatusBadge(getAttendancePercentage(row))
            },
            {
              header: 'Action',
              cell: (row) => (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setSelectedStudent(row);
                    setIsModalOpen(true);
                  }}
                >
                  View Details
                </Button>
              )
            }
          ]}
        />
      </div>

      {/* View Detail Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Student Attendance Details"
        description="Detailed breakdown of internship engagement"
        className="bg-indigo-50 border-indigo-100"
      >
        {selectedStudent && (() => {
          const pct = getAttendancePercentage(selectedStudent);
          return (
            <div className="space-y-6">
              {/* Context Header */}
              <div className="flex items-center space-x-3 mb-2 bg-white p-4 rounded-xl border border-indigo-100 shadow-sm">
                <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xl shrink-0 shadow-sm">
                  {selectedStudent.studentName.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 leading-tight">
                    {selectedStudent.studentName}
                  </h3>
                  <p className="text-sm text-slate-600 font-medium mt-0.5">
                    {selectedStudent.role} <span className="mx-1">•</span> {selectedStudent.company}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white border border-indigo-100 rounded-xl p-5 flex flex-col items-center justify-center relative overflow-hidden shadow-sm">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Circular Attendance</p>
                  <div className="relative w-28 h-28 flex items-center justify-center mb-2">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="16" fill="none" className="stroke-slate-100" strokeWidth="3" />
                      <circle 
                        cx="18" cy="18" r="16" fill="none" 
                        className={getAttendanceStrokeClass(pct)}
                        strokeWidth="3" 
                        strokeDasharray="100" 
                        strokeDashoffset={100 - pct} 
                        strokeLinecap="round" 
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center">
                      <span className={`text-2xl font-bold ${getAttendanceTextClass(pct)}`}>
                        {pct}%
                      </span>
                    </div>
                  </div>
                  {getStatusBadge(pct)}
                </div>

                <div className="bg-white border border-indigo-100 rounded-xl p-5 space-y-4 shadow-sm">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Statistics</p>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-600">Present</span>
                        <span className="font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">{selectedStudent.attendance.present}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-600">Absent</span>
                        <span className="font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">{selectedStudent.attendance.absent}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm pt-2 border-t border-slate-100">
                        <span className="text-slate-700 font-medium">Working Days</span>
                        <span className="font-semibold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">{selectedStudent.attendance.workingDays}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t border-slate-100">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Work Mode</p>
                    <div className="flex items-center space-x-2 text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg w-max font-medium text-sm">
                      {getWorkModeIcon(selectedStudent.workMode)}
                      <span>{selectedStudent.workMode}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Attendance */}
              <div className="bg-white border border-indigo-100 rounded-xl p-5 shadow-sm">
                 <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Recent Attendance</p>
                 <div className="space-y-3">
                   {selectedStudent.attendance.recent.map((record, i) => (
                     <div key={i} className="flex justify-between items-center bg-indigo-50/50 p-3 rounded-lg border border-indigo-100 shadow-sm">
                       <span className="text-sm font-medium text-slate-700">{record.date}</span>
                       <span className={`text-sm font-semibold flex items-center space-x-1.5 ${record.status === 'Present' ? 'text-emerald-600' : 'text-rose-600'}`}>
                         {record.status === 'Present' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                         <span>{record.status}</span>
                       </span>
                     </div>
                   ))}
                 </div>
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
};
