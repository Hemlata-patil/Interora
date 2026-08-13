import React from 'react';
import { PageHeader, StatCard, Card, Alert, Badge } from '@/components';
import { Users, Building2, Award, BarChart3 } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="System Admin Portal"
        description="Platform-wide oversight of users, departments, certificates, system analytics, and AI services."
      />

      <Alert type="info" title="Phase Foundation Notice">
        Admin administration shell initialized. System-wide management and Supabase edge service monitors will be connected in phase 2.
      </Alert>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Users" value="142 Users" icon={Users} description="Students, Faculty, Mentors" />
        <StatCard title="Partner Companies" value="15 Companies" icon={Building2} description="Verified industry partners" />
        <StatCard title="Certificates Issued" value="48 Certificates" icon={Award} description="QR verified" />
        <StatCard title="System Health" value="100% Operational" icon={BarChart3} trend={{ value: 'All services online', isPositive: true }} />
      </div>

      <Card title="System Overview & Departments">
        <div className="space-y-3">
          <div className="p-3 bg-slate-50 rounded-lg flex items-center justify-between text-xs">
            <div>
              <span className="font-semibold text-slate-800 block">Computer Science & Engineering</span>
              <span className="text-slate-500">85 Enrolled Students • 6 Faculty Mentors</span>
            </div>
            <Badge variant="emerald">Active</Badge>
          </div>
        </div>
      </Card>
    </div>
  );
};
