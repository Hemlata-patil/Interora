import React from 'react';
import { PageHeader, StatCard, Card, Alert, Badge } from '@/components';
import { Users, FileCheck, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const FacultyDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Faculty Mentor Portal"
        description="Monitor assigned student internships, review applications, and track risk metrics."
      />

      <Alert type="info" title="Phase Foundation Notice">
        Faculty monitoring workflows and application approval channels are initialized. Supabase tables will connect in the next phase.
      </Alert>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Assigned Students" value="28 Students" icon={Users} description="Computer Science Dept." />
        <StatCard title="Pending Approvals" value="4 Pending" icon={FileCheck} description="Requires faculty review" />
        <StatCard title="At-Risk Alerts" value="2 Students" icon={AlertTriangle} trend={{ value: 'Needs attention', isPositive: false }} />
        <StatCard title="Completed Internships" value="12 Completed" icon={CheckCircle2} description="Current academic year" />
      </div>

      <Card title="Pending Application Approvals">
        <div className="space-y-3">
          <div className="p-3 bg-slate-50 rounded-lg flex items-center justify-between text-xs">
            <div>
              <span className="font-semibold text-slate-800 block">Alex Johnson</span>
              <span className="text-slate-500">Applied to Acme Corp • Full Stack Intern</span>
            </div>
            <Badge variant="amber">Pending Review</Badge>
          </div>
        </div>
      </Card>
    </div>
  );
};
