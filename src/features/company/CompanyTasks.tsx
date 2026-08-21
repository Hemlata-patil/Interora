import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader, Card, Button, Badge, StatCard } from '@/components';
import { 
  CheckCircle2, Clock, X, Search, Filter, Activity,
  AlertCircle, FileText, LayoutList, Globe, Monitor, Image as ImageIcon, Link as LinkIcon
} from 'lucide-react';
import { 
  mockCompanyTasks, setMockCompanyTasks,
  mockFacultyStudents, mockCompanyInternships
} from '../faculty/mockData';
import type { 
  StudentTaskExecution,
  TaskStatus,
  ProofStatus,
  ProofData,
  VerificationHistoryItem
} from '../faculty/mockData';

export const CompanyTasks: React.FC = () => {
  const { internId } = useParams<{ internId: string }>();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState<StudentTaskExecution[]>(mockCompanyTasks);
  const [selectedTask, setSelectedTask] = useState<StudentTaskExecution | null>(null);
  const [feedbackInput, setFeedbackInput] = useState('');
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterIntern, setFilterIntern] = useState<string>(internId || 'All');
  const [filterStatus, setFilterStatus] = useState<string>('All');

  // Determine unique interns from the task list for the filter
  const availableInterns = useMemo(() => {
    const ids = Array.from(new Set(tasks.map(t => t.internId)));
    return ids.map(id => {
      const student = mockFacultyStudents.find(s => s.id === id);
      return student ? { id, name: student.studentName } : null;
    }).filter(Boolean) as { id: string, name: string }[];
  }, [tasks]);

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const student = mockFacultyStudents.find(s => s.id === task.internId);
      const studentName = student ? student.studentName : '';
      
      const taskTitle = mockCompanyInternships.find(i => i.id === task.internshipId)?.taskPlan?.find(p => p.id === task.taskPlanId)?.title || 'Task';
      const matchesSearch = 
        taskTitle.toLowerCase().includes(searchTerm.toLowerCase()) || 
        studentName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesIntern = filterIntern === 'All' || task.internId === filterIntern;
      const matchesStatus = filterStatus === 'All' || task.taskStatus === filterStatus;

      return matchesSearch && matchesIntern && matchesStatus;
    });
  }, [tasks, searchTerm, filterIntern, filterStatus]);

  // Summary Metrics (based on filtered tasks by intern if intern is selected, otherwise global)
  const baseTasksForMetrics = filterIntern === 'All' ? tasks : tasks.filter(t => t.internId === filterIntern);
  const totalTasks = baseTasksForMetrics.length;
  const inProgressTasks = baseTasksForMetrics.filter(t => t.taskStatus === 'In Progress').length;
  const pendingReviewTasks = baseTasksForMetrics.filter(t => t.taskStatus === 'Submitted for Review').length;
  const approvedTasks = baseTasksForMetrics.filter(t => t.taskStatus === 'Approved').length;
  const changesRequestedTasks = baseTasksForMetrics.filter(t => t.taskStatus === 'Changes Requested').length;

  const handleApprove = (taskId: string) => {
    if (window.confirm('You are confirming that the submitted work has been reviewed and accepted.\n\nAre you sure you want to approve this task?')) {
      const updatedTasks = tasks.map(t => {
        if (t.id === taskId) {
          const date = new Date().toISOString().split('T')[0];
          return {
            ...t,
            taskStatus: 'Approved' as TaskStatus,
            proofStatus: 'Approved' as ProofStatus,
            lastUpdated: date,
            history: [
              ...t.history,
              { date, event: 'Task approved by Industry Mentor' }
            ]
          };
        }
        return t;
      });
      setTasks(updatedTasks);
      setMockCompanyTasks(updatedTasks);
      const updatedSelected = updatedTasks.find(t => t.id === taskId);
      setSelectedTask(updatedSelected || null);
    }
  };

  const handleRequestChanges = (taskId: string) => {
    if (!feedbackInput.trim()) {
      alert("Please provide feedback explaining what needs to be changed.");
      return;
    }
    
    const updatedTasks = tasks.map(t => {
      if (t.id === taskId) {
        const date = new Date().toISOString().split('T')[0];
        return {
          ...t,
          taskStatus: 'Changes Requested' as TaskStatus,
          proofStatus: 'Changes Requested' as ProofStatus,
          feedback: feedbackInput,
          lastUpdated: date,
          history: [
            ...t.history,
            { date, event: 'Changes requested by Industry Mentor' }
          ]
        };
      }
      return t;
    });
    setTasks(updatedTasks);
    setMockCompanyTasks(updatedTasks);
    const updatedSelected = updatedTasks.find(t => t.id === taskId);
    setSelectedTask(updatedSelected || null);
    setShowFeedbackForm(false);
    setFeedbackInput('');
  };

  const getTaskStatusBadge = (status: TaskStatus) => {
    switch(status) {
      case 'Approved': return <Badge variant="emerald" className="py-0.5"><CheckCircle2 className="w-3 h-3 mr-1" /> Approved</Badge>;
      case 'Submitted for Review': return <Badge variant="indigo" className="py-0.5"><Clock className="w-3 h-3 mr-1" /> Submitted for Review</Badge>;
      case 'In Progress': return <Badge variant="amber" className="py-0.5"><Activity className="w-3 h-3 mr-1" /> In Progress</Badge>;
      case 'Changes Requested': return <Badge variant="rose" className="py-0.5"><AlertCircle className="w-3 h-3 mr-1" /> Changes Requested</Badge>;
      case 'Overdue': return <Badge variant="rose" className="py-0.5"><AlertCircle className="w-3 h-3 mr-1" /> Overdue</Badge>;
      case 'Not Started': return <Badge variant="neutral" className="py-0.5">Not Started</Badge>;
      default: return null;
    }
  };

  const getProofStatusBadge = (status: ProofStatus) => {
    switch(status) {
      case 'Approved': return <span className="text-xs font-semibold text-emerald-600">Approved</span>;
      case 'Pending Review': return <span className="text-xs font-semibold text-indigo-600">Pending Company Review</span>;
      case 'Changes Requested': return <span className="text-xs font-semibold text-rose-600">Changes Requested</span>;
      case 'Not Submitted': return <span className="text-xs font-medium text-slate-500">Not Submitted</span>;
      default: return null;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch(priority) {
      case 'High': return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700">HIGH</span>;
      case 'Medium': return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700">MEDIUM</span>;
      case 'Low': return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">LOW</span>;
      default: return null;
    }
  };

  const getProofIcon = (type: string) => {
    switch(type) {
      case 'GitHub Repository': return <Globe className="w-4 h-4 text-slate-700" />;
      case 'Live Demo': return <Monitor className="w-4 h-4 text-indigo-600" />;
      case 'Screenshots': return <ImageIcon className="w-4 h-4 text-emerald-600" />;
      case 'Document': return <FileText className="w-4 h-4 text-blue-600" />;
      default: return <LinkIcon className="w-4 h-4 text-slate-500" />;
    }
  };

  if (selectedTask) {
    const student = mockFacultyStudents.find(s => s.id === selectedTask.internId);
    
    return (
      <div className="space-y-6 max-w-4xl mx-auto pb-8 animate-in fade-in slide-in-from-bottom-2">
        <div className="flex items-center gap-4 border-b border-slate-200 pb-4">
          <Button variant="ghost" size="sm" onClick={() => { setSelectedTask(null); setShowFeedbackForm(false); }} className="p-2 h-auto text-slate-500">
            <X className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">{mockCompanyInternships.find(i => i.id === selectedTask.internshipId)?.taskPlan?.find(p => p.id === selectedTask.taskPlanId)?.title || 'Task'}</h1>
            <p className="text-sm text-slate-500">Assigned to {student?.studentName || 'Unknown Intern'}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card title="Task Information" className="shadow-sm">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Status</div>
                  {getTaskStatusBadge(selectedTask.taskStatus)}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Due Date</div>
                  <div className="text-sm font-semibold text-slate-900">{selectedTask.dueDate}</div>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Priority</div>
                  {getPriorityBadge(selectedTask.priority)}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Last Updated</div>
                  <div className="text-sm text-slate-600">{selectedTask.lastUpdated}</div>
                </div>
              </div>
              <div className="border-t border-slate-100 pt-4">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Description</div>
                <p className="text-sm text-slate-700">{mockCompanyInternships.find(i => i.id === selectedTask.internshipId)?.taskPlan?.find(p => p.id === selectedTask.taskPlanId)?.description || 'No description provided.'}</p>
              </div>
            </Card>

            <Card title="Submitted Proof" className="shadow-sm border-indigo-100 bg-indigo-50/10">
              <div className="mb-4">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Proof Status</div>
                {getProofStatusBadge(selectedTask.proofStatus)}
              </div>

              {selectedTask.studentWorkSummary ? (
                <div className="mb-6">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Student Work Summary</div>
                  <div className="text-sm text-slate-700 italic bg-white p-3 rounded border border-slate-200">
                    "{selectedTask.studentWorkSummary}"
                  </div>
                </div>
              ) : (
                <div className="mb-6 text-sm text-slate-500 italic">No work description submitted.</div>
              )}

              {selectedTask.proofs.length > 0 ? (
                <div className="space-y-3">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Evidence</div>
                  {selectedTask.proofs.map((proof: ProofData, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                          {getProofIcon(proof.type)}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-slate-900">{proof.type}</div>
                          {proof.notes && <div className="text-xs text-slate-500">{proof.notes}</div>}
                        </div>
                      </div>
                      <a href={proof.url} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded transition-colors">
                        Open Link
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-slate-500 italic bg-slate-50 p-4 rounded text-center border border-dashed border-slate-200">
                  No proof submitted yet.
                </div>
              )}
            </Card>

            {selectedTask.taskStatus === 'Changes Requested' && (
               <Card className="shadow-sm border-rose-200 bg-rose-50/50">
                 <div className="flex items-center gap-2 mb-2">
                   <AlertCircle className="w-5 h-5 text-rose-600" />
                   <h3 className="font-bold text-rose-900">Waiting for Resubmission</h3>
                 </div>
                 <p className="text-sm text-rose-700">
                   You have requested changes for this task. Waiting for the student to revise and resubmit the proof.
                 </p>
               </Card>
            )}

            {/* Company Verification Area */}
            {(selectedTask.proofStatus === 'Pending Review' || selectedTask.proofStatus === 'Changes Requested') && (
              <Card title="Company Verification" className="shadow-sm border-indigo-200">
                {showFeedbackForm ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Feedback / Requested Changes</label>
                      <textarea
                        value={feedbackInput}
                        onChange={(e) => setFeedbackInput(e.target.value)}
                        placeholder="Explain what the intern needs to fix or improve..."
                        className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px]"
                      ></textarea>
                    </div>
                    <div className="flex justify-end gap-3">
                      <Button variant="ghost" onClick={() => { setShowFeedbackForm(false); setFeedbackInput(''); }}>Cancel</Button>
                      <Button className="bg-amber-600 hover:bg-amber-700 text-white" onClick={() => handleRequestChanges(selectedTask.id)}>
                        Submit Feedback & Request Changes
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button 
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white" 
                      onClick={() => handleApprove(selectedTask.id)}
                      disabled={selectedTask.taskStatus === 'Changes Requested'}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" /> Approve Task
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1 text-rose-600 border-rose-200 hover:bg-rose-50"
                      onClick={() => setShowFeedbackForm(true)}
                    >
                      <AlertCircle className="w-4 h-4 mr-2" /> Request Changes
                    </Button>
                  </div>
                )}
              </Card>
            )}
          </div>

          <div className="space-y-6">
            {selectedTask.feedback && (
              <Card title="Mentor Feedback" className="shadow-sm bg-amber-50/50 border-amber-100">
                <div className="text-sm text-slate-700 italic border-l-2 border-amber-400 pl-3">
                  "{selectedTask.feedback}"
                </div>
                <div className="text-xs text-slate-500 mt-2 font-medium">Industry Mentor</div>
              </Card>
            )}

            <Card title="Verification History" className="shadow-sm">
              {selectedTask.history.length > 0 ? (
                <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                  {selectedTask.history.slice().reverse().map((item: VerificationHistoryItem, idx: number) => (
                    <div key={idx} className="relative flex items-start gap-4 group">
                      <div className="flex items-center justify-center w-4 h-4 rounded-full border border-white bg-slate-300 shrink-0 mt-1 shadow-sm relative z-10" />
                      <div className="pb-1">
                        <time className="text-[10px] font-bold text-slate-400 block mb-0.5">{item.date}</time>
                        <div className="text-xs font-medium text-slate-700 leading-snug">{item.event}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-slate-500 italic">No verification history available.</div>
              )}
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-8">
      <PageHeader
        title="Tasks & Proof"
        description="Monitor tasks assigned to your interns, review submitted proofs, and approve completed work."
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatCard title="Total Tasks" value={totalTasks.toString()} icon={LayoutList} />
        <StatCard title="In Progress" value={inProgressTasks.toString()} icon={Activity} />
        <StatCard title="Pending Review" value={pendingReviewTasks.toString()} icon={Clock} />
        <StatCard title="Approved" value={approvedTasks.toString()} icon={CheckCircle2} />
        <StatCard title="Changes Requested" value={changesRequestedTasks.toString()} icon={AlertCircle} />
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-1 gap-4 w-full flex-col sm:flex-row">
          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search tasks, intern name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={filterIntern}
              onChange={(e) => setFilterIntern(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg text-sm px-2 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 flex-1 min-w-[120px]"
            >
              <option value="All">All Interns</option>
              {availableInterns.map(i => (
                <option key={i.id} value={i.id}>{i.name}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg text-sm px-2 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 flex-1 min-w-[120px]"
            >
              <option value="All">All Statuses</option>
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="Submitted for Review">Submitted for Review</option>
              <option value="Changes Requested">Changes Requested</option>
              <option value="Approved">Approved</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-4">
        {filteredTasks.length > 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-slate-600">Task</th>
                    <th className="px-4 py-3 font-semibold text-slate-600">Intern</th>
                    <th className="px-4 py-3 font-semibold text-slate-600">Due Date</th>
                    <th className="px-4 py-3 font-semibold text-slate-600">Priority</th>
                    <th className="px-4 py-3 font-semibold text-slate-600">Task Status</th>
                    <th className="px-4 py-3 font-semibold text-slate-600">Proof Status</th>
                    <th className="px-4 py-3 font-semibold text-slate-600 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTasks.map(task => {
                    const student = mockFacultyStudents.find(s => s.id === task.internId);
                    return (
                      <tr key={task.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-900">{mockCompanyInternships.find(i => i.id === task.internshipId)?.taskPlan?.find(p => p.id === task.taskPlanId)?.title || 'Task'}</div>
                          <div className="text-xs text-slate-500">Last updated: {task.lastUpdated}</div>
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-700">
                          {student?.studentName || 'Unknown'}
                        </td>
                        <td className="px-4 py-3 text-slate-600">{task.dueDate}</td>
                        <td className="px-4 py-3">{getPriorityBadge(task.priority)}</td>
                        <td className="px-4 py-3">{getTaskStatusBadge(task.taskStatus)}</td>
                        <td className="px-4 py-3">{getProofStatusBadge(task.proofStatus)}</td>
                        <td className="px-4 py-3 text-right">
                          <Button variant="outline" size="sm" onClick={() => setSelectedTask(task)}>
                            Review
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-16 bg-white border border-slate-200 rounded-xl shadow-sm">
            <LayoutList className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-slate-900">No tasks match your criteria</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
              Try adjusting your search or filters to find tasks.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
