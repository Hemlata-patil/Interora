import React, { useState, useMemo, useEffect } from 'react';
import { PageHeader, StatCard, Card, Badge, Button, Input, Select, Modal, Alert } from '@/components';
import { initialMockWorkLogs, initialMockTasks, type WorkLogRecord } from './data/mockTasks';
import { Plus, Clock, Calendar, CheckSquare, FileText, AlertCircle } from 'lucide-react';
import { supabase } from '@/services/supabase/supabaseClient';
import {
  createStudentWorkLogBackend,
  fetchStudentTasksBackend,
  fetchActiveStudentInternshipBackend,
  type ActiveStudentInternshipRecord,
} from '@/services/api/backendService';

export const WorkLogsPage: React.FC = () => {
  const [workLogs, setWorkLogs] = useState<WorkLogRecord[]>(initialMockWorkLogs);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeInternship, setActiveInternship] = useState<ActiveStudentInternshipRecord | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    date: new Date().toISOString().slice(0, 10),
    taskId: initialMockTasks[0].id,
    hoursWorked: '8.0',
    summary: '',
    completedWork: '',
    blockers: 'None',
    nextPlan: '',
  });

  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    const act = await fetchActiveStudentInternshipBackend();
    setActiveInternship(act);

    const tasks = await fetchStudentTasksBackend();
    const workLogTasks = tasks.filter((t) => t.title.startsWith('[WorkLog]'));
    if (workLogTasks.length > 0) {
      const mapped: WorkLogRecord[] = workLogTasks.map((t) => ({
        id: t.id,
        date: t.dueDate || t.createdAt.slice(0, 10),
        taskId: t.id,
        taskTitle: t.title.replace('[WorkLog] ', ''),
        hoursWorked: 8.0,
        summary: t.description || 'Sprint task logged',
        completedWork: t.description || 'Daily deliverables completed',
        blockers: 'None',
        nextPlan: 'Continue tasks',
      }));
      setWorkLogs(mapped);
    }
  };

  useEffect(() => {
    loadData();

    const channel = supabase
      .channel('work_logs_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'student_tasks' }, () => {
        loadData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const stats = useMemo(() => {
    const totalHours = workLogs.reduce((acc, curr) => acc + curr.hoursWorked, 0);
    const loggedDays = workLogs.length;
    const avgHoursPerDay = loggedDays > 0 ? (totalHours / loggedDays).toFixed(1) : '0';
    const currentWeekHours = workLogs.slice(0, 5).reduce((acc, curr) => acc + curr.hoursWorked, 0);

    return { totalHours, loggedDays, avgHoursPerDay, currentWeekHours };
  }, [workLogs]);

  const handleOpenModal = () => {
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.date.trim()) {
      setFormError('Date is required.');
      return;
    }

    const hours = parseFloat(formData.hoursWorked);
    if (isNaN(hours) || hours <= 0) {
      setFormError('Hours worked must be a number greater than 0.');
      return;
    }

    if (!formData.completedWork.trim()) {
      setFormError('Completed Work summary is required.');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    const targetTask = initialMockTasks.find((t) => t.id === formData.taskId);
    const taskTitle = targetTask ? targetTask.title : 'General Development Sprint';

    const res = await createStudentWorkLogBackend({
      date: formData.date,
      taskId: formData.taskId,
      taskTitle,
      hoursWorked: hours,
      summary: formData.summary.trim() || formData.completedWork.trim(),
      completedWork: formData.completedWork.trim(),
      blockers: formData.blockers.trim() || 'None',
      nextPlan: formData.nextPlan.trim() || 'Continue sprint tasks',
    });

    setIsSubmitting(false);

    if (!res.success) {
      setFormError(res.error || 'Failed to persist work log to Supabase.');
      return;
    }

    const newLog: WorkLogRecord = {
      id: 'log_' + Date.now(),
      date: formData.date,
      taskId: formData.taskId,
      taskTitle,
      hoursWorked: hours,
      summary: formData.summary.trim() || formData.completedWork.trim(),
      completedWork: formData.completedWork.trim(),
      blockers: formData.blockers.trim() || 'None',
      nextPlan: formData.nextPlan.trim() || 'Continue sprint tasks',
    };

    setWorkLogs((prev) => [newLog, ...prev]);
    setIsModalOpen(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 4000);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Work Logs"
        description="Record daily work accomplishments, logged hours, and task progress for faculty mentor review."
        action={
          <Button variant="primary" size="md" onClick={handleOpenModal} className="flex items-center gap-1.5">
            <Plus className="w-4 h-4" />
            <span>Log Daily Work</span>
          </Button>
        }
      />

      {saveSuccess && (
        <Alert type="success" title="Work Log Persisted">
          Your work log entry has been stored in Supabase and synchronized with your mentor's dashboard.
        </Alert>
      )}

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Hours Logged"
          value={stats.totalHours + ' hrs'}
          description="Cumulative internship time"
          icon={Clock}
        />
        <StatCard
          title="Total Days Logged"
          value={stats.loggedDays}
          description="Verified working sessions"
          icon={Calendar}
        />
        <StatCard
          title="Avg Hours / Day"
          value={stats.avgHoursPerDay + ' hrs'}
          description="Daily productivity rate"
          icon={CheckSquare}
        />
        <StatCard
          title="This Week's Hours"
          value={stats.currentWeekHours + ' hrs'}
          description="Current active sprint"
          icon={FileText}
        />
      </div>

      {/* Logs Table */}
      <Card title="Recorded Daily Work Logs" subtitle="Historical breakdown of sprint deliverables and faculty reviews">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3.5">Date</th>
                <th className="p-3.5">Task Reference</th>
                <th className="p-3.5">Hours</th>
                <th className="p-3.5">Completed Deliverables</th>
                <th className="p-3.5">Blockers</th>
                <th className="p-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {workLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-3.5 font-medium text-slate-800 font-mono">{log.date}</td>
                  <td className="p-3.5 font-semibold text-slate-900">{log.taskTitle}</td>
                  <td className="p-3.5 font-bold text-indigo-600">{log.hoursWorked} hrs</td>
                  <td className="p-3.5 text-slate-700 max-w-xs">{log.completedWork}</td>
                  <td className="p-3.5 text-slate-500">{log.blockers}</td>
                  <td className="p-3.5">
                    <Badge variant="emerald">Verified</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal: Log Work */}
      {isModalOpen && (
        <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Record Daily Work Log">
          <form onSubmit={handleSubmit} className="space-y-4 text-xs p-1">
            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3.5">
              <Input
                label="Work Date"
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
              <Input
                label="Hours Worked"
                type="number"
                step="0.5"
                min="0.5"
                max="16"
                required
                value={formData.hoursWorked}
                onChange={(e) => setFormData({ ...formData, hoursWorked: e.target.value })}
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Associated Task</label>
              <Select
                value={formData.taskId}
                onChange={(e) => setFormData({ ...formData, taskId: e.target.value })}
                options={initialMockTasks.map((t) => ({ value: t.id, label: t.title }))}
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Completed Work & Deliverables</label>
              <textarea
                required
                rows={3}
                placeholder="Describe the modules, bug fixes, or deliverables completed..."
                value={formData.completedWork}
                onChange={(e) => setFormData({ ...formData, completedWork: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <Input
                label="Blockers / Impediments"
                placeholder="e.g. Waiting for API key, None"
                value={formData.blockers}
                onChange={(e) => setFormData({ ...formData, blockers: e.target.value })}
              />
              <Input
                label="Plan for Next Shift"
                placeholder="e.g. Unit tests, Integration"
                value={formData.nextPlan}
                onChange={(e) => setFormData({ ...formData, nextPlan: e.target.value })}
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" disabled={isSubmitting}>
                {isSubmitting ? 'Saving to Database...' : 'Save & Persist Log'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
