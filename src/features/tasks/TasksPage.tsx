import React, { useState } from 'react';
import { PageHeader, Card, Badge } from '@/components';
import { initialMockTasks } from './data/mockTasks';
import type { StudentInternshipStatus } from '@/features/student/types/studentJourneyTypes';
import { getStudentFeatureAvailability } from '@/features/student/utils/studentJourneyUtils';
import { RestrictedFeatureGuard } from '@/features/student/components/RestrictedFeatureGuard';

export const TasksPage: React.FC = () => {
  const [studentStatus] = useState<StudentInternshipStatus>('ACTIVE');
  const permissions = getStudentFeatureAvailability(studentStatus);
  const [tasks] = useState(initialMockTasks);

  if (!permissions.isProductivityActive) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Daily Internship Productivity & Tasks"
          description="Manage daily sprint tasks, submit work logs, and log work hours."
        />
        <RestrictedFeatureGuard title="Internship Productivity & Tasks Unavailable" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Daily Internship Productivity & Tasks"
        description="Manage daily sprint tasks, submit work logs, and log work hours."
      />

      <div className="grid grid-cols-1 gap-4">
        {tasks.map((task) => (
          <Card key={task.id} className="p-4 hover:border-slate-300 transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h4 className="font-bold text-slate-900 text-sm">{task.title}</h4>
                  <Badge variant={task.status === 'Completed' ? 'emerald' : 'indigo'}>{task.status}</Badge>
                </div>
                <p className="text-slate-500">{task.description}</p>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">Due: {task.dueDate}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
