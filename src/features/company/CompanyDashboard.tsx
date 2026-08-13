import React from 'react';
import { PageHeader, StatCard, Card, Alert, Badge } from '@/components';
import { Briefcase, Users, CheckSquare, Award } from 'lucide-react';

export const CompanyDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Company & Industry Mentor Portal"
        description="Manage internship listings, review applicants, assign tasks, and evaluate interns."
      />

      <Alert type="info" title="Phase Foundation Notice">
        Company mentor tools and applicant selection pipeline initialized. Database persistence will follow in the next phase.
      </Alert>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Active Listings" value="3 Listings" icon={Briefcase} description="2 Open for applications" />
        <StatCard title="Total Applicants" value="18 Applicants" icon={Users} description="Across all active listings" />
        <StatCard title="Active Interns" value="5 Interns" icon={Users} description="Currently under supervision" />
        <StatCard title="Evaluations Due" value="1 Pending" icon={CheckSquare} description="Mid-term evaluation" />
      </div>

      <Card title="Active Internships Overview">
        <div className="space-y-3">
          <div className="p-3 bg-slate-50 rounded-lg flex items-center justify-between text-xs">
            <div>
              <span className="font-semibold text-slate-800 block">Frontend Engineering Intern</span>
              <span className="text-slate-500">2 Interns assigned • 8 Weeks remaining</span>
            </div>
            <Badge variant="indigo">Active</Badge>
          </div>
        </div>
      </Card>
    </div>
  );
};
