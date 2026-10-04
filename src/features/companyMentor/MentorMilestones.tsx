import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader, Card, Button, Badge, StatCard } from '@/components';
import { 
  CheckCircle2, Clock, X, Filter, Activity, Map, ArrowRight,
  AlertCircle, LayoutList, Calendar, Flag, Loader2
} from 'lucide-react';
import {
  fetchCompanyMentorInternsBackend,
  fetchCompanyMentorTasksBackend,
  fetchMentorMilestonesBackend,
  type CompanyMentorInternRecord,
  type CompanyMentorTaskRecord,
} from '@/services/api/backendService';

export type MilestoneDisplayStatus = 'Completed' | 'In Progress' | 'At Risk' | 'Overdue' | 'Not Started';

export interface MentorMilestoneItem {
  id: string;
  assignmentId: string;
  internId: string;
  studentName: string;
  internshipTitle: string;
  companyName: string;
  title: string;
  description: string;
  startDate: string;
  dueDate: string;
  completedDate?: string;
  status: MilestoneDisplayStatus;
  progressPercentage: number;
}

export const MentorMilestones: React.FC = () => {
  const navigate = useNavigate();

  const [milestones, setMilestones] = useState<MentorMilestoneItem[]>([]);
  const [assignedStudents, setAssignedStudents] = useState<CompanyMentorInternRecord[]>([]);
  const [tasks, setTasks] = useState<CompanyMentorTaskRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedMilestone, setSelectedMilestone] = useState<MentorMilestoneItem | null>(null);
  const [filterIntern, setFilterIntern] = useState<string>('All');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [internsData, tasksData, rawMilestones] = await Promise.all([
        fetchCompanyMentorInternsBackend(),
        fetchCompanyMentorTasksBackend(),
        fetchMentorMilestonesBackend(),
      ]);

      setAssignedStudents(internsData || []);
      setTasks(tasksData || []);

      if (rawMilestones && rawMilestones.length > 0) {
        const mapped: MentorMilestoneItem[] = rawMilestones.map((m: any) => {
          let status: MilestoneDisplayStatus = 'Not Started';
          const rawStatus = (m.status || '').toLowerCase();
          if (rawStatus === 'completed') status = 'Completed';
          else if (rawStatus === 'in_progress') status = 'In Progress';
          else if (rawStatus === 'at_risk') status = 'At Risk';
          else if (rawStatus === 'overdue') status = 'Overdue';
          else if (rawStatus === 'pending') status = 'Not Started';

          // Relate tasks for this milestone's student/assignment
          const studentId = m.assignment?.studentId || m.internId || '';
          const internTasks = (tasksData || []).filter((t: CompanyMentorTaskRecord) => t.studentId === studentId);
          const approvedTasks = internTasks.filter((t: CompanyMentorTaskRecord) => t.reviewStatus === 'Verified' || t.completed).length;

          let progress = 0;
          if (status === 'Completed') {
            progress = 100;
          } else if (internTasks.length > 0) {
            progress = Math.round((approvedTasks / internTasks.length) * 100);
          } else if (status === 'In Progress') {
            progress = 50;
          }

          return {
            id: m.id,
            assignmentId: m.assignmentId || m.assignment?.id || '',
            internId: studentId,
            studentName: m.assignment?.student?.profile?.fullName || 'Assigned Intern',
            internshipTitle: m.assignment?.internship?.title || 'Internship Program',
            companyName: m.assignment?.company?.companyName || 'Host Company',
            title: m.title || m.template?.title || 'Operational Milestone',
            description: m.description || m.template?.description || 'Milestone deliverables and progress tracking.',
            startDate: m.createdAt ? new Date(m.createdAt).toISOString().split('T')[0] : '',
            dueDate: m.targetDate ? new Date(m.targetDate).toISOString().split('T')[0] : 'TBD',
            completedDate: m.completedAt ? new Date(m.completedAt).toISOString().split('T')[0] : undefined,
            status,
            progressPercentage: progress,
          };
        });
        setMilestones(mapped);
      } else {
        setMilestones([]);
      }
    } catch (err: any) {
      console.error('[MentorMilestones] Failed to load milestone data:', err);
      setError('Unable to load milestones from the server.');
      setMilestones([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filter milestones based on intern filter
  const filteredMilestones = useMemo(() => {
    if (filterIntern === 'All') {
      return milestones;
    }
    return milestones.filter(m => m.internId === filterIntern);
  }, [milestones, filterIntern]);

  // Overall metrics
  const totalMilestones = filteredMilestones.length;
  const completedMilestones = filteredMilestones.filter(m => m.status === 'Completed').length;
  const inProgressMilestones = filteredMilestones.filter(m => m.status === 'In Progress').length;
  const atRiskMilestones = filteredMilestones.filter(m => m.status === 'At Risk' || m.status === 'Overdue').length;

  // Derived Internship Progress (if specific intern selected)
  const internshipProgress = useMemo(() => {
    if (filterIntern === 'All') return null;
    const internTasks = tasks.filter(t => t.studentId === filterIntern);
    const approvedTasks = internTasks.filter(t => t.reviewStatus === 'Verified' || t.completed).length;
    const internMilestones = milestones.filter(m => m.internId === filterIntern);
    const completedM = internMilestones.filter(m => m.status === 'Completed').length;

    let progressPercentage = 0;
    if (internMilestones.length > 0) {
      progressPercentage = Math.round((completedM / internMilestones.length) * 100);
    }

    return {
      progressPercentage,
      tasksApproved: approvedTasks,
      totalTasks: internTasks.length,
    };
  }, [filterIntern, tasks, milestones]);

  const getMilestoneStatusBadge = (status: MilestoneDisplayStatus) => {
    switch(status) {
      case 'Completed': return <Badge variant="emerald" className="py-0.5"><CheckCircle2 className="w-3 h-3 mr-1" /> Completed</Badge>;
      case 'In Progress': return <Badge variant="indigo" className="py-0.5"><Activity className="w-3 h-3 mr-1" /> In Progress</Badge>;
      case 'At Risk': return <Badge variant="amber" className="py-0.5"><AlertCircle className="w-3 h-3 mr-1" /> At Risk</Badge>;
      case 'Overdue': return <Badge variant="rose" className="py-0.5"><AlertCircle className="w-3 h-3 mr-1" /> Overdue</Badge>;
      case 'Not Started': return <Badge variant="neutral" className="py-0.5"><Clock className="w-3 h-3 mr-1" /> Not Started</Badge>;
      default: return null;
    }
  };

  const getTaskStatusColor = (status: string) => {
    switch(status) {
      case 'Verified':
      case 'Approved': return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'Pending Review':
      case 'Submitted for Review': return 'text-indigo-700 bg-indigo-50 border-indigo-200';
      case 'In Progress': return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'Correction Required':
      case 'Changes Requested': return 'text-rose-700 bg-rose-50 border-rose-200';
      case 'Overdue': return 'text-rose-700 bg-rose-50 border-rose-200';
      default: return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-4" />
        <p className="text-slate-600 font-medium">Loading milestone progress...</p>
      </div>
    );
  }

  if (selectedMilestone) {
    const relatedTasks = tasks.filter(t => t.studentId === selectedMilestone.internId);
    const completedRelatedTasks = relatedTasks.filter(t => t.reviewStatus === 'Verified' || t.completed).length;

    return (
      <div className="space-y-6 max-w-4xl mx-auto pb-8 animate-in fade-in slide-in-from-bottom-2">
        <div className="flex items-center gap-4 border-b border-slate-200 pb-4">
          <Button variant="ghost" size="sm" onClick={() => setSelectedMilestone(null)} className="p-2 h-auto text-slate-500">
            <X className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              {selectedMilestone.title}
            </h1>
            <p className="text-sm text-slate-500">
              {selectedMilestone.internshipTitle} • {selectedMilestone.studentName}
            </p>
          </div>
          <div className="ml-auto">
            {getMilestoneStatusBadge(selectedMilestone.status)}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card title="Milestone Overview" className="shadow-sm">
              <div className="mb-6">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Description</div>
                <p className="text-sm text-slate-700">
                  {selectedMilestone.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6 pt-4 border-t border-slate-100">
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Timeline</div>
                  <div className="text-sm font-medium text-slate-900">
                    {selectedMilestone.startDate || 'Started'} — {selectedMilestone.dueDate}
                  </div>
                </div>
                {selectedMilestone.completedDate && (
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Completed On</div>
                    <div className="text-sm font-medium text-emerald-700">{selectedMilestone.completedDate}</div>
                  </div>
                )}
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Milestone Progress</span>
                  <span className="font-bold text-indigo-700">{selectedMilestone.progressPercentage}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2.5 mb-2">
                  <div 
                    className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500" 
                    style={{ width: `${selectedMilestone.progressPercentage}%` }}
                  ></div>
                </div>
                <div className="text-xs text-slate-500 text-right">
                  Based on milestone completions and task reviews
                </div>
              </div>
            </Card>

            <Card title="Related Tasks" className="shadow-sm">
              {relatedTasks.length > 0 ? (
                <div className="space-y-3">
                  <div className="text-sm text-slate-600 mb-4 pb-3 border-b border-slate-100">
                    <span className="font-bold text-slate-900">{completedRelatedTasks}</span> of <span className="font-bold text-slate-900">{relatedTasks.length}</span> tasks approved
                  </div>
                  {relatedTasks.map(task => (
                    <div key={task.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-white border border-slate-200 rounded-lg shadow-sm gap-3">
                      <div>
                        <div className="font-semibold text-slate-900 text-sm">{task.title}</div>
                        <div className="text-xs text-slate-500 mt-0.5">Due: {task.dueDate}</div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-md border uppercase tracking-wider ${getTaskStatusColor(task.reviewStatus)}`}>
                          {task.reviewStatus}
                        </span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 text-xs text-indigo-600 px-2"
                          onClick={() => navigate(`/mentor/tasks`)}
                        >
                          Review <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <LayoutList className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">No tasks are linked to this intern yet.</p>
                </div>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {(selectedMilestone.status === 'At Risk' || selectedMilestone.status === 'Overdue') && (
              <Card className="shadow-sm border-rose-200 bg-rose-50">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-rose-600" />
                  <h3 className="font-bold text-rose-900">Needs Attention</h3>
                </div>
                <p className="text-xs text-rose-700">
                  {selectedMilestone.status === 'Overdue' 
                    ? 'This milestone has passed its due date with incomplete tasks.' 
                    : 'This milestone is approaching its due date and progress is behind schedule.'}
                </p>
              </Card>
            )}

            <Card title="Quick Actions" className="shadow-sm">
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start text-sm" onClick={() => navigate(`/mentor/my-interns`)}>
                  <Map className="w-4 h-4 mr-2 text-slate-400" />
                  View Interns
                </Button>
                <Button variant="outline" className="w-full justify-start text-sm" onClick={() => navigate(`/mentor/tasks`)}>
                  <LayoutList className="w-4 h-4 mr-2 text-slate-400" />
                  View Tasks
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-8">
      <PageHeader
        title="Student Milestones"
        description="Monitor detailed milestone execution and task completion for your assigned students."
      />

      {error && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm">
          {error}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="text-sm font-medium text-slate-700 mr-2">Filter by Intern:</span>
          <select
            value={filterIntern}
            onChange={(e) => setFilterIntern(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 flex-1 md:w-64"
          >
            <option value="All">All Assigned Interns</option>
            {assignedStudents.map(i => (
              <option key={i.studentId} value={i.studentId}>{i.studentName}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="md:col-span-3 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard title="Total Milestones" value={totalMilestones.toString()} icon={Flag} />
            <StatCard title="Completed" value={completedMilestones.toString()} icon={CheckCircle2} />
            <StatCard title="In Progress" value={inProgressMilestones.toString()} icon={Activity} />
            <StatCard title="At Risk / Overdue" value={atRiskMilestones.toString()} icon={AlertCircle} />
          </div>

          <div className="space-y-4">
            {filteredMilestones.length > 0 ? (
              filteredMilestones.map(milestone => {
                const internTasks = tasks.filter(t => t.studentId === milestone.internId);
                const approvedTasks = internTasks.filter(t => t.reviewStatus === 'Verified' || t.completed).length;

                return (
                  <Card key={milestone.id} className="shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex-1 space-y-4">
                        <div>
                          <div className="flex items-start justify-between mb-1">
                            <h3 className="text-lg font-bold text-slate-900">{milestone.title}</h3>
                            {getMilestoneStatusBadge(milestone.status)}
                          </div>
                          <p className="text-sm text-slate-500">Intern: <span className="font-semibold text-slate-700">{milestone.studentName}</span></p>
                        </div>
                        
                        <p className="text-sm text-slate-700 line-clamp-2">{milestone.description}</p>
                        
                        <div className="flex items-center gap-6 text-xs text-slate-500">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            Due: {milestone.dueDate}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <LayoutList className="w-3.5 h-3.5" />
                            {approvedTasks} / {internTasks.length} tasks approved
                          </div>
                        </div>
                      </div>

                      <div className="md:w-48 flex flex-col justify-center shrink-0 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
                        <div className="mb-1 flex justify-between text-xs">
                          <span className="font-semibold text-slate-500">Progress</span>
                          <span className="font-bold text-indigo-700">{milestone.progressPercentage}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 mb-4">
                          <div 
                            className="bg-indigo-500 h-2 rounded-full" 
                            style={{ width: `${milestone.progressPercentage}%` }}
                          ></div>
                        </div>
                        <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => setSelectedMilestone(milestone)}>
                          View Milestone
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })
            ) : (
              <div className="text-center py-16 bg-white border border-slate-200 rounded-xl shadow-sm">
                <Flag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-slate-900">No milestones found</h3>
                <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
                  {filterIntern === 'All' 
                    ? 'No milestones have been defined for your assigned interns yet.' 
                    : 'No milestones have been defined for this intern yet.'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {internshipProgress && filterIntern !== 'All' ? (
            <Card title="Intern Progress" className="shadow-sm bg-indigo-50/30 border-indigo-100">
              <div className="mb-4 text-center">
                <span className="text-3xl font-black text-indigo-600">
                  {internshipProgress.progressPercentage}%
                </span>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Overall Completion</p>
              </div>
              <div className="space-y-3 pt-3 border-t border-indigo-100">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Milestones</span>
                  <span className="font-semibold text-slate-900">{completedMilestones} / {totalMilestones} completed</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Tasks</span>
                  <span className="font-semibold text-slate-900">{internshipProgress.tasksApproved} / {internshipProgress.totalTasks} approved</span>
                </div>
              </div>
            </Card>
          ) : (
            <Card title="Timeline Overview" className="shadow-sm">
              <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                {filteredMilestones.slice(0, 5).map((m, idx) => (
                  <div key={idx} className="relative flex items-start gap-3 group">
                    <div className={`flex items-center justify-center w-4 h-4 rounded-full border-2 border-white shrink-0 mt-0.5 shadow-sm relative z-10 ${m.status === 'Completed' ? 'bg-emerald-500' : m.status === 'In Progress' ? 'bg-indigo-500' : 'bg-slate-300'}`} />
                    <div className="pb-2">
                      <div className="text-xs font-bold text-slate-900 leading-tight">{m.title}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{m.status}</div>
                    </div>
                  </div>
                ))}
                {filteredMilestones.length === 0 && (
                  <p className="text-xs text-slate-400 py-2">No milestone timeline available.</p>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
