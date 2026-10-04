import React, { useState, useEffect, useCallback } from 'react';
import { PageHeader, StatCard, Card, Badge, Button } from '@/components';
import { Users, CheckSquare, FileCheck2, Clock, Activity, ChevronRight, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  fetchCompanyMentorInternsBackend,
  fetchCompanyMentorTasksBackend,
  fetchCompanyMentorMetricsBackend,
  type CompanyMentorInternRecord,
  type CompanyMentorTaskRecord,
  type CompanyMentorDashboardMetrics,
} from '@/services/api/backendService';

export const MentorDashboard: React.FC = () => {
  const navigate = useNavigate();

  const [interns, setInterns] = useState<CompanyMentorInternRecord[]>([]);
  const [tasks, setTasks] = useState<CompanyMentorTaskRecord[]>([]);
  const [metrics, setMetrics] = useState<CompanyMentorDashboardMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const loadDashboard = useCallback(async () => {
    try {
      const [remoteInterns, remoteTasks, remoteMetrics] = await Promise.all([
        fetchCompanyMentorInternsBackend(),
        fetchCompanyMentorTasksBackend(),
        fetchCompanyMentorMetricsBackend(),
      ]);
      setInterns(remoteInterns);
      setTasks(remoteTasks);
      setMetrics(remoteMetrics);
    } catch (err) {
      console.error('[MentorDashboard] Failed to load dashboard data:', err);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      setLoading(true);
      await loadDashboard();
      if (isMounted) setLoading(false);
    };

    init();

    // Focus-based and visibility-based refresh (Realtime channel removed for Express/PostgreSQL migration)
    const handleFocus = () => {
      loadDashboard();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadDashboard();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      isMounted = false;
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [loadDashboard]);

  // Compute metrics from backend metrics response with fallback to array lengths
  const totalInterns = metrics?.totalInterns ?? interns.length;
  const totalTasks = metrics?.totalTasks ?? tasks.length;
  const completedTasks = metrics?.completedTasks ?? tasks.filter((t) => t.completed).length;
  const pendingReviews =
    metrics?.pendingReviews ??
    tasks.filter((t) => t.completed && t.reviewStatus !== 'Verified').length;
  const verifiedTasks =
    metrics?.verifiedTasks ?? tasks.filter((t) => t.reviewStatus === 'Verified').length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-8">
      <PageHeader
        title="Host Mentor Workspace"
        description="Monitor assigned active interns, review submitted daily tasks, and verify work deliverables."
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadDashboard()}
            disabled={loading}
            className="flex items-center space-x-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Assigned Interns"
          value={totalInterns.toString()}
          icon={Users}
          description="Active mentorship cohort"
        />
        <StatCard
          title="Total Tasks Logged"
          value={totalTasks.toString()}
          icon={CheckSquare}
          description={`${completedTasks} Finished`}
        />
        <StatCard
          title="Pending Task Reviews"
          value={pendingReviews.toString()}
          icon={Clock}
          description="Awaiting mentor verification"
        />
        <StatCard
          title="Verified Deliverables"
          value={verifiedTasks.toString()}
          icon={FileCheck2}
          trend={{ value: '100% Quality', isPositive: true }}
        />
      </div>

      {/* Active Cohort Section */}
      <Card title="Active Mentorship Cohort" subtitle="Live active interns assigned to host mentorship">
        {interns.length > 0 ? (
          <div className="space-y-3">
            {interns.map((item) => (
              <div
                key={item.assignmentId}
                className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between text-xs"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-indigo-100 text-indigo-700 font-bold rounded-full flex items-center justify-center text-sm">
                    {item.studentName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{item.studentName}</h4>
                    <p className="text-slate-500 text-[11px]">
                      {item.internshipTitle} • {item.companyName}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge variant="emerald">
                    <Activity className="w-3 h-3 mr-1" /> Active
                  </Badge>
                  <Button variant="outline" size="sm" onClick={() => navigate('/company-mentor/my-interns')}>
                    View Intern <ChevronRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic text-center py-6">
            {loading ? 'Loading assigned interns...' : 'No active interns assigned to mentor cohort yet.'}
          </p>
        )}
      </Card>
    </div>
  );
};
