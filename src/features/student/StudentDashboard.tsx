import React from 'react';
import { PageHeader, StatCard, Card, Alert, Badge } from '@/components';
import { Sparkles, Compass, CheckSquare, Award } from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Dashboard"
        description="Welcome to Interora — Track your internship lifecycle, applications, and performance."
      />

      <Alert type="info" title="Phase Foundation Notice">
        This is a placeholder UI confirming routing and layout integration. Full Supabase backend integration, real-time metrics, and AI recommendations will be added in upcoming feature branches.
      </Alert>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Active Internship" value="1 Active" icon={Compass} description="Software Engineering Intern" />
        <StatCard title="Attendance Rate" value="94%" icon={CheckSquare} trend={{ value: 'Above 90% threshold', isPositive: true }} />
        <StatCard title="Readiness Score" value="78 / 100" icon={Sparkles} description="Placement Readiness" />
        <StatCard title="Certificates" value="0 Available" icon={Award} description="Pending completion" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Current Internship Status" className="lg:col-span-2">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h4 className="text-sm font-semibold text-slate-900">TechCorp Solutions</h4>
                <p className="text-xs text-slate-500">Frontend Development Intern • 12 Weeks</p>
              </div>
              <Badge variant="emerald">Active</Badge>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Work logs and daily attendance check-ins are enabled. Complete assigned weekly tasks to maintain a high Internship Health Score.
            </p>
          </div>
        </Card>

        <Card title="AI Intelligence Summary">
          <div className="space-y-3 text-xs text-slate-600">
            <div className="p-3 bg-indigo-50/50 rounded-lg border border-indigo-100">
              <span className="font-semibold text-indigo-900 block mb-0.5">Skill Match Recommendation</span>
              React & TypeScript skills match 85% of active tech listings.
            </div>
            <p className="text-slate-400 italic text-[11px] text-center pt-2">
              Full AI module coming in next phase.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};
