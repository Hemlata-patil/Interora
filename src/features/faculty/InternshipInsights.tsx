import React, { useState, useMemo } from 'react';
import { 
  PageHeader, 
  StatCard, 
  Table, 
  Badge, 
  Button, 
  Modal,
  ProgressBar
} from '@/components';
import { mockFacultyStudents } from './mockData';
import type { SharedStudentData, InternshipStatus } from './mockData';
import { 
  TrendingUp, 
  Calendar, 
  Briefcase, 
  AlertTriangle, 
  CheckCircle2,
  Users
} from 'lucide-react';
import type { Column } from '@/components/ui/Table';

// Simple transparent rule-based logic for Risk
const getRiskFactors = (student: SharedStudentData): string[] => {
  const factors: string[] = [];
  const attendancePct = Math.round((student.attendance.present / student.attendance.workingDays) * 100);
  
  if (attendancePct < 75) {
    factors.push('Low attendance');
  }

  // Only consider progress risk if they are actively in the internship
  if ((student.internshipStatus === 'Active' || student.internshipStatus === 'At Risk') && student.progressPercentage < 40) {
    factors.push('Low progress');
  }

  // Check recent activity, ignoring completed or not started internships
  if (student.internshipStatus !== 'Completed' && student.internshipStatus !== 'Not Started') {
    if (student.lastActivity.includes('days') || student.lastActivity.includes('month') || student.lastActivity === 'Never') {
      factors.push('Low recent activity');
    }
  }

  if (student.riskIndicator !== 'None' && !factors.includes(student.riskIndicator)) {
    factors.push(student.riskIndicator);
  }

  return factors;
};

const getRiskLevel = (factors: string[]): 'On Track' | 'Needs Attention' | 'High Risk' => {
  if (factors.length === 0) return 'On Track';
  if (factors.length === 1) return 'Needs Attention';
  return 'High Risk';
};

