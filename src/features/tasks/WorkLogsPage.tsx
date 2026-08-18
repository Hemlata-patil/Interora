import React, { useState, useMemo } from 'react';
import { PageHeader, StatCard, Card, Badge, Button, Input, Select, Modal, Table, Alert, EmptyState } from '@/components';
import { initialMockWorkLogs, initialMockTasks, type WorkLogRecord } from './data/mockTasks';
import { mockActiveInternshipData } from '@/features/internships/data/mockActiveInternship';
import { Plus, Clock, Calendar, CheckSquare, FileText, AlertCircle, Compass } from 'lucide-react';
import { Link } from 'react-router-dom';

export const WorkLogsPage: React.FC = () => {
  const [workLogs, setWorkLogs] = useState<WorkLogRecord[]>(initialMockWorkLogs);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    date: '2026-08-15',
    taskId: initialMockTasks[5].id,
    hoursWorked: '8.0',
    summary: '',
    completedWork: '',
    blockers: 'None',
    nextPlan: '',
  });

  const [formError, setFormError] = useState<string | null>(null);

  const activeInternship = mockActiveInternshipData;

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

  const handleSubmit = (e: React.FormEvent) => {
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

    const targetTask = initialMockTasks.find((t) => t.id === formData.taskId);

    const newLog: WorkLogRecord = {
      id: `log_${Date.now()}`,
      date: formData.date,
      taskId: formData.taskId,
      taskTitle: targetTask ? targetTask.title : 'General Development Work',
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

    // Reset Form
    setFormData({
      date: '2026-08-15',
      taskId: initialMockTasks[5].id,
      hoursWorked: '8.0',
      summary: '',
      completedWork: '',
      blockers: 'None',
      nextPlan: '',
    });
  };

  if (!activeInternship) {
    return (
      <div className="space-y-6">
        <PageHeader title="Daily Work Logs" description="Record daily activities, hours worked, and project blockers." />
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

  const columns = [
    { key: 'date', header: 'Date', render: (log: WorkLogRecord) => <span className="font-semibold text-slate-800 text-xs">{log.date}</span> },
    { key: 'taskTitle', header: 'Associated Task', render: (log: WorkLogRecord) => <span className="font-medium text-slate-900 text-xs">{log.taskTitle}</span> },
    { key: 'hoursWorked', header: 'Hours', render: (log: WorkLogRecord) => <Badge variant="indigo">{log.hoursWorked}h</Badge> },
    { key: 'completedWork', header: 'Completed Work', render: (log: WorkLogRecord) => <span className="text-slate-700 text-xs">{log.completedWork}</span> },
    { key: 'blockers', header: 'Blockers', render: (log: WorkLogRecord) => <span className="text-slate-500 text-xs">{log.blockers || 'None'}</span> },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Daily Work Logs"
        description="Log your daily completed activities, working hours, and sprint challenges."
        action={
          <Button variant="primary" size="sm" onClick={handleOpenModal}>
            <Plus className="w-4 h-4 mr-1.5" /> Add Work Log
          </Button>
        }
      />

      {saveSuccess && (
        <Alert type="success" title="Work Log Submitted">
          Your work log entry has been added locally. (Supabase persistence ready for future phases).
        </Alert>
      )}

      {/* Summary Stat Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Hours Logged" value={`${stats.totalHours} hrs`} icon={Clock} description="Cumulative internship hours" />
        <StatCard title="Logged Shift Days" value={`${stats.loggedDays} days`} icon={Calendar} description="Recorded daily entries" />
        <StatCard title="Average Hours / Day" value={`${stats.avgHoursPerDay} hrs`} icon={CheckSquare} description="Standard 8-hour shift target" />
        <StatCard title="Current Week Hours" value={`${stats.currentWeekHours} hrs`} icon={FileText} description="This week's active log" />
      </div>

      {/* History Table */}
      <Card title="Work Log Entry History" subtitle="Logged activities for your active internship">
        <div className="overflow-x-auto">
          <Table columns={columns} data={workLogs} keyExtractor={(log) => log.id} />
        </div>
      </Card>

      {/* Add Work Log Modal Form */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Add Daily Work Log"
        description="Record hours worked, work completed, and blockers for today."
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSubmit}>
              Submit Work Log
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {formError && <Alert type="warning" title="Validation Error">{formError}</Alert>}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Log Date *"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />

            <Input
              label="Hours Worked *"
              type="number"
              step="0.5"
              placeholder="e.g. 8.0"
              value={formData.hoursWorked}
              onChange={(e) => setFormData({ ...formData, hoursWorked: e.target.value })}
              required
            />
          </div>

          <Select
            label="Associated Task *"
            value={formData.taskId}
            onChange={(e) => setFormData({ ...formData, taskId: e.target.value })}
            options={initialMockTasks.map((t) => ({ value: t.id, label: t.title }))}
          />

          <div className="space-y-1">
            <label className="block font-semibold text-slate-700">Completed Work Summary *</label>
            <textarea
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="Summarize the tasks, features, or bug fixes completed today..."
              value={formData.completedWork}
              onChange={(e) => setFormData({ ...formData, completedWork: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Blockers / Challenges"
              placeholder="e.g. Awaiting API endpoints (or None)"
              value={formData.blockers}
              onChange={(e) => setFormData({ ...formData, blockers: e.target.value })}
            />

            <Input
              label="Next Plan / Tomorrow Target"
              placeholder="e.g. Complete component integration tests"
              value={formData.nextPlan}
              onChange={(e) => setFormData({ ...formData, nextPlan: e.target.value })}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};