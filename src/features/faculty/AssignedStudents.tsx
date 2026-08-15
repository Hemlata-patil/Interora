import React, { useState, useMemo } from 'react';
import { 
  PageHeader, 
  StatCard, 
  Table, 
  Badge, 
  Button, 
  Modal, 
  Input, 
  Select, 
  EmptyState,
  ProgressBar
} from '@/components';
import { mockFacultyStudents } from './mockData';
import type { SharedStudentData, InternshipStatus } from './mockData';
import { Users, Briefcase, AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { Column } from '@/components/ui/Table';

export const AssignedStudents: React.FC = () => {
  // Only show students who actually have an active/at risk/completed internship
  const [allStudents] = useState<SharedStudentData[]>(mockFacultyStudents);
  
  const assignedStudents = useMemo(() => {
    return allStudents.filter(s => s.applicationStatus === 'Approved');
  }, [allStudents]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<SharedStudentData | null>(null);
  const [activeTab, setActiveTab] = useState<'student' | 'internship' | 'progress'>('student');

  // Derived stats
  const total = assignedStudents.length;
  const active = assignedStudents.filter(s => s.internshipStatus === 'Active').length;
  const atRisk = assignedStudents.filter(s => s.internshipStatus === 'At Risk').length;
  const completed = assignedStudents.filter(s => s.internshipStatus === 'Completed').length;

  // Filtering
  const filteredStudents = useMemo(() => {
    return assignedStudents.filter(student => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        student.studentName.toLowerCase().includes(searchLower) ||
        student.email.toLowerCase().includes(searchLower) ||
        student.company.toLowerCase().includes(searchLower) ||
        student.role.toLowerCase().includes(searchLower);
      const matchesStatus = statusFilter === 'All' || student.internshipStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [assignedStudents, searchTerm, statusFilter]);

  const getStatusBadgeVariant = (status: InternshipStatus) => {
    switch (status) {
      case 'Active': return 'indigo';
      case 'At Risk': return 'rose';
      case 'Completed': return 'emerald';
      default: return 'neutral';
    }
  };

  const columns: Column<SharedStudentData>[] = [
    {
      header: 'Student',
      cell: (row) => (
        <div>
          <div className="font-medium text-slate-900">{row.studentName}</div>
          <div className="text-xs text-slate-500">{row.email}</div>
        </div>
      ),
    },
    {
      header: 'Company',
      accessorKey: 'company',
    },
    {
      header: 'Role',
      accessorKey: 'role',
    },
    {
      header: 'Duration',
      cell: (row) => (
        <span className="text-xs whitespace-nowrap">
          {row.startDate && row.endDate 
            ? `${new Date(row.startDate).toLocaleDateString()} - ${new Date(row.endDate).toLocaleDateString()}`
            : 'N/A'
          }
        </span>
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
      header: 'Status',
      cell: (row) => (
        <Badge variant={getStatusBadgeVariant(row.internshipStatus)}>
          {row.internshipStatus}
        </Badge>
      ),
    },
    {
      header: 'Last Activity',
      cell: (row) => <span className="text-xs text-slate-500">{row.lastActivity || 'No recent activity'}</span>,
    },
    {
      header: 'Action',
      cell: (row) => (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => {
            setSelectedStudent(row);
            setActiveTab('student');
            setIsModalOpen(true);
          }}
        >
          View Details
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assigned Students"
        description="Monitor the progress, status, and risks of interns assigned to you."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Students" value={total} icon={Users} />
        <StatCard title="Active Internships" value={active} icon={Briefcase} />
        <StatCard title="At Risk" value={atRisk} icon={AlertTriangle} trend={{ value: 'Requires attention', isPositive: false }} />
        <StatCard title="Completed" value={completed} icon={CheckCircle2} />
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 items-end">
          <div className="w-full sm:max-w-xs">
            <Input 
              placeholder="Search student, role, or company..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              label="Search"
            />
          </div>
          <div className="w-full sm:max-w-xs">
            <Select 
              label="Filter by Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { label: 'All Statuses', value: 'All' },
                { label: 'Active', value: 'Active' },
                { label: 'At Risk', value: 'At Risk' },
                { label: 'Completed', value: 'Completed' },
              ]}
            />
          </div>
        </div>

        <div className="p-4">
          {filteredStudents.length > 0 ? (
            <Table 
              columns={columns} 
              data={filteredStudents} 
              keyExtractor={(row) => row.id} 
            />
          ) : (
            <EmptyState 
              title="No students found" 
              description="Try adjusting your search or filter criteria to find what you are looking for."
            />
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="View Details"
        description="Detailed view of the student and their internship progress."
        className="max-w-4xl"
      >
        {selectedStudent && (
          <div className="space-y-6">
            {/* Context Header */}
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
              <button 
                className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === 'progress' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                onClick={() => setActiveTab('progress')}
              >
                Progress & Milestones
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
                {/* Overview Card */}
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
                          // Find if it's the current active milestone (first non-completed one)
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

                {/* Timeline Section */}
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

            {activeTab === 'progress' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex flex-col mb-2">
                  <h4 className="text-lg font-bold text-slate-900">Progress & Milestones</h4>
                  <p className="text-sm text-slate-500">Track the student's internship tasks, milestones and overall progress.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Overall Progress Card */}
                  <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm col-span-1 flex flex-col items-center justify-center h-[260px]">
                    <h4 className="text-sm font-semibold text-slate-900 mb-6 w-full text-center">Overall Internship Progress</h4>
                    
                    <div className="relative w-28 h-28 flex items-center justify-center mb-4">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="16" fill="none" className="stroke-slate-100" strokeWidth="4" />
                        <circle 
                          cx="18" cy="18" r="16" fill="none" 
                          className={selectedStudent.internshipStatus === 'At Risk' ? 'stroke-rose-500' : selectedStudent.internshipStatus === 'Completed' ? 'stroke-emerald-500' : 'stroke-indigo-600'} 
                          strokeWidth="4" 
                          strokeDasharray="100" 
                          strokeDashoffset={100 - selectedStudent.progressPercentage} 
                          strokeLinecap="round" 
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold text-slate-900">{selectedStudent.progressPercentage}%</span>
                      </div>
                    </div>
                    
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">Overall Progress</p>
                    <div className={`text-xs font-bold px-3 py-1 rounded-full ${
                      selectedStudent.internshipStatus === 'At Risk' ? 'bg-rose-100 text-rose-700' : 
                      selectedStudent.internshipStatus === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 
                      'bg-emerald-100 text-emerald-700'
                    }`}>
                      {selectedStudent.internshipStatus === 'At Risk' ? 'Needs Attention' : selectedStudent.internshipStatus === 'Completed' ? 'Completed' : 'On Track'}
                    </div>
                  </div>

                  {/* Milestone Summary & Horizontal Progress */}
                  <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm col-span-1 md:col-span-2 flex flex-col justify-between h-[260px]">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 mb-5">Milestone Summary</h4>
                      
                      <div className="grid grid-cols-3 gap-4 mb-2">
                        <div className="bg-slate-50 rounded-xl p-4 flex flex-col items-center justify-center border border-slate-100">
                          <span className="text-2xl font-bold text-slate-900 mb-1">
                            {selectedStudent.milestones.filter(m => m.completed).length}
                          </span>
                          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Completed</span>
                        </div>
                        <div className="bg-indigo-50/50 rounded-xl p-4 flex flex-col items-center justify-center border border-indigo-50">
                          <span className="text-2xl font-bold text-indigo-700 mb-1">
                            {selectedStudent.milestones.filter((m, i, arr) => !m.completed && (i === 0 || arr[i-1].completed)).length}
                          </span>
                          <span className="text-[10px] text-indigo-600 uppercase font-bold tracking-wider">In Progress</span>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-4 flex flex-col items-center justify-center border border-slate-100">
                          <span className="text-2xl font-bold text-slate-900 mb-1">
                            {selectedStudent.milestones.filter((m, i, arr) => !m.completed && !(i === 0 || arr[i-1].completed)).length}
                          </span>
                          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Pending</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="flex justify-between items-end mb-2">
                        <p className="text-sm font-semibold text-slate-900">Overall Progress</p>
                        <p className="text-sm font-bold text-slate-900">{selectedStudent.progressPercentage}%</p>
                      </div>
                      <ProgressBar 
                        progress={selectedStudent.progressPercentage} 
                        showPercent={false}
                        color={selectedStudent.internshipStatus === 'Completed' ? 'emerald' : selectedStudent.internshipStatus === 'At Risk' ? 'rose' : 'indigo'}
                      />
                    </div>
                  </div>
                </div>

                {/* Milestone Timeline */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                  <h4 className="text-sm font-semibold text-slate-900 mb-6">Milestone Timeline</h4>
                  <div className="space-y-4 relative ml-2">
                    <div className="absolute left-[11px] top-4 bottom-4 w-px bg-slate-200 z-0"></div>
                    {selectedStudent.milestones.map((milestone, i) => {
                      const isCompleted = milestone.completed;
                      const isCurrent = !isCompleted && (i === 0 || selectedStudent.milestones[i-1].completed);
                      
                      let circleClass = 'bg-slate-100 border-slate-200';
                      let iconColor = '';
                      let statusText = 'Pending';
                      let statusClass = 'text-slate-500';
                      let dateClass = 'text-slate-400';
                      
                      if (isCompleted) {
                        circleClass = 'bg-emerald-500 border-emerald-500';
                        iconColor = 'text-white';
                        statusText = 'Completed';
                        statusClass = 'text-emerald-600 font-medium';
                        dateClass = 'text-slate-500';
                      } else if (isCurrent) {
                        circleClass = 'bg-white border-indigo-500 border-2';
                        statusText = 'In Progress';
                        statusClass = 'text-indigo-600 font-semibold';
                        dateClass = 'text-indigo-500 font-medium';
                        
                        // Check if overdue (basic logic: if dueDate is past a mock today date)
                        if (milestone.dueDate) {
                          const dueDate = new Date(milestone.dueDate);
                          const today = new Date('2024-01-01'); // Mock current date that makes sense for the mock data
                          if (dueDate < today) {
                            circleClass = 'bg-white border-rose-500 border-2';
                            statusText = 'Overdue';
                            statusClass = 'text-rose-600 font-bold';
                            dateClass = 'text-rose-500 font-medium';
                          }
                        }
                      }
                      
                      return (
                        <div key={i} className="flex gap-4 relative z-10">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-3 border ${circleClass}`}>
                            {isCompleted && <CheckCircle2 className={`w-3.5 h-3.5 ${iconColor}`} />}
                            {isCurrent && statusText !== 'Overdue' && <div className="w-2 h-2 rounded-full bg-indigo-500"></div>}
                            {statusText === 'Overdue' && <div className="w-2 h-2 rounded-full bg-rose-500"></div>}
                          </div>
                          <div className={`flex-1 border p-4 rounded-xl transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 ${
                            isCompleted ? 'bg-slate-50 border-slate-100' :
                            isCurrent && statusText !== 'Overdue' ? 'bg-indigo-50/30 border-indigo-100' :
                            statusText === 'Overdue' ? 'bg-rose-50/30 border-rose-100' :
                            'bg-white border-slate-100'
                          }`}>
                            <div>
                              <p className={`font-semibold ${isCompleted ? 'text-slate-700' : isCurrent ? 'text-slate-900' : 'text-slate-500'}`}>
                                {milestone.title}
                              </p>
                              <p className={`text-xs mt-0.5 ${statusClass}`}>
                                {statusText}
                              </p>
                            </div>
                            <div className="text-left sm:text-right">
                              <p className={`text-xs ${dateClass}`}>
                                {isCompleted ? milestone.dueDate || 'Completed' : `Due ${milestone.dueDate || 'TBD'}`}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
