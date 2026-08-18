import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { PageHeader, Card, Badge, Button, Input, EmptyState } from '@/components';
import { initialMockTasks, type TaskRecord, type TaskStatus, type TaskPriority } from './data/mockTasks';
import { ArrowLeft, CheckCircle2, PlayCircle, Clock, UserCheck, AlertCircle, Calendar } from 'lucide-react';

export const TaskDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState<TaskRecord[]>(initialMockTasks);
  const task = tasks.find((t) => t.id === id);

  if (!task) {
    return (
      <div className="space-y-6">
        <PageHeader title="Task Not Found" description="The requested task item could not be located." />
        <Card>
          <div className="p-8 text-center space-y-4">
            <p className="text-xs text-slate-500">The task may have been removed or the task ID is invalid.</p>
            <Link to="/student/tasks">
              <Button variant="primary" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Daily Tasks
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const handleStartTask = () => {
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: 'In Progress' as TaskStatus } : t))
    );
  };

  const handleCompleteTask = () => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === task.id
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

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <button
          onClick={() => navigate('/student/tasks')}
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-3 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Daily Tasks
        </button>
        <PageHeader
          title={task.title}
          description={`Task ID: ${task.id} â€¢ Assigned on ${task.assignedDate}`}
          action={
            <div className="flex space-x-2">
              {task.status === 'To Do' && (
                <Button variant="secondary" size="sm" onClick={handleStartTask}>
                  <PlayCircle className="w-4 h-4 mr-1 text-indigo-600" /> Start Task
                </Button>
              )}

              {task.status === 'In Progress' && (
                <Button variant="primary" size="sm" onClick={handleCompleteTask}>
                  <CheckCircle2 className="w-4 h-4 mr-1" /> Mark Completed
                </Button>
              )}
            </div>
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Description */}
          <Card title="Task Description & Objectives">
            <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
              <p>{task.description}</p>

              {task.notes && (
                <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-lg space-y-1">
                  <span className="text-[11px] font-bold text-slate-900 block">Student & Mentor Notes</span>
                  <p className="text-slate-600">{task.notes}</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right 1 Column */}
        <div className="space-y-6">
          <Card title="Task Overview & Status">
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-slate-500">Current Status</span>
                {getStatusBadge(task.status)}
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-slate-500">Priority Level</span>
                {getPriorityBadge(task.priority)}
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-slate-500">Category</span>
                <span className="font-semibold text-slate-900">{task.category}</span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-slate-500">Assigned By</span>
                <span className="font-semibold text-slate-900">{task.assignedBy}</span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-slate-500">Due Date</span>
                <span className="font-semibold text-amber-600">{task.dueDate}</span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-slate-500">Est. / Actual Hours</span>
                <span className="font-semibold text-slate-900">{`${task.estimatedHours}h Est. / ${task.actualHours}h Actual`}</span>
              </div>

              {task.completedAt && (
                <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-800 space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-emerald-700 block">Completion Timestamp</span>
                  <span className="font-semibold text-xs">{task.completedAt}</span>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};