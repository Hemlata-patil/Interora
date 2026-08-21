import React, { useState, useMemo } from 'react';
import { PageHeader, StatCard, Card, Badge, Button, Input, Select, EmptyState } from '@/components';
import { initialMockTasks, type TaskRecord, type TaskStatus, type TaskPriority } from './data/mockTasks';
import { mockActiveInternshipData } from '@/features/internships/data/mockActiveInternship';
import { Search, CheckSquare, Clock, AlertCircle, PlayCircle, CheckCircle2, ArrowRight, Eye, Filter, Compass } from 'lucide-react';
import { Link } from 'react-router-dom';

export const TasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<TaskRecord[]>(initialMockTasks);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  const activeInternship = mockActiveInternshipData;

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === 'Completed').length;
    const inProgress = tasks.filter((t) => t.status === 'In Progress').length;
    const pending = tasks.filter((t) => t.status === 'To Do' || t.status === 'Blocked').length;
    const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, inProgress, pending, completionPercentage };
  }, [tasks]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setPriorityFilter('all');
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // 1. Text Search (Title or Category)
      const q = searchQuery.toLowerCase().trim();
      if (q) {
        const matchTitle = task.title.toLowerCase().includes(q);
        const matchCategory = task.category.toLowerCase().includes(q);
        if (!matchTitle && !matchCategory) return false;
      }

      // 2. Status Filter
      if (statusFilter !== 'all' && task.status !== statusFilter) {
        return false;
      }

      // 3. Priority Filter
      if (priorityFilter !== 'all' && task.priority !== priorityFilter) {
        return false;
      }

      return true;
    });
  }, [tasks, searchQuery, statusFilter, priorityFilter]);

  const handleStartTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: 'In Progress' as TaskStatus } : t))
    );
  };

  const handleCompleteTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status: 'Completed' as TaskStatus,
              completedAt: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }
          : t
      )
    );
  };

  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case 'Completed':
        return <Badge variant="emerald">Completed</Badge>;
      case 'In Progress':
        return <Badge variant="indigo">In Progress</Badge>;
      case 'To Do':
        return <Badge variant="amber">To Do</Badge>;
      case 'Blocked':
        return <Badge variant="rose">Blocked</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case 'High':
        return <Badge variant="rose">High Priority</Badge>;
      case 'Medium':
        return <Badge variant="sky">Medium Priority</Badge>;
      case 'Low':
        return <Badge variant="neutral">Low Priority</Badge>;
      default:
        return <Badge variant="neutral">{priority}</Badge>;
    }
  };

  if (!activeInternship) {
    return (
      <div className="space-y-6">
        <PageHeader title="Daily Tasks" description="Manage assigned daily tasks and work activities." />
        <EmptyState
          icon={<Compass className="w-6 h-6 text-slate-400" />}
          title="No Active Internship"
          description="You don't have an active internship enrolled. Browse open listings to get started."
          action={
            <Link to="/student/internships">
              <Button variant="primary" size="sm">
                Browse Internships
              </Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <PageHeader
        title="Daily Tasks"
        description={`Assigned task queue for your internship at ${activeInternship.companyName}`}
        action={
          <Link to="/student/work-logs">
            <Button variant="outline" size="sm">
              View Work Logs <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </Link>
        }
      />

      {/* 2. Stat Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Tasks" value={stats.total} icon={CheckSquare} description={`${stats.completed} Finished`} />
        <StatCard title="In Progress" value={stats.inProgress} icon={Clock} description="Active sprint items" />
        <StatCard title="Pending / Blocked" value={stats.pending} icon={AlertCircle} description="Queued or waiting" />
        <StatCard title="Task Completion %" value={`${stats.completionPercentage}%`} icon={CheckCircle2} trend={{ value: 'Optimal Progress', isPositive: true }} />
      </div>

      {/* 3. Filters Control Panel */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <Input
              placeholder="Search by task title or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select
            label="Filter Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: 'To Do', label: 'To Do' },
              { value: 'In Progress', label: 'In Progress' },
              { value: 'Completed', label: 'Completed' },
              { value: 'Blocked', label: 'Blocked' },
            ]}
          />

          <Select
            label="Filter Priority"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Priorities' },
              { value: 'High', label: 'High Priority' },
              { value: 'Medium', label: 'Medium Priority' },
              { value: 'Low', label: 'Low Priority' },
            ]}
          />
        </div>

        {(searchQuery || statusFilter !== 'all' || priorityFilter !== 'all') && (
          <div className="flex justify-end pt-1">
            <Button variant="ghost" size="sm" onClick={handleResetFilters} className="text-slate-500 hover:text-slate-700">
              Reset Filters
            </Button>
          </div>
        )}
      </div>

      {/* 4. Task List */}
      {filteredTasks.length > 0 ? (
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <Card key={task.id} className="hover:border-slate-300 transition-all">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900 leading-snug hover:text-indigo-600 transition-colors">
                      <Link to={`/student/tasks/${task.id}`}>{task.title}</Link>
                    </h3>
                    {getStatusBadge(task.status)}
                    {getPriorityBadge(task.priority)}
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">{task.description}</p>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-1">
                    <span>Category: <strong className="text-slate-700 font-semibold">{task.category}</strong></span>
                    <span>â€¢</span>
                    <span>Due: <strong className="text-amber-600 font-semibold">{task.dueDate}</strong></span>
                    <span>â€¢</span>
                    <span>Est. Hours: <strong className="text-slate-700 font-semibold">{task.estimatedHours}h</strong></span>
                    {task.completedAt && (
                      <>
                        <span>â€¢</span>
                        <span className="text-emerald-600 font-semibold">Completed: {task.completedAt}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Task Actions */}
                <div className="flex items-center space-x-2 shrink-0 pt-2 md:pt-0">
                  {task.status === 'To Do' && (
                    <Button variant="secondary" size="sm" onClick={() => handleStartTask(task.id)}>
                      <PlayCircle className="w-3.5 h-3.5 mr-1 text-indigo-600" /> Start Task
                    </Button>
                  )}

                  {task.status === 'In Progress' && (
                    <Button variant="primary" size="sm" onClick={() => handleCompleteTask(task.id)}>
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Mark Completed
                    </Button>
                  )}

                  {task.status === 'Blocked' && (
                    <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2.5 py-1 rounded border border-rose-100">
                      Action Blocked
                    </span>
                  )}

                  <Link to={`/student/tasks/${task.id}`}>
                    <Button variant="outline" size="sm">
                      <Eye className="w-3.5 h-3.5 mr-1" /> Details
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<CheckSquare className="w-6 h-6 text-slate-400" />}
          title="No Tasks Found"
          description="No assigned tasks match your current search query or filter controls."
          action={
            <Button variant="primary" size="sm" onClick={handleResetFilters}>
              Reset Search & Filters
            </Button>
          }
        />
      )}
    </div>
  );
};