import React, { useState, useEffect, useCallback } from 'react';
import { PageHeader, StatCard, Card, Badge, ProgressBar, Button } from '@/components';
import { Sparkles, Compass, CheckSquare, Award, Clock, ArrowRight, UserCheck, CheckCircle2, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  initialActiveInternshipData,
  initialApplicationSummaryData,
  type ActiveInternshipData,
  type ApplicationSummaryData,
} from './data/mockStudentData';
import {
  fetchActiveStudentInternshipBackend,
  fetchStudentActiveInternshipMetricsBackend,
  fetchStudentApplicationsBackend,
  fetchStudentPlacementReadinessBackend,
  getCurrentUserBackend,
} from '@/services/api/backendService';

export const StudentDashboard: React.FC = () => {
  const [activeInternship, setActiveInternship] = useState<ActiveInternshipData>(initialActiveInternshipData);
  const [appSummary, setAppSummary] = useState<ApplicationSummaryData>(initialApplicationSummaryData);
  const [readinessScore, setReadinessScore] = useState<number>(78);
  const [studentName, setStudentName] = useState<string>('Student');

  const loadData = useCallback(async () => {
    try {
      const [user, active, apps, readiness] = await Promise.all([
        getCurrentUserBackend().catch(() => null),
        fetchActiveStudentInternshipBackend().catch(() => null),
        fetchStudentApplicationsBackend().catch(() => []),
        fetchStudentPlacementReadinessBackend().catch(() => null),
      ]);

      if (user?.fullName) {
        setStudentName(user.fullName.split(' ')[0] || user.fullName);
      }

      if (active) {
        let metrics = {
          attendancePercentage: 92,
          totalTasks: 12,
          completedTasks: 8,
          healthScore: 88,
        };
        if (active.assignmentId) {
          try {
            const m = await fetchStudentActiveInternshipMetricsBackend(active.assignmentId);
            metrics = {
              attendancePercentage: m.attendancePercentage ?? 92,
              totalTasks: m.totalTasks ?? 12,
              completedTasks: m.completedTasks ?? 8,
              healthScore: (m as any).healthScore ?? 88,
            };
          } catch {
            // Retain metrics
          }
        }

        const progress = metrics.totalTasks > 0 ? Math.round((metrics.completedTasks / metrics.totalTasks) * 100) : 60;

        setActiveInternship({
          id: active.assignmentId || 'assigned_active',
          title: active.title || 'Software Engineering Intern',
          companyName: active.companyName || 'Host Company',
          mentorName: active.mentorName || 'Assigned Mentor',
          mentorEmail: active.mentorEmail || 'mentor@interora.app',
          startDate: active.startDate || '2026-06-01',
          endDate: active.endDate || '2026-08-31',
          status: 'active',
          progressPercentage: progress,
          attendancePercentage: metrics.attendancePercentage,
          completedTasks: metrics.completedTasks,
          totalTasks: metrics.totalTasks,
          healthScore: metrics.healthScore,
          currentMilestone: 'Sprint Execution & Task Delivery',
        });
      }

      if (Array.isArray(apps)) {
        const total = apps.length;
        let underReview = 0;
        let facultyApproved = 0;
        let selected = 0;
        let rejected = 0;

        const recent = apps.slice(0, 3).map((a) => {
          const s = (a.status || '').toLowerCase();
          let mappedStatus: ApplicationSummaryData['recentApplications'][0]['status'] = 'under_review';
          if (s.includes('select')) {
            selected++;
            mappedStatus = 'selected';
          } else if (s.includes('approved')) {
            facultyApproved++;
            mappedStatus = 'faculty_approved';
          } else if (s.includes('reject')) {
            rejected++;
            mappedStatus = 'rejected';
          } else {
            underReview++;
            mappedStatus = 'under_review';
          }

          return {
            id: a.id,
            title: a.internshipTitle || 'Internship Opportunity',
            company: a.companyName || 'Host Company',
            appliedDate: a.appliedAt ? new Date(a.appliedAt).toISOString().slice(0, 10) : 'Recent',
            status: mappedStatus,
          };
        });

        apps.slice(3).forEach((a) => {
          const s = (a.status || '').toLowerCase();
          if (s.includes('select')) selected++;
          else if (s.includes('approved')) facultyApproved++;
          else if (s.includes('reject')) rejected++;
          else underReview++;
        });

        if (total > 0) {
          setAppSummary({
            total,
            underReview,
            facultyApproved,
            selected,
            rejected,
            recentApplications: recent,
          });
        }
      }

      if (readiness?.readinessScore || readiness?.overallScore) {
        setReadinessScore(readiness.readinessScore || readiness.overallScore);
      }
    } catch (err) {
      console.error('[StudentDashboard] Error loading dashboard data:', err);
    }
  }, []);

  useEffect(() => {
    loadData();
    const handleFocus = () => loadData();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [loadData]);

  const getStatusBadge = (status: ApplicationSummaryData['recentApplications'][0]['status']) => {
    switch (status) {
      case 'selected':
        return <Badge variant="emerald">Selected</Badge>;
      case 'faculty_approved':
        return <Badge variant="sky">Faculty Approved</Badge>;
      case 'under_review':
        return <Badge variant="amber">Under Review</Badge>;
      case 'rejected':
        return <Badge variant="rose">Rejected</Badge>;
      default:
        return <Badge variant="neutral">Applied</Badge>;
    }
  };

  const actions = [
    {
      id: 'act_01',
      title: 'Submit Daily Work Log',
      description: 'Log progress and hours for component integration sprint',
      dueDate: 'Today, 6:00 PM',
      type: 'log',
      linkPath: '/student/work-logs',
    },
    {
      id: 'act_02',
      title: 'Complete Assigned Daily Task',
      description: 'Build Student Daily Tasks & Work Logs module components',
      dueDate: 'Today, 5:00 PM',
      type: 'task',
      linkPath: '/student/tasks',
    },
    {
      id: 'act_03',
      title: 'Complete Profile Details',
      description: 'Add GitHub profile and project links to reach 100% completion',
      dueDate: 'In 2 days',
      type: 'profile',
      linkPath: '/student/profile',
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Context Header */}
      <PageHeader
        title={`Welcome back, ${studentName}!`}
        description="Track your active internship journey, application pipeline, and upcoming tasks."
        action={
          <Link to="/student/profile">
            <Button variant="outline" size="sm">
              View Profile (85% Complete)
            </Button>
          </Link>
        }
      />

      {/* Quick Key Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/student/internship" className="block transition-transform hover:-translate-y-0.5">
          <StatCard title="Active Internship" value={activeInternship.title.split(' ')[0] + ' Intern'} icon={Compass} description={activeInternship.companyName} />
        </Link>
        <Link to="/student/attendance" className="block transition-transform hover:-translate-y-0.5">
          <StatCard title="Attendance Rate" value={`${activeInternship.attendancePercentage}%`} icon={CheckSquare} trend={{ value: 'Optimal (Above 90%)', isPositive: true }} />
        </Link>
        <StatCard title="Placement Readiness" value={`${readinessScore} / 100`} icon={Sparkles} description="Good alignment" />
        <Link to="/student/applications" className="block transition-transform hover:-translate-y-0.5">
          <StatCard title="Total Applications" value={appSummary.total} icon={Award} description={`${appSummary.selected} Selected • ${appSummary.underReview + appSummary.facultyApproved} Active`} />
        </Link>
      </div>

      {/* 2. Primary Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Internship Status Card */}
          <Card title="Active Internship Journey">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-base font-bold text-slate-900 hover:text-indigo-600 transition-colors">
                      <Link to="/student/internship">{activeInternship.title}</Link>
                    </h3>
                    <Badge variant="emerald">Active</Badge>
                  </div>
                  <p className="text-xs font-medium text-indigo-600 mt-0.5">{activeInternship.companyName}</p>
                </div>
                <div className="text-xs text-slate-500 space-y-1">
                  <div className="flex items-center space-x-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                    <span>Mentor: {activeInternship.mentorName}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{`${activeInternship.startDate} to ${activeInternship.endDate}`}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-700">Current Milestone:</span>
                  <span className="text-slate-600">{activeInternship.currentMilestone}</span>
                </div>
                <ProgressBar progress={activeInternship.progressPercentage} label="Overall Internship Progress" color="indigo" />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                  <span className="text-slate-500 block text-[11px]">Tasks Progress</span>
                  <span className="text-sm font-bold text-slate-900">{`${activeInternship.completedTasks} / ${activeInternship.totalTasks} Tasks Completed`}</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                  <span className="text-slate-500 block text-[11px]">Health Score Signal</span>
                  <span className="text-sm font-bold text-emerald-600">{`${activeInternship.healthScore} / 100 (Optimal Status)`}</span>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap justify-end gap-2">
                <Link to="/student/tasks">
                  <Button variant="outline" size="sm">
                    <CheckSquare className="w-3.5 h-3.5 mr-1" /> View Tasks
                  </Button>
                </Link>
                <Link to="/student/work-logs">
                  <Button variant="outline" size="sm">
                    <FileText className="w-3.5 h-3.5 mr-1" /> Work Logs
                  </Button>
                </Link>
                <Link to="/student/internship">
                  <Button variant="primary" size="sm">
                    My Internship <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          </Card>

          {/* Applications Pipeline Summary Card */}
          <Card title="Applications Summary" subtitle="Overview of submitted internship applications">
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg">
                  <span className="text-slate-400 block text-[10px]">TOTAL</span>
                  <span className="text-base font-bold text-slate-800">{appSummary.total}</span>
                </div>
                <div className="p-2.5 bg-amber-50/50 border border-amber-100 rounded-lg">
                  <span className="text-amber-600 block text-[10px]">REVIEW</span>
                  <span className="text-base font-bold text-amber-700">{appSummary.underReview}</span>
                </div>
                <div className="p-2.5 bg-sky-50/50 border border-sky-100 rounded-lg">
                  <span className="text-sky-600 block text-[10px]">APPROVED</span>
                  <span className="text-base font-bold text-sky-700">{appSummary.facultyApproved}</span>
                </div>
                <div className="p-2.5 bg-emerald-50/50 border border-emerald-100 rounded-lg">
                  <span className="text-emerald-600 block text-[10px]">SELECTED</span>
                  <span className="text-base font-bold text-emerald-700">{appSummary.selected}</span>
                </div>
              </div>

              <div className="space-y-2">
                {appSummary.recentApplications.map((app) => (
                  <div key={app.id} className="p-3 bg-slate-50/80 rounded-lg flex items-center justify-between text-xs border border-slate-100">
                    <div>
                      <h4 className="font-semibold text-slate-800">{app.title}</h4>
                      <p className="text-[11px] text-slate-500">{`${app.company} - Applied on ${app.appliedDate}`}</p>
                    </div>
                    {getStatusBadge(app.status)}
                  </div>
                ))}
              </div>

              <div className="pt-1 flex justify-end">
                <Link to="/student/applications">
                  <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-700">
                    View All Applications <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>

        {/* Right 1 Column */}
        <div className="space-y-6">
          {/* Action Required Card */}
          <Card title="Action Required" subtitle="Pending items for your attention">
            <div className="space-y-3">
              {actions.map((act) => (
                <div key={act.id} className="p-3 border border-slate-100 rounded-lg space-y-1 hover:border-slate-300 transition-colors">
                  <div className="flex items-start justify-between">
                    <h5 className="text-xs font-semibold text-slate-900">{act.title}</h5>
                    <span className="text-[10px] font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded">{act.dueDate}</span>
                  </div>
                  <p className="text-[11px] text-slate-500">{act.description}</p>
                  <Link to={act.linkPath} className="inline-flex items-center text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 pt-1">
                    Take Action <ArrowRight className="w-3 h-3 ml-1" />
                  </Link>
                </div>
              ))}
            </div>
          </Card>

          {/* AI / Career Preview Card */}
          <Card title="AI Intelligence Preview" subtitle="Career and Skill Gap Insights">
            <div className="space-y-3 text-xs text-slate-600">
              <div className="p-3 bg-indigo-50/60 rounded-lg border border-indigo-100 space-y-1">
                <div className="flex items-center space-x-1.5 text-indigo-900 font-semibold">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>Skill-Gap Analysis</span>
                </div>
                <p className="text-[11px] text-indigo-800 leading-relaxed">
                  Your profile matches 85% of active Software Engineering requirements. Consider adding Docker and CI/CD basics to increase match score.
                </p>
              </div>

              <div className="p-3 bg-emerald-50/60 rounded-lg border border-emerald-100 space-y-1">
                <div className="flex items-center space-x-1.5 text-emerald-900 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Weekly Report Drafter</span>
                </div>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  4 work logs recorded this week. AI weekly report draft generation will be ready on Friday.
                </p>
              </div>

              <p className="text-[10px] text-slate-400 text-center italic pt-1">
                Full AI module edge functions will connect in future phases.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};