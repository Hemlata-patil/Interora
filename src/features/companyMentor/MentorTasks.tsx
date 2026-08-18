import React, { useState, useMemo } from 'react';
import { PageHeader, Card, Button, Badge, Input } from '@/components';
import { 
  CheckCircle2, Clock, X, Search, Filter, 
  FileCheck, Calendar, AlertCircle, Plus, Eye, ChevronDown
} from 'lucide-react';
import { 
  mockCompanyTasks, setMockCompanyTasks,
  mockCompanyApplications, 
  mockFacultyStudents, 
  mockCompanyInternships,
  MOCK_CURRENT_MENTOR_ID
} from '../faculty/mockData';
import type { 
  StudentTaskExecution,
  InternshipTaskPlan,
  SharedStudentData
} from '../faculty/mockData';

export const MentorTasks: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  
  // State for assignment modal/view
  const [isAssigning, setIsAssigning] = useState(false);
  const [selectedTaskPlanId, setSelectedTaskPlanId] = useState<string>('');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');

  // State for review modal/view
  const [reviewingTask, setReviewingTask] = useState<StudentTaskExecution | null>(null);
  const [feedback, setFeedback] = useState('');

  // 1. Identify Mentor's Internship(s)
  // For simplicity in this mock, we'll assume one primary internship per mentor, or we grab all they manage
  const mentorInternships = useMemo(() => {
    return mockCompanyInternships.filter(i => i.mentorId === MOCK_CURRENT_MENTOR_ID);
  }, []);

  const primaryInternship = mentorInternships[0];
  const taskPlan: InternshipTaskPlan[] = primaryInternship?.taskPlan || [];

  // 2. Identify Mentor's Assigned Students
  const assignedStudents = useMemo(() => {
    if (!primaryInternship) return [];
    const selectedApps = mockCompanyApplications.filter(
      a => a.internshipId === primaryInternship.id && a.applicationStatus === 'Selected'
    );
    return selectedApps.map(app => mockFacultyStudents.find(s => s.id === app.studentId)).filter(Boolean) as SharedStudentData[];
  }, [primaryInternship]);

  // 3. Filter Task Executions for these students and this internship
  const [tasks, setTasks] = useState<StudentTaskExecution[]>(mockCompanyTasks);
  
  const relevantTasks = useMemo(() => {
    if (!primaryInternship) return [];
    return tasks.filter(t => t.internshipId === primaryInternship.id);
  }, [tasks, primaryInternship]);

  const filteredTasks = useMemo(() => {
    return relevantTasks.filter(t => {
      const student = assignedStudents.find(s => s.id === t.internId);
      const plan = taskPlan.find(p => p.id === t.taskPlanId);
      
      const matchesSearch = 
        (student?.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || false) || 
        (plan?.title.toLowerCase().includes(searchTerm.toLowerCase()) || false);
      
      const matchesStatus = filterStatus === 'All' || t.taskStatus === filterStatus;
      
      return matchesSearch && matchesStatus;
    });
  }, [relevantTasks, searchTerm, filterStatus, assignedStudents, taskPlan]);

  // Actions
  const handleAssignTask = () => {
    if (!selectedTaskPlanId || !selectedStudentId || !dueDate || !primaryInternship) return;
    
    const newTaskExec: StudentTaskExecution = {
      id: `exec-${Math.random().toString(36).substr(2, 9)}`,
      internId: selectedStudentId,
      internshipId: primaryInternship.id,
      taskPlanId: selectedTaskPlanId,
      dueDate,
      priority: 'Medium',
      taskStatus: 'Assigned' as any, // using any as 'Assigned' wasn't in the original strict union, but we treat it as valid here or use 'In Progress'
      proofStatus: 'Not Submitted',
      lastUpdated: new Date().toISOString().split('T')[0],
      proofs: [],
      history: [{ date: new Date().toISOString().split('T')[0], event: 'Task assigned to student' }]
    };

    const updatedTasks = [newTaskExec, ...tasks];
    setTasks(updatedTasks);
    setMockCompanyTasks(updatedTasks);
    
    setIsAssigning(false);
    setSelectedTaskPlanId('');
    setSelectedStudentId('');
    setDueDate('');
  };

  const handleReviewAction = (status: 'Approved' | 'Changes Requested') => {
    if (!reviewingTask) return;
    
    const updatedTask = {
      ...reviewingTask,
      taskStatus: status as any,
      proofStatus: status as any,
      feedback: feedback,
      lastUpdated: new Date().toISOString().split('T')[0],
      history: [
        ...reviewingTask.history,
        { date: new Date().toISOString().split('T')[0], event: `Task ${status === 'Approved' ? 'Approved' : 'Changes Requested'}: ${feedback}` }
      ]
    };

    const updatedTasks = tasks.map(t => t.id === reviewingTask.id ? updatedTask : t);
    setTasks(updatedTasks);
    setMockCompanyTasks(updatedTasks);
    
    setReviewingTask(null);
    setFeedback('');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved': return <Badge variant="emerald"><CheckCircle2 className="w-3 h-3 mr-1" /> Approved</Badge>;
      case 'Changes Requested': return <Badge variant="amber"><AlertCircle className="w-3 h-3 mr-1" /> Needs Changes</Badge>;
      case 'Submitted for Review': return <Badge variant="indigo"><Clock className="w-3 h-3 mr-1" /> Under Review</Badge>;
      case 'Overdue': return <Badge variant="rose"><AlertCircle className="w-3 h-3 mr-1" /> Overdue</Badge>;
      default: return <Badge variant="neutral">{status}</Badge>;
    }
  };

  if (!primaryInternship) {
    return <div className="p-8 text-center">No assigned internship found for this mentor.</div>;
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <PageHeader
          title="Student Task Execution"
          description={`Manage and review tasks for interns in: ${primaryInternship.title}`}
        />
        <Button onClick={() => setIsAssigning(true)} className="shadow-sm">
          <Plus className="w-4 h-4 mr-2" /> Assign Task to Student
        </Button>
      </div>

      {isAssigning && (
        <Card title="Assign Task" className="shadow-sm border-indigo-100 bg-indigo-50/10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">Company Defined Task Plan *</label>
              <div className="relative">
                <select
                  value={selectedTaskPlanId}
                  onChange={(e) => setSelectedTaskPlanId(e.target.value)}
                  className="w-full pl-3 pr-8 py-2.5 text-sm bg-white border border-slate-300 rounded-lg shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select a task template...</option>
                  {taskPlan.map(tp => (
                    <option key={tp.id} value={tp.id}>{tp.title}</option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">Student *</label>
              <div className="relative">
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full pl-3 pr-8 py-2.5 text-sm bg-white border border-slate-300 rounded-lg shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select an assigned student...</option>
                  {assignedStudents.map(s => (
                    <option key={s.id} value={s.id}>{s.studentName}</option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <Input label="Due Date *" name="dueDate" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsAssigning(false)}>Cancel</Button>
            <Button onClick={handleAssignTask} disabled={!selectedTaskPlanId || !selectedStudentId || !dueDate}>Assign Task</Button>
          </div>
        </Card>
      )}

      {reviewingTask && (
        <Card title="Review Proof" className="shadow-md border-indigo-200">
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg">
              <div>
                <p className="text-xs text-slate-500 font-medium">Task</p>
                <p className="font-semibold text-slate-900">{taskPlan.find(p => p.id === reviewingTask.taskPlanId)?.title}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Student</p>
                <p className="font-semibold text-slate-900">{assignedStudents.find(s => s.id === reviewingTask.internId)?.studentName}</p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-2">Student Submission</h4>
              <p className="text-sm text-slate-700 bg-white p-3 border border-slate-200 rounded-md">
                {reviewingTask.studentWorkSummary || 'No summary provided.'}
              </p>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-2">Proof Files/Links</h4>
              {reviewingTask.proofs.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {reviewingTask.proofs.map((proof, idx) => (
                    <a key={idx} href={proof.url} target="_blank" rel="noopener noreferrer" className="flex items-center p-3 border border-slate-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50/30 transition-colors">
                      <FileCheck className="w-5 h-5 text-indigo-500 mr-3 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-slate-900">{proof.notes || proof.type}</p>
                        <p className="text-xs text-slate-500 truncate max-w-md">{proof.url}</p>
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 italic">No proof files attached.</p>
              )}
            </div>

            <div className="space-y-1.5 pt-4 border-t border-slate-100">
              <label className="block text-xs font-semibold text-slate-700">Review Feedback</label>
              <textarea
                rows={3}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Provide feedback on the submission..."
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setReviewingTask(null)}>Cancel</Button>
              <Button variant="outline" onClick={() => handleReviewAction('Changes Requested')} className="text-amber-600 border-amber-200 hover:bg-amber-50">
                Request Changes
              </Button>
              <Button onClick={() => handleReviewAction('Approved')} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                <CheckCircle2 className="w-4 h-4 mr-2" /> Approve Task
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by task title or student..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full md:w-auto"
          >
            <option value="All">All Statuses</option>
            <option value="Approved">Approved</option>
            <option value="Submitted for Review">Under Review</option>
            <option value="Changes Requested">Changes Requested</option>
            <option value="In Progress">In Progress</option>
            <option value="Overdue">Overdue</option>
          </select>
        </div>
      </div>

      {/* Task List */}
      <Card className="p-0 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="px-5 py-4">Task Details</th>
                <th className="px-5 py-4">Student</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Due Date</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTasks.length > 0 ? (
                filteredTasks.map(task => {
                  const plan = taskPlan.find(p => p.id === task.taskPlanId);
                  const student = assignedStudents.find(s => s.id === task.internId);
                  
                  return (
                    <tr key={task.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-900 mb-1">{plan?.title || 'Unknown Task'}</div>
                        <div className="text-xs text-slate-500 max-w-xs truncate">{plan?.description}</div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-[10px]">
                            {student?.studentName?.charAt(0) || '?'}
                          </div>
                          <span className="font-medium text-slate-700">{student?.studentName || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        {getStatusBadge(task.taskStatus)}
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        <div className="flex items-center gap-1.5 text-xs">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {task.dueDate}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        {(task.taskStatus === 'Submitted for Review' || task.taskStatus === 'Approved' || task.taskStatus === 'Changes Requested') && (
                          <Button variant="outline" size="sm" onClick={() => setReviewingTask(task)}>
                            <Eye className="w-3.5 h-3.5 mr-1.5" /> Review Proof
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-slate-500">
                    <FileCheck className="w-10 h-10 mx-auto text-slate-300 mb-3" />
                    <p className="font-medium text-slate-900">No tasks found</p>
                    <p className="text-xs mt-1">Assign tasks to students from the Company Task Plan.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