export const InternshipInsights: React.FC = () => {
  const [allStudents] = useState<SharedStudentData[]>(mockFacultyStudents);

  // Reusing the AssignedStudents View Details flow modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<SharedStudentData | null>(null);
  const [activeTab, setActiveTab] = useState<'student' | 'internship'>('student');

  // Dynamic calculations
  const totalStudents = allStudents.length;
  const activeInternships = allStudents.filter(s => s.internshipStatus === 'Active' || s.internshipStatus === 'At Risk').length;
  
  let totalProgress = 0;
  let totalAttendance = 0;
  let progressCount = 0;
  
  const studentHealthData = useMemo(() => {
    return allStudents.map(student => {
      const factors = getRiskFactors(student);
      const riskLevel = getRiskLevel(factors);
      const attendancePct = Math.round((student.attendance.present / student.attendance.workingDays) * 100);
      
      return {
        ...student,
        riskFactors: factors,
        riskLevel,
        attendancePct
      };
    });
  }, [allStudents]);

  studentHealthData.forEach(s => {
    totalAttendance += s.attendancePct;
    if (s.internshipStatus !== 'Not Started') {
      totalProgress += s.progressPercentage;
      progressCount++;
    }
  });

  const averageAttendance = totalStudents > 0 ? Math.round(totalAttendance / totalStudents) : 0;
  const averageProgress = progressCount > 0 ? Math.round(totalProgress / progressCount) : 0;
  
  const studentsNeedingAttention = studentHealthData.filter(s => s.riskLevel !== 'On Track');
  const studentsAtRiskCount = studentHealthData.filter(s => s.riskLevel === 'High Risk').length;

  const healthyStudentsCount = studentHealthData.filter(s => s.riskLevel === 'On Track').length;
  const needsAttentionCount = studentHealthData.filter(s => s.riskLevel === 'Needs Attention').length;
  
  const overallHealthPct = totalStudents > 0 ? Math.round((healthyStudentsCount / totalStudents) * 100) : 0;

  const handleViewDetails = (student: SharedStudentData) => {
    setSelectedStudent(student);
    setActiveTab('student');
    setIsModalOpen(true);
  };

  const getStatusBadgeVariant = (status: InternshipStatus) => {
    switch (status) {
      case 'Active': return 'indigo';
      case 'At Risk': return 'rose';
      case 'Completed': return 'emerald';
      default: return 'neutral';
    }
  };

  const columns: Column<typeof studentHealthData[0]>[] = [
    {
      header: 'Student',
      cell: (row) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
            {row.studentName.charAt(0)}
          </div>
          <div>
            <div className="font-medium text-slate-900">{row.studentName}</div>
            <div className="text-xs text-slate-500">{row.role}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Progress',
      className: 'min-w-[120px]',
      cell: (row) => (
        <ProgressBar 
          progress={row.progressPercentage} 
          showPercent={true}
          color={row.internshipStatus === 'Completed' ? 'emerald' : row.internshipStatus === 'At Risk' ? 'rose' : 'indigo'}
        />
      ),
    },
    {
      header: 'Attendance',
      cell: (row) => (
        <span className={`font-semibold ${row.attendancePct >= 75 ? 'text-emerald-600' : 'text-amber-600'}`}>
          {row.attendancePct}%
        </span>
      ),
    },
    {
      header: 'Last Activity',
      cell: (row) => <span className="text-sm text-slate-600">{row.lastActivity}</span>,
    },
    {
      header: 'Risk Level',
      cell: (row) => {
        let dotColor = 'bg-emerald-500';
        let textColor = 'text-emerald-700';
        if (row.riskLevel === 'Needs Attention') {
          dotColor = 'bg-amber-500';
          textColor = 'text-amber-700';
        } else if (row.riskLevel === 'High Risk') {
          dotColor = 'bg-rose-500';
          textColor = 'text-rose-700';
        }
        
        return (
          <div className={`flex items-center space-x-1.5 font-medium text-sm ${textColor}`}>
            <span className={`w-2 h-2 rounded-full ${dotColor}`}></span>
            <span>{row.riskLevel}</span>
          </div>
        );
      },
    },
    {
      header: 'Action',
      cell: (row) => (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => handleViewDetails(row)}
          className="text-indigo-600 border-indigo-200 hover:bg-indigo-50"
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Internship Insights & Risk"
          description="Monitor internship progress and identify students who may need attention."
        />
        <div className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 shadow-sm">
          <Calendar className="w-4 h-4 text-indigo-500" />
          <span>This Semester (Jan - May 2025)</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Overall Health Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col">
          <h3 className="font-semibold text-slate-900 text-center mb-6">Overall Internship Health</h3>
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="relative w-40 h-40 flex items-center justify-center mb-8">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                {/* Background track */}
                <circle cx="18" cy="18" r="16" fill="none" className="stroke-slate-100" strokeWidth="4" />
                
                {/* Needs Attention Segment (Amber) - Bottom Left */}
                {needsAttentionCount > 0 && (
                  <circle 
                    cx="18" cy="18" r="16" fill="none" 
                    className="stroke-amber-500" 
                    strokeWidth="4" 
                    strokeDasharray={`${(needsAttentionCount / totalStudents) * 100} 100`}
                    strokeDashoffset={0} 
                  />
                )}
                
                {/* High Risk Segment (Rose) - Bottom Right */}
                {studentsAtRiskCount > 0 && (
                  <circle 
                    cx="18" cy="18" r="16" fill="none" 
                    className="stroke-rose-500" 
                    strokeWidth="4" 
                    strokeDasharray={`${(studentsAtRiskCount / totalStudents) * 100} 100`}
                    strokeDashoffset={-(needsAttentionCount / totalStudents) * 100} 
                  />
                )}

                {/* Healthy Segment (Emerald) - Top half + */}
                {healthyStudentsCount > 0 && (
                  <circle 
                    cx="18" cy="18" r="16" fill="none" 
                    className="stroke-emerald-500" 
                    strokeWidth="4" 
                    strokeDasharray={`${(healthyStudentsCount / totalStudents) * 100} 100`}
                    strokeDashoffset={-((needsAttentionCount + studentsAtRiskCount) / totalStudents) * 100} 
                    strokeLinecap="round"
                  />
                )}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-slate-900">{overallHealthPct}%</span>
                <span className="text-sm font-medium text-slate-500">{overallHealthPct >= 50 ? 'Healthy' : 'At Risk'}</span>
              </div>
            </div>

            <div className="w-full flex justify-between px-4">
              <div className="flex flex-col items-center">
                <div className="flex items-center space-x-1 mb-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                  <span className="text-lg font-bold text-slate-900">{healthyStudentsCount}</span>
                </div>
                <span className="text-xs text-slate-500">On Track</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="flex items-center space-x-1 mb-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                  <span className="text-lg font-bold text-slate-900">{needsAttentionCount}</span>
                </div>
                <span className="text-xs text-slate-500">Needs Attention</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="flex items-center space-x-1 mb-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
                  <span className="text-lg font-bold text-slate-900">{studentsAtRiskCount}</span>
                </div>
                <span className="text-xs text-slate-500">At Risk</span>
              </div>
            </div>
            
            <div className="mt-8 pt-4 border-t border-slate-100 w-full flex items-center justify-center space-x-2 text-indigo-700 font-medium">
              <Users className="w-5 h-5" />
              <span>{totalStudents} Assigned Students</span>
            </div>
          </div>
        </div>

        {/* Key Metrics & At Risk Students */}
        <div className="col-span-1 lg:col-span-2 flex flex-col space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
              title="Average Progress" 
              value={`${averageProgress}%`} 
              icon={TrendingUp} 
              trend={{ value: 'Across active', isPositive: true }}
            />
            <StatCard 
              title="Average Attendance" 
              value={`${averageAttendance}%`} 
              icon={Calendar} 
              trend={{ value: 'Past month', isPositive: true }}
            />
            <StatCard 
              title="Active Internships" 
              value={activeInternships} 
              icon={Briefcase} 
            />
            <StatCard 
              title="Students At Risk" 
              value={studentsAtRiskCount} 
              icon={AlertTriangle} 
              trend={{ value: 'Requires review', isPositive: false }}
            />
          </div>

          <div className="flex-1 flex gap-6">
            {studentsNeedingAttention.map((student) => (
              <div key={student.id} className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col">
                <div className="flex items-center space-x-2 text-sm font-semibold mb-4">
                  <AlertTriangle className={`w-4 h-4 ${student.riskLevel === 'High Risk' ? 'text-rose-500' : 'text-amber-500'}`} />
                  <span className={student.riskLevel === 'High Risk' ? 'text-rose-600' : 'text-amber-600'}>
                    {student.riskLevel === 'High Risk' ? 'At Risk Student' : 'Students Needing Attention'}
                  </span>
                </div>

                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-lg shrink-0">
                    {student.studentName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{student.studentName}</h4>
                    <p className="text-xs text-slate-500">{student.role} • {student.company}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 mb-4">
                  <span className="text-xs text-slate-500 font-medium">Risk Level:</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                    student.riskLevel === 'High Risk' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {student.riskLevel}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 py-4 border-y border-slate-100 mb-4">
                  <div className="text-center">
                    <p className="text-lg font-bold text-slate-900">{student.attendancePct}%</p>
                    <p className="text-[10px] text-slate-500">Attendance</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-slate-900">{student.progressPercentage}%</p>
                    <p className="text-[10px] text-slate-500">Progress</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-slate-900 leading-tight mt-1 truncate px-1" title={student.lastActivity}>{student.lastActivity}</p>
                    <p className="text-[10px] text-slate-500">Last Activity</p>
                  </div>
                </div>

                <div className="flex-1">
                  <p className="text-xs font-semibold text-slate-900 mb-2">Risk Factors:</p>
                  <ul className="text-xs text-slate-600 space-y-1 list-disc pl-4 mb-4">
                    {student.riskFactors.map((factor, i) => (
                      <li key={i}>{factor}</li>
                    ))}
                  </ul>
                </div>

                <Button 
                  className={`w-full ${student.riskLevel === 'High Risk' ? 'bg-indigo-700 hover:bg-indigo-800' : 'bg-indigo-600 hover:bg-indigo-700'} text-white`} 
                  onClick={() => handleViewDetails(student)}
                >
                  View Details
                </Button>
              </div>
            ))}
            
            {studentsNeedingAttention.length === 0 && (
              <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 p-8 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-slate-900 text-lg mb-2">All Students On Track</h3>
                <p className="text-sm text-slate-500">No students currently require attention or are at risk.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <h3 className="font-bold text-slate-900">Student Health Overview</h3>
          </div>
          <div className="p-0">
            <Table 
              columns={columns} 
              data={studentHealthData} 
              keyExtractor={(row) => row.id} 
            />
          </div>
        </div>
        
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          <h3 className="font-bold text-slate-900 mb-6">Risk Factors</h3>
          
          <div className="space-y-6">
            <div className="flex gap-3">
              <div className="w-3 h-3 rounded-full bg-emerald-500 shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-emerald-700 text-sm mb-1">On Track</h4>
                <p className="text-xs text-slate-600 leading-relaxed">Healthy attendance, progress, and recent activity.</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="w-3 h-3 rounded-full bg-amber-500 shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-amber-700 text-sm mb-1">Needs Attention</h4>
                <p className="text-xs text-slate-600 leading-relaxed">One or more indicators require faculty attention.</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="w-3 h-3 rounded-full bg-rose-500 shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-rose-700 text-sm mb-1">High Risk</h4>
                <p className="text-xs text-slate-600 leading-relaxed">Multiple indicators are significantly below expected levels.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reuse Modal from AssignedStudents */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="View Details"
        description="Detailed view of the student and their internship progress."
        className="max-w-4xl"
      >
        {selectedStudent && (
          <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-sm">
                {selectedStudent.studentName.charAt(0)}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 leading-tight">
                  {selectedStudent.studentName}
                </h3>
                <p className="text-sm text-slate-500 font-medium">
                  {selectedStudent.role} <span className="mx-1">•</span> {selectedStudent.company}
                </p>
              </div>
            </div>

            <div className="flex border-b border-slate-200">
              <button 
                className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === 'student' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                onClick={() => setActiveTab('student')}
              >
                Student Details
              </button>
              <button 
                className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === 'internship' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                onClick={() => setActiveTab('internship')}
              >
                Internship Details
              </button>
            </div>

            {activeTab === 'student' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 mb-4 uppercase tracking-wider">Profile Information</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <p className="text-slate-500 font-medium text-xs mb-1">Full Name</p>
                        <p className="text-slate-900 text-sm">{selectedStudent.studentName}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 font-medium text-xs mb-1">Email Address</p>
                        <p className="text-slate-900 text-sm">{selectedStudent.email}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 font-medium text-xs mb-1">Student ID</p>
                        <p className="text-slate-900 text-sm">{selectedStudent.studentId}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-slate-100">
                    <p className="text-slate-500 font-medium text-xs mb-3 uppercase tracking-wider">Technical Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedStudent.skills.map((skill, i) => (
                        <Badge key={i} variant="neutral" className="bg-slate-50 border-slate-200 text-slate-700">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <h4 className="text-sm font-semibold text-slate-900 mb-4 uppercase tracking-wider">Current Placement</h4>
                    <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 flex-1">
                        <div>
                          <p className="text-slate-500 font-medium text-xs mb-1">Assigned Internship Role</p>
                          <p className="text-slate-900 text-sm font-medium">{selectedStudent.role}</p>
                        </div>
                        <div>
                          <p className="text-slate-500 font-medium text-xs mb-1">Company</p>
                          <p className="text-slate-900 text-sm font-medium">{selectedStudent.company}</p>
                        </div>
                      </div>
                      <div className="ml-6 flex items-center justify-center relative w-16 h-16 shrink-0">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                          <circle cx="18" cy="18" r="16" fill="none" className="stroke-slate-200" strokeWidth="3" />
                          <circle 
                            cx="18" cy="18" r="16" fill="none" 
                            className="stroke-indigo-600 transition-all duration-500" 
                            strokeWidth="3" 
                            strokeDasharray="100" 
                            strokeDashoffset={100 - selectedStudent.progressPercentage} 
                            strokeLinecap="round" 
                          />
                        </svg>
                        <span className="absolute text-xs font-bold text-slate-700">{selectedStudent.progressPercentage}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'internship' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold text-slate-900">Internship Overview</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{selectedStudent.company} — {selectedStudent.role}</p>
                    </div>
                    <Badge variant={getStatusBadgeVariant(selectedStudent.internshipStatus)}>
                      {selectedStudent.internshipStatus}
                    </Badge>
                  </div>
                  <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="col-span-1 md:col-span-2 space-y-6">
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs font-medium text-slate-500 mb-1">Start Date</p>
                          <p className="text-sm text-slate-900 font-medium">{selectedStudent.startDate}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-slate-500 mb-1">End Date</p>
                          <p className="text-sm text-slate-900 font-medium">{selectedStudent.endDate}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-slate-500 mb-1">Duration</p>
                          <p className="text-sm text-slate-900 font-medium">{selectedStudent.internshipDuration}</p>
                        </div>
                      </div>

                      {selectedStudent.internshipStatus === 'At Risk' && (
                        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-3">
                          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-semibold text-rose-800">Risk Detected</p>
                            <p className="text-xs text-rose-600 mt-0.5">{selectedStudent.riskIndicator}</p>
                          </div>
                        </div>
                      )}

                      <div>
                        <div className="flex justify-between items-end mb-2">
                          <div>
                            <p className="text-sm font-semibold text-slate-900">Overall Progress</p>
                            <p className="text-xs text-slate-500 mt-0.5">Current Stage: <span className="font-medium text-slate-700">{selectedStudent.currentStage}</span></p>
                          </div>
                          <p className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">
                            {selectedStudent.progressPercentage}% Complete
                          </p>
                        </div>
                        <ProgressBar 
                          progress={selectedStudent.progressPercentage} 
                          showPercent={false}
                          color={selectedStudent.internshipStatus === 'Completed' ? 'emerald' : selectedStudent.internshipStatus === 'At Risk' ? 'rose' : 'indigo'}
                        />
                      </div>
                    </div>
                    
                    <div className="col-span-1 border-t md:border-t-0 md:border-l border-slate-100 pt-6 md:pt-0 md:pl-6">
                       <p className="text-sm font-semibold text-slate-900 mb-4">Milestones</p>
                       <div className="space-y-4">
                        {selectedStudent.milestones.map((milestone, i) => {
                          const isCompleted = milestone.completed;
                          const isCurrent = !isCompleted && (i === 0 || selectedStudent.milestones[i-1].completed);
                          
                          return (
                            <div key={i} className="flex items-start gap-3">
                              <div className={`mt-0.5 shrink-0 w-5 h-5 rounded-full flex items-center justify-center border-2 ${
                                isCompleted ? 'bg-emerald-500 border-emerald-500' :
                                isCurrent ? 'bg-white border-indigo-500' :
                                'bg-slate-50 border-slate-200'
                              }`}>
                                {isCompleted && <CheckCircle2 className="w-3 h-3 text-white" />}
                                {isCurrent && <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />}
                              </div>
                              <div>
                                <p className={`text-sm ${
                                  isCompleted ? 'text-slate-600' :
                                  isCurrent ? 'text-indigo-900 font-semibold' :
                                  'text-slate-400'
                                }`}>
                                  {milestone.title}
                                </p>
                                {isCurrent && <p className="text-[10px] text-indigo-500 font-medium uppercase mt-0.5">In Progress</p>}
                              </div>
                            </div>
                          );
                        })}
                       </div>
                    </div>
                  </div>
                </div>

                {selectedStudent.timeline.length > 0 && (
                  <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                    <p className="text-sm font-semibold text-slate-900 mb-4">Activity Timeline</p>
                    <div className="space-y-5 border-l-2 border-indigo-100 ml-2 pl-6 py-2 relative">
                      {selectedStudent.timeline.map((event, i) => (
                        <div key={i} className="relative">
                          <div className="absolute -left-[31px] top-1 w-3 h-3 bg-indigo-500 rounded-full border-2 border-white ring-2 ring-indigo-100 shadow-sm" />
                          <p className="text-xs text-indigo-600 font-semibold mb-0.5">{event.date}</p>
                          <p className="text-sm text-slate-700">{event.event}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
