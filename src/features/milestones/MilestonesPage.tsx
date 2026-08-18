import React, { useState } from 'react';
import { PageHeader, Card, Badge } from '@/components';
import { initialMockMilestones } from './data/mockMilestones';
import type { StudentInternshipStatus } from '@/features/student/types/studentJourneyTypes';
import { getStudentFeatureAvailability } from '@/features/student/utils/studentJourneyUtils';
import { RestrictedFeatureGuard } from '@/features/student/components/RestrictedFeatureGuard';

export const MilestonesPage: React.FC = () => {
  const [studentStatus] = useState<StudentInternshipStatus>('ACTIVE');
  const permissions = getStudentFeatureAvailability(studentStatus);
  const [milestones] = useState(initialMockMilestones);

  if (!permissions.canAccessMilestones) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Milestones & Evaluations"
          description="Track official milestone deliverables, faculty evaluations, and industry feedback ratings."
        />
        <RestrictedFeatureGuard title="Internship Milestones & Evaluations Unavailable" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Milestones & Evaluations"
        description="Track official milestone deliverables, faculty evaluations, and industry feedback ratings."
      />

      <div className="grid grid-cols-1 gap-4">
        {milestones.map((m) => (
          <Card key={m.id} className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{m.title}</h4>
                <p className="text-slate-500">{m.description}</p>
              </div>
              <Badge variant={m.status === 'completed' ? 'emerald' : 'indigo'}>{m.status}</Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};